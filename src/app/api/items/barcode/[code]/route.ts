import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = decodeURIComponent(code).trim();

    if (!cleanCode) {
      return NextResponse.json({ error: 'Kode barcode tidak valid' }, { status: 400 });
    }

    // Try finding by barcode first, then by kodeSakti
    const item = await prisma.item.findFirst({
      where: {
        OR: [
          { barcode: cleanCode },
          { kodeSakti: cleanCode },
        ],
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Barang dengan barcode/kode ini belum terdaftar', code: cleanCode },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json({ error: 'Gagal mencari barang' }, { status: 500 });
  }
}

// Support updating/attaching a barcode to an existing item
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { itemId } = await req.json();

    if (!code || !itemId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { barcode: code.trim() },
      include: { category: true },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Update barcode error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui barcode' }, { status: 500 });
  }
}
