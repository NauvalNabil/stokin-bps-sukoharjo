import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let setting = await prisma.setting.findUnique({
      where: { id: 'default' },
    });

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          id: 'default',
          namaSatker: 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO',
          kodeUakpb: '054.01.0300.019098',
          kepalaBpsNama: 'Anang Sarwoto, S.Si, MM',
          kepalaBpsNip: '197505271997121001',
          pengelolaPersediaanNama: 'Novia Dwima Santi, S.Tr.Stat',
          pengelolaPersediaanNip: '199811062021042001',
          alamat: 'Jl. Jenderal Sudirman No. 199, Sukoharjo',
        },
      });
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan instansi' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      namaSatker,
      kodeUakpb,
      kepalaBpsNama,
      kepalaBpsNip,
      pengelolaPersediaanNama,
      pengelolaPersediaanNip,
      alamat,
    } = body;

    const updatedSetting = await prisma.setting.upsert({
      where: { id: 'default' },
      update: {
        namaSatker,
        kodeUakpb,
        kepalaBpsNama,
        kepalaBpsNip,
        pengelolaPersediaanNama,
        pengelolaPersediaanNip,
        alamat,
      },
      create: {
        id: 'default',
        namaSatker: namaSatker || 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO',
        kodeUakpb: kodeUakpb || '054.01.0300.019098',
        kepalaBpsNama: kepalaBpsNama || 'Anang Sarwoto, S.Si, MM',
        kepalaBpsNip: kepalaBpsNip || '197505271997121001',
        pengelolaPersediaanNama: pengelolaPersediaanNama || 'Novia Dwima Santi, S.Tr.Stat',
        pengelolaPersediaanNip: pengelolaPersediaanNip || '199811062021042001',
        alamat: alamat || 'Jl. Jenderal Sudirman No. 199, Sukoharjo',
      },
    });

    return NextResponse.json({ success: true, setting: updatedSetting });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengaturan' },
      { status: 500 }
    );
  }
}
