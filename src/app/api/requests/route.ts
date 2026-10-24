import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const status = req.nextUrl.searchParams.get('status');

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: true,
        items: {
          include: {
            item: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { tanggal: 'desc' },
      take: 100,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data permohonan ATK' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, keperluan, items } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Pilih minimal 1 barang untuk diajukan' },
        { status: 400 }
      );
    }

    // Generate unique form number: REQ/BPS-SKH/YYYYMMDD/XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.request.count({
      where: {
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const seq = String(countToday + 1).padStart(3, '0');
    const nomorForm = `REQ/BPS-SKH/${dateStr}/${seq}`;

    const newRequest = await prisma.request.create({
      data: {
        nomorForm,
        userId,
        keperluan: keperluan?.trim() || 'Kebutuhan Operasional Tim Kerja',
        status: 'PENDING',
        items: {
          create: items.map((it: any) => ({
            itemId: it.itemId,
            jumlahDiminta: parseInt(it.jumlah, 10) || 1,
            keterangan: it.keterangan || null,
          })),
        },
      },
      include: {
        user: true,
        items: {
          include: { item: true },
        },
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: 'Gagal mengajukan permohonan ATK' },
      { status: 500 }
    );
  }
}
