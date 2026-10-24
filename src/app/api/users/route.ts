import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        nip: true,
        role: true,
        team: true,
        phone: true,
      },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      email,
      nip,
      team,
      phone,
      password,
      // Optional satker & pejabat fields (editable by ADMIN)
      namaSatker,
      kepalaBpsNama,
      kepalaBpsNip,
      alamat,
    } = body;

    if (!id || !name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'ID, Nama lengkap, dan Email wajib diisi' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      nip: nip?.trim() || null,
      team: team?.trim() || existingUser.team,
      phone: phone?.trim() || null,
    };

    if (password && password.trim().length > 0) {
      updateData.password = password.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        nip: true,
        role: true,
        team: true,
        phone: true,
      },
    });

    // Automatically synchronize Setting & historical admin names so all reports reflect updated Name & NIP
    let updatedSetting = null;
    if (existingUser.role === 'ADMIN') {
      updatedSetting = await prisma.setting.upsert({
        where: { id: 'default' },
        update: {
          pengelolaPersediaanNama: updatedUser.name,
          pengelolaPersediaanNip: updatedUser.nip || '',
          ...(namaSatker !== undefined && namaSatker.trim() ? { namaSatker: namaSatker.trim() } : {}),
          ...(kepalaBpsNama !== undefined && kepalaBpsNama.trim() ? { kepalaBpsNama: kepalaBpsNama.trim() } : {}),
          ...(kepalaBpsNip !== undefined ? { kepalaBpsNip: kepalaBpsNip.trim() } : {}),
          ...(alamat !== undefined ? { alamat: alamat.trim() } : {}),
        },
        create: {
          id: 'default',
          namaSatker: namaSatker?.trim() || 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO',
          kodeUakpb: '054.01.0300.019098',
          kepalaBpsNama: kepalaBpsNama?.trim() || 'Anang Sarwoto, S.Si, MM',
          kepalaBpsNip: kepalaBpsNip?.trim() || '197505271997121001',
          pengelolaPersediaanNama: updatedUser.name,
          pengelolaPersediaanNip: updatedUser.nip || '',
          alamat: alamat?.trim() || 'Jl. Jenderal Sudirman No. 199, Sukoharjo',
        },
      });

      // Sync adminName in StockIn records
      await prisma.stockIn.updateMany({
        where: {
          OR: [
            { adminName: existingUser.name },
            { adminName: 'Admin TU' },
          ],
        },
        data: {
          adminName: updatedUser.name,
        },
      });

      // Sync approvedBy in Request records
      await prisma.request.updateMany({
        where: {
          approvedBy: existingUser.name,
        },
        data: {
          approvedBy: updatedUser.name,
        },
      });
    } else if (existingUser.role === 'KASUBAG') {
      updatedSetting = await prisma.setting.upsert({
        where: { id: 'default' },
        update: {
          kepalaBpsNama: updatedUser.name,
          kepalaBpsNip: updatedUser.nip || '',
        },
        create: {
          id: 'default',
          kepalaBpsNama: updatedUser.name,
          kepalaBpsNip: updatedUser.nip || '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      setting: updatedSetting,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Alamat email sudah digunakan oleh pengguna lain' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Gagal menyimpan perubahan profil pengguna' },
      { status: 500 }
    );
  }
}
