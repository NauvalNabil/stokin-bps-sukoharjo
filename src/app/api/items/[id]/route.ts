import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, kodeSakti, barcode, categoryName, satuan, stokSaatIni } = body;

    if (!name || !kodeSakti) {
      return NextResponse.json(
        { error: 'Nama barang dan kode barang wajib diisi' },
        { status: 400 }
      );
    }

    let category = await prisma.category.findUnique({
      where: { name: categoryName || 'Alat Tulis Kantor' },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName || 'Alat Tulis Kantor' },
      });
    }

    const updateData: any = {
      name: name.trim(),
      kodeSakti: kodeSakti.trim(),
      barcode: barcode?.trim() || null,
      categoryId: category.id,
      satuan: satuan?.trim() || 'Pcs',
    };

    if (stokSaatIni !== undefined && stokSaatIni !== null && !isNaN(Number(stokSaatIni))) {
      updateData.stokSaatIni = Math.max(0, parseInt(String(stokSaatIni), 10));
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('Update item error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kode barang sudah digunakan oleh barang lain' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Gagal memperbarui data barang' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete related requestItems and stockIns first in a transaction so foreign keys don't block deletion
    await prisma.$transaction([
      prisma.requestItem.deleteMany({ where: { itemId: id } }),
      prisma.stockIn.deleteMany({ where: { itemId: id } }),
      prisma.item.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus barang dari katalog' },
      { status: 500 }
    );
  }
}
