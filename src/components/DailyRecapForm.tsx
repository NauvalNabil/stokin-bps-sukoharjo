'use client';

import React, { useState, useMemo } from 'react';
import { Printer, ArrowLeft, Calendar } from 'lucide-react';

interface RequestItemDetail {
  id: string;
  jumlahDiminta: number;
  jumlahDisetujui?: number | null;
  keterangan?: string | null;
  item?: {
    id: string;
    name: string;
    kodeSakti: string;
    satuan: string;
  };
}

interface RequestRecord {
  id: string;
  nomorForm: string;
  tanggal: string;
  status: string;
  keperluan?: string | null;
  user?: {
    name: string;
    team?: string | null;
    nip?: string | null;
  };
  items?: RequestItemDetail[];
}

interface SettingRecord {
  namaSatker?: string;
  pengelolaPersediaanNama?: string;
  pengelolaPersediaanNip?: string;
}

interface DailyRecapFormProps {
  requests: RequestRecord[];
  setting: SettingRecord | null;
  onBack: () => void;
}

function toLocalDateKey(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DailyRecapForm({
  requests,
  setting,
  onBack,
}: DailyRecapFormProps) {
  // Default to the latest date that has an APPROVED request, or today's date
  const defaultDate = useMemo(() => {
    const approved = requests.filter((r) => r.status === 'APPROVED');
    if (approved.length > 0) {
      return toLocalDateKey(approved[0].tanggal);
    }
    return toLocalDateKey(new Date());
  }, [requests]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);

  // Collect all unique dates that have APPROVED requests for quick selection
  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    requests
      .filter((r) => r.status === 'APPROVED')
      .forEach((r) => {
        dateSet.add(toLocalDateKey(r.tanggal));
      });
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [requests]);

  // Flatten all items from APPROVED requests on the selected date in chronological order
  const dailyItems = useMemo(() => {
    const approvedForDay = requests
      .filter(
        (r) =>
          r.status === 'APPROVED' &&
          toLocalDateKey(r.tanggal) === selectedDate
      )
      .sort(
        (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      );

    const flattened: {
      rowKey: string;
      name: string;
      satuan: string;
      jumlahDiminta: number;
    }[] = [];

    approvedForDay.forEach((req) => {
      req.items?.forEach((reqItem) => {
        flattened.push({
          rowKey: `${req.id}-${reqItem.id}`,
          name: reqItem.item?.name || '-',
          satuan: reqItem.item?.satuan || 'Pcs',
          jumlahDiminta: reqItem.jumlahDiminta,
        });
      });
    });

    return flattened;
  }, [requests, selectedDate]);

  // Format selectedDate (YYYY-MM-DD) into Indonesian readable date
  const formattedDateStr = useMemo(() => {
    if (!selectedDate) return '';
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Top Action & Date Filter Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <label className="text-xs font-semibold text-slate-700">
              Pilih Tanggal Rekap:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {availableDates.length > 0 && (
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              title="Tanggal yang memiliki transaksi disetujui"
            >
              {!availableDates.includes(selectedDate) && (
                <option value={selectedDate}>Tanggal Dipilih ({selectedDate})</option>
              )}
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  Ada Transaksi: {d}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Harian</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Matching contoh format harian.jpeg */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
        {/* Header Title */}
        <div className="text-center font-bold text-sm md:text-base mb-6">
          <p className="tracking-wide uppercase">
            FORMULIR PERMINTAAN BARANG ALAT TULIS KANTOR/ALAT RUMAH TANGGA KANTOR
          </p>
          <p className="tracking-wider text-sm md:text-base uppercase mt-1">
            {setting?.namaSatker || 'BPS KABUPATEN SUKOHARJO'}
          </p>
        </div>

        {/* Daily Items Table */}
        <table className="w-full text-xs border border-slate-900 mb-10 border-collapse">
          <thead className="text-center font-semibold">
            <tr>
              <th rowSpan={2} className="border border-slate-900 px-2 py-2 w-12">
                No.
              </th>
              <th rowSpan={2} className="border border-slate-900 px-4 py-2 text-center">
                Nama Barang
              </th>
              <th rowSpan={2} className="border border-slate-900 px-3 py-2 w-24">
                Satuan
              </th>
              <th colSpan={2} className="border border-slate-900 px-4 py-1.5">
                Banyaknya Barang
              </th>
              <th rowSpan={2} className="border border-slate-900 px-4 py-2 w-36 text-center">
                Keterangan
              </th>
            </tr>
            <tr>
              <th className="border border-slate-900 px-2 py-1.5 w-24">Diminta</th>
              <th className="border border-slate-900 px-2 py-1.5 w-24">Disetujui</th>
            </tr>
          </thead>
          <tbody>
            {dailyItems.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-slate-900 px-4 py-8 text-center text-slate-400 italic"
                >
                  Tidak ada permohonan barang yang disetujui pada tanggal {formattedDateStr}.
                </td>
              </tr>
            ) : (
              dailyItems.map((item, index) => (
                <tr key={item.rowKey}>
                  <td className="border border-slate-900 px-2 py-2 text-center">
                    {index + 1}.
                  </td>
                  <td className="border border-slate-900 px-4 py-2 font-medium">
                    {item.name}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-center">
                    {item.satuan}
                  </td>
                  <td className="border border-slate-900 px-2 py-2 text-center font-semibold">
                    {item.jumlahDiminta}
                  </td>
                  {/* Disetujui column left empty as requested */}
                  <td className="border border-slate-900 px-2 py-2 text-center"></td>
                  {/* Keterangan column left empty as requested */}
                  <td className="border border-slate-900 px-4 py-2"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Single Bottom Signature Block Matching contoh format harian.jpeg */}
        <div className="text-xs flex justify-between items-start px-6 pt-2">
          <div className="w-64">
            <p className="text-slate-900 mt-5 mb-16">Administrator Gudang</p>
            <p className="font-bold border-b border-dotted border-slate-900 pb-0.5 uppercase">
              {setting?.pengelolaPersediaanNama || 'NOVIA DWIMA SANTI, S.Tr.Stat'}
            </p>
            <p className="text-slate-900 mt-1">
              NIP. {setting?.pengelolaPersediaanNip || '199811062021042001'}
            </p>
          </div>

          <div className="w-64">
            <p className="text-slate-900 mb-1">Sukoharjo, {formattedDateStr}</p>
            <p className="text-slate-900 mb-16">Penanggung Jawab</p>
            <p className="border-b border-dotted border-slate-900 pb-4"></p>
            <p className="text-slate-900 mt-1">NIP.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
