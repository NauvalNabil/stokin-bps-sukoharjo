import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, adminName, catatanAdmin, itemApprovals } = await req.json();

    if (!['APPROVED', 'REJECTED', 'RETURNED'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    const currentReq = await prisma.request.findUnique({
      where: { id },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    if (!currentReq) {
      return NextResponse.json({ error: 'Permohonan tidak ditemukan' }, { status: 404 });
    }

    // Handle RETURNED (Rollback stock for previously APPROVED request)
    if (status === 'RETURNED') {
      if (currentReq.status !== 'APPROVED') {
        return NextResponse.json(
          { error: 'Hanya permohonan yang sudah disetujui yang dapat diretur/dikembalikan' },
          { status: 400 }
        );
      }

      const returnOperations: any[] = [];

      for (const reqItem of currentReq.items) {
        const qtyToRestore =
          reqItem.jumlahDisetujui !== null && reqItem.jumlahDisetujui !== undefined
            ? reqItem.jumlahDisetujui
            : reqItem.jumlahDiminta;

        if (qtyToRestore > 0) {
          returnOperations.push(
            prisma.item.update({
              where: { id: reqItem.itemId },
              data: {
                stokSaatIni: {
                  increment: qtyToRestore,
                },
              },
            })
          );
        }

        returnOperations.push(
          prisma.requestItem.update({
            where: { id: reqItem.id },
            data: {
              keterangan: catatanAdmin
                ? `Diretur: ${catatanAdmin}`
                : 'Diretur / dikembalikan ke gudang',
            },
          })
        );
      }

      returnOperations.push(
        prisma.request.update({
          where: { id },
          data: {
            status: 'RETURNED',
            catatanAdmin: catatanAdmin || 'Barang dikembalikan ke gudang oleh pemohon',
          },
          include: {
            user: true,
            items: { include: { item: true } },
          },
        })
      );

      const returnResults = await prisma.$transaction(returnOperations);
      const returnedRequest = returnResults[returnResults.length - 1];

      return NextResponse.json({ success: true, request: returnedRequest });
    }

    if (currentReq.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Permohonan sudah diproses sebelumnya dengan status: ${currentReq.status}` },
        { status: 400 }
      );
    }

    if (status === 'REJECTED') {
      const rejectedReq = await prisma.request.update({
        where: { id },
        data: {
          status: 'REJECTED',
          approvedBy: adminName || 'Admin TU',
          catatanAdmin: catatanAdmin || null,
          approvedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, request: rejectedReq });
    }

    // If APPROVED: Validate stock and decrement atomically
    const operations: any[] = [];

    // Check each item
    for (const reqItem of currentReq.items) {
      const approvedQty = itemApprovals && itemApprovals[reqItem.id] !== undefined
        ? parseInt(itemApprovals[reqItem.id], 10)
        : reqItem.jumlahDiminta;

      // Check current stock
      if (reqItem.item.stokSaatIni < approvedQty) {
        return NextResponse.json(
          {
            error: `Stok tidak mencukupi untuk "${reqItem.item.name}". Sisa stok: ${reqItem.item.stokSaatIni}, diminta: ${approvedQty}`,
          },
          { status: 400 }
        );
      }

      // Update requestItem with approved quantity
      operations.push(
        prisma.requestItem.update({
          where: { id: reqItem.id },
          data: { jumlahDisetujui: approvedQty },
        })
      );

      // Deduct stock from item
      operations.push(
        prisma.item.update({
          where: { id: reqItem.itemId },
          data: {
            stokSaatIni: {
              decrement: approvedQty,
            },
          },
        })
      );
    }

    // Finally update the request status
    operations.push(
      prisma.request.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: adminName || 'Admin TU',
          catatanAdmin: catatanAdmin || null,
          approvedAt: new Date(),
        },
        include: {
          user: true,
          items: { include: { item: true } },
        },
      })
    );

    const results = await prisma.$transaction(operations);
    const updatedRequest = results[results.length - 1];

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Update request status error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status permohonan' },
      { status: 500 }
    );
  }
}
