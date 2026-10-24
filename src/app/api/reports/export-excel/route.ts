import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'persediaan'; // 'persediaan', 'stock-in', or 'kartu-kendali'

    const setting = await prisma.setting.findUnique({
      where: { id: 'default' },
    });

    if (type === 'stock-in') {
      const stockIns = await prisma.stockIn.findMany({
        include: {
          item: {
            include: { category: true },
          },
        },
        orderBy: { tanggal: 'desc' },
      });

      const dataRows = stockIns.map((stk, index) => {
        const d = new Date(stk.tanggal);
        const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return {
          'No.': index + 1,
          'Tanggal Masuk': formattedDate,
          'Kode Barang': stk.item?.kodeSakti || '-',
          'Kode Barcode': stk.item?.barcode || '-',
          'Nama Barang': stk.item?.name || 'Barang Terhapus',
          'Kategori / Sub Kelompok': stk.item?.category?.name || '-',
          'Jumlah Masuk': stk.jumlah,
          'Satuan': stk.item?.satuan || 'Pcs',
          'Sumber Pengadaan': stk.sumber,
          'Nomor Nota / BAST': stk.nomorNota || '-',
          'Keterangan': stk.keterangan || '-',
          'Dicatat Oleh': stk.adminName || 'Admin TU',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Barang Masuk ATK');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const filename = `Laporan_Barang_Masuk_ATK_BPS_Sukoharjo_${new Date().toISOString().slice(0, 10)}.xlsx`;

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    const items = await prisma.item.findMany({
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    const dataRows = items.map((itm, index) => ({
      'No.': index + 1,
      'Kode Barang': itm.kodeSakti,
      'Kode Barcode': itm.barcode || '-',
      'Nama Barang': itm.name,
      'Sub Kelompok / Kategori': itm.category.name,
      'Satuan': itm.satuan,
      'Stok Awal': itm.stokAwal,
      'Sisa Stok Terkini': itm.stokSaatIni,
      'Stok Minimum': itm.stokMinimum,
      'Status': itm.stokSaatIni <= 5 ? 'Kritis / Menipis' : 'Aman',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Persediaan ATK');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `Laporan_Persediaan_ATK_BPS_Sukoharjo_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Excel error:', error);
    return NextResponse.json({ error: 'Gagal mengekspor laporan ke Excel' }, { status: 500 });
  }
}
