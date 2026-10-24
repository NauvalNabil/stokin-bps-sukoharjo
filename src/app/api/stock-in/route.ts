import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stockIns = await prisma.stockIn.findMany({
      include: {
        item: {
          include: { category: true },
        },
      },
      orderBy: { tanggal: 'desc' },
      take: 100,
    });

    return NextResponse.json({ stockIns });
  } catch (error) {
    console.error('Fetch stock-in error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat barang masuk' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, jumlah, sumber, nomorNota, metodePembayaran, hargaSatuan, keterangan, adminName } = body;

    const qty = parseInt(jumlah, 10);
    if (!itemId || isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: 'Jumlah barang masuk harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Atomic transaction: create StockIn record AND increase item's stokSaatIni
    const [newStockIn, updatedItem] = await prisma.$transaction([
      prisma.stockIn.create({
        data: {
          itemId,
          jumlah: qty,
          sumber: sumber || 'APBN',
          nomorNota: nomorNota || null,
          metodePembayaran: metodePembayaran || null,
          hargaSatuan: parseFloat(hargaSatuan || '0'),
          keterangan: keterangan || null,
          adminName: adminName || 'Admin TU',
        },
      }),
      prisma.item.update({
        where: { id: itemId },
        data: {
          stokSaatIni: {
            increment: qty,
          },
        },
        include: { category: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stockIn: newStockIn,
      item: updatedItem,
    });
  } catch (error) {
    console.error('Create stock-in error:', error);
    return NextResponse.json(
      { error: 'Gagal mencatat transaksi barang masuk' },
      { status: 500 }
    );
  }
}
