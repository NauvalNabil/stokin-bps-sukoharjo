'use client';

import React, { useState, useMemo } from 'react';
import { Printer, ArrowLeft, Filter, Calendar } from 'lucide-react';

interface StockInItem {
  id: string;
  tanggal: string | Date;
  jumlah: number;
  sumber: string;
  nomorNota?: string | null;
  keterangan?: string | null;
  adminName?: string | null;
  item?: {
    id: string;
    name: string;
    kodeSakti: string;
    satuan: string;
    category?: {
      name: string;
    };
  };
}

interface SettingRecord {
  namaSatker?: string;
  pengelolaPersediaanNama?: string;
  pengelolaPersediaanNip?: string;
}

interface StockInReportFormProps {
  stockIns: StockInItem[];
  setting: SettingRecord | null;
  onBack: () => void;
}

export default function StockInReportForm({
  stockIns,
  setting,
  onBack,
}: StockInReportFormProps) {
  // Available Months for filtering
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    stockIns.forEach((stk) => {
      const d = new Date(stk.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [stockIns]);

  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedSumber, setSelectedSumber] = useState<string>('ALL');

  // Filtered Stock Ins
  const filteredStockIns = useMemo(() => {
    return stockIns.filter((stk) => {
      const d = new Date(stk.tanggal);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const matchMonth = selectedMonth === 'ALL' || monthKey === selectedMonth;
      const matchSumber = selectedSumber === 'ALL' || stk.sumber === selectedSumber;
      return matchMonth && matchSumber;
    });
  }, [stockIns, selectedMonth, selectedSumber]);

  // Total Quantity Received
  const totalQuantity = useMemo(() => {
    return filteredStockIns.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [filteredStockIns]);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getMonthLabel = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Action Header & Filters (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Periode Bulan</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSumber}
              onChange={(e) => setSelectedSumber(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Sumber Dana</option>
              <option value="APBN">APBN DIPA Sukoharjo</option>
              <option value="Transfer Masuk BPS Provinsi">Transfer Masuk BPS Provinsi</option>
              <option value="Hibah / Lainnya">Hibah / Lainnya</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Printable Sheet */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
        
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-bps.svg" alt="Logo Resmi BPS" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="font-bold text-sm md:text-base tracking-wide uppercase">
                  {setting?.namaSatker || 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO'}
                </h1>
                <p className="text-xs text-slate-600">
                  Satker: 054010300019098000KD | Jl. Wandyo Pranoto No. 2, Mandan, Sukoharjo
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold">
                BUKU BARANG MASUK
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <h2 className="font-bold text-base md:text-lg tracking-wider uppercase underline">
              DAFTAR / BUKU PENERIMAAN BARANG PERSEDIAAN (ATK)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Periode:{' '}
              <span className="font-semibold text-slate-900">
                {selectedMonth === 'ALL' ? 'Seluruh Transaksi' : getMonthLabel(selectedMonth)}
              </span>{' '}
              | Sumber Dana:{' '}
              <span className="font-semibold text-slate-900">
                {selectedSumber === 'ALL' ? 'Semua Sumber' : selectedSumber}
              </span>
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-900 mb-6 border-collapse">
            <thead className="bg-slate-100 text-center font-bold border-b border-slate-900">
              <tr>
                <th className="border border-slate-900 px-2 py-2 w-8">No.</th>
                <th className="border border-slate-900 px-3 py-2 w-24">Tanggal Terima</th>
                <th className="border border-slate-900 px-3 py-2 text-left">Nama Barang Persediaan</th>
                <th className="border border-slate-900 px-3 py-2 text-left w-32">Kategori</th>
                <th className="border border-slate-900 px-2 py-2 w-14">Jumlah</th>
                <th className="border border-slate-900 px-2 py-2 w-16">Satuan</th>
                <th className="border border-slate-900 px-3 py-2 text-left w-28">Sumber Pengadaan</th>
                <th className="border border-slate-900 px-3 py-2 text-left w-32">Bukti / No. Nota / BAST</th>
                <th className="border border-slate-900 px-3 py-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredStockIns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-900 px-4 py-8 text-center text-slate-400 italic">
                    Tidak ada transaksi barang masuk pada kriteria yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredStockIns.map((stk, index) => {
                  const d = new Date(stk.tanggal);
                  const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                  return (
                    <tr key={stk.id} className="border-b border-slate-300">
                      <td className="border border-slate-900 px-2 py-2 text-center">{index + 1}.</td>
                      <td className="border border-slate-900 px-3 py-2 text-center whitespace-nowrap font-mono text-[11px]">
                        {dateFormatted}
                      </td>
                      <td className="border border-slate-900 px-3 py-2 font-medium">
                        {stk.item?.name || 'Barang Terhapus'}
                        <span className="block text-[10px] text-slate-500 font-mono">
                          Kode Barang: {stk.item?.kodeSakti || '-'}
                        </span>
                      </td>
                      <td className="border border-slate-900 px-3 py-2 text-slate-600">
                        {stk.item?.category?.name || '-'}
                      </td>
                      <td className="border border-slate-900 px-2 py-2 text-center font-bold text-slate-900">
                        {stk.jumlah}
                      </td>
                      <td className="border border-slate-900 px-2 py-2 text-center text-slate-700">
                        {stk.item?.satuan || 'Pcs'}
                      </td>
                      <td className="border border-slate-900 px-3 py-2">
                        <span className="font-semibold text-slate-800">{stk.sumber}</span>
                      </td>
                      <td className="border border-slate-900 px-3 py-2 font-mono text-[11px]">
                        {stk.nomorNota || '-'}
                      </td>
                      <td className="border border-slate-900 px-3 py-2 text-slate-600">
                        {stk.keterangan || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredStockIns.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colSpan={4} className="border border-slate-900 px-3 py-2 text-right">
                    TOTAL UNIT DITERIMA:
                  </td>
                  <td className="border border-slate-900 px-2 py-2 text-center text-sm font-bold text-emerald-800">
                    {totalQuantity}
                  </td>
                  <td colSpan={4} className="border border-slate-900 px-3 py-2 text-slate-500 text-[11px]">
                    ({filteredStockIns.length} transaksi penerimaan)
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Signatures */}
        <div className="flex justify-between px-6 pt-6 text-xs text-slate-900 break-inside-avoid">
          <div className="text-center w-64">
            <p className="text-slate-600 mb-16">
              Mengetahui,<br />
              Pejabat Pembuat Komitmen / Kasubbag Umum
            </p>
            <p className="font-bold border-b border-slate-900 inline-block pb-0.5">
              .......................................................
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              NIP. ................................................
            </p>
          </div>

          <div className="text-center w-64">
            <p className="text-slate-600 mb-1">Sukoharjo, {todayStr}</p>
            <p className="text-slate-600 mb-16">
              Pengelola Barang Persediaan / Petugas TU,
            </p>
            <p className="font-bold border-b border-slate-900 inline-block pb-0.5">
              {setting?.pengelolaPersediaanNama || 'Novia Dwima Santi, S.Tr.Stat'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              NIP. {setting?.pengelolaPersediaanNip || '199811062021042001'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
