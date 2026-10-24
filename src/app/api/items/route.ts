import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const categoryName = searchParams.get('category') || '';

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { kodeSakti: { contains: q } },
        { barcode: { contains: q } },
      ];
    }

    if (categoryName && categoryName !== 'Semua') {
      whereClause.category = {
        name: categoryName,
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      items,
      categories,
      total: items.length,
    });
  } catch (error) {
    console.error('Fetch items error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data persediaan' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, kodeSakti, barcode, categoryName, satuan, stokAwal, hargaSatuan } = body;

    if (!name || !kodeSakti) {
      return NextResponse.json(
        { error: 'Nama barang dan kode barang wajib diisi' },
        { status: 400 }
      );
    }

    // find or create category
    let category = await prisma.category.findUnique({
      where: { name: categoryName || 'Alat Tulis Kantor' },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName || 'Alat Tulis Kantor' },
      });
    }

    const initialStock = parseInt(stokAwal || '0', 10);

    const newItem = await prisma.item.create({
      data: {
        name: name.trim(),
        kodeSakti: kodeSakti.trim(),
        barcode: barcode?.trim() || null,
        categoryId: category.id,
        satuan: satuan?.trim() || 'Pcs',
        stokAwal: initialStock,
        stokSaatIni: initialStock,
        stokMinimum: 5,
        hargaSatuan: parseFloat(hargaSatuan || '0'),
      },
      include: {
        category: true,
      },
    });

    // If initial stock is greater than 0, also log the initial StockIn transaction
    if (initialStock > 0) {
      await prisma.stockIn.create({
        data: {
          itemId: newItem.id,
          jumlah: initialStock,
          sumber: 'APBN',
          keterangan: 'Saldo awal / pengadaan pertama barang baru',
          adminName: 'Admin TU',
        },
      });
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Create item error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kode barang sudah digunakan oleh barang lain' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Gagal menyimpan barang baru' },
      { status: 500 }
    );
  }
}
