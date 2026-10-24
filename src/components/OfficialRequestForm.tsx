'use client';

import React from 'react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface OfficialRequestFormProps {
  request: any;
  setting: any;
  onBack: () => void;
}

export default function OfficialRequestForm({
  request,
  setting,
  onBack,
}: OfficialRequestFormProps) {
  if (!request) return null;

  const tanggalStr = new Date(request.tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Action Header (Hidden on Print) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak ke PDF / Printer</span>
        </button>
      </div>

      {/* Official Form Sheet (Matches FORMULIR PERMINTAAN BARANG ALAT TULIS KANTOR.docx) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 text-slate-900 font-serif print:shadow-none print:border-none print:p-0">
        
        {/* Header Title */}
        <div className="text-center font-bold text-sm md:text-base border-b-2 border-slate-900 pb-3 mb-6">
          <p className="tracking-wide">
            FORMULIR PERMINTAAN BARANG ALAT TULIS KANTOR/ALAT RUMAH TANGGA KANTOR
          </p>
          <p className="tracking-wider text-base md:text-lg uppercase">
            {setting?.namaSatker || 'BPS KABUPATEN SUKOHARJO'}
          </p>
        </div>

        {/* Request Metadata */}
        <div className="font-sans text-xs mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
          <div>
            <p>
              <span className="text-slate-500 w-28 inline-block">Nomor Formulir:</span>
              <span className="font-mono font-bold text-slate-900">{request.nomorForm}</span>
            </p>
            <p>
              <span className="text-slate-500 w-28 inline-block">Nama Pemohon:</span>
              <span className="font-bold text-slate-900">{request.user?.name || '-'}</span>
            </p>
            <p>
              <span className="text-slate-500 w-28 inline-block">Unit Kerja / Tim:</span>
              <span className="font-semibold text-slate-900">{request.user?.team || '-'}</span>
            </p>
          </div>
          <div className="md:text-right">
            <p>
              <span className="text-slate-500 w-24 inline-block md:w-auto">Tanggal:</span>{' '}
              <span className="font-semibold text-slate-900">{tanggalStr}</span>
            </p>
            <p>
              <span className="text-slate-500 w-24 inline-block md:w-auto">Keperluan:</span>{' '}
              <span className="font-medium text-slate-900">{request.keperluan || 'Kegiatan Kantor'}</span>
            </p>
            <p className="mt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  request.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : request.status === 'RETURNED'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : request.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                Status:{' '}
                {request.status === 'APPROVED'
                  ? 'Disetujui'
                  : request.status === 'RETURNED'
                  ? 'Dikembalikan (Retur)'
                  : request.status === 'REJECTED'
                  ? 'Ditolak'
                  : 'Menunggu'}
              </span>
            </p>
          </div>
        </div>

        {/* Table Matching Word Template */}
        <table className="w-full font-sans text-xs border border-slate-900 mb-8 border-collapse">
          <thead className="bg-slate-100 text-center font-bold border-b border-slate-900">
            <tr>
              <th rowSpan={2} className="border border-slate-900 px-2 py-2 w-10">
                No.
              </th>
              <th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left">
                Nama Barang
              </th>
              <th rowSpan={2} className="border border-slate-900 px-3 py-2 w-20">
                Satuan
              </th>
              <th colSpan={2} className="border border-slate-900 px-4 py-1">
                Banyaknya Barang
              </th>
              <th rowSpan={2} className="border border-slate-900 px-4 py-2 text-left">
                Keterangan
              </th>
            </tr>
            <tr>
              <th className="border border-slate-900 px-2 py-1 w-16">Diminta</th>
              <th className="border border-slate-900 px-2 py-1 w-16">Disetujui</th>
            </tr>
          </thead>
          <tbody>
            {request.items?.map((item: any, index: number) => (
              <tr key={item.id} className="border-b border-slate-300">
                <td className="border border-slate-900 px-2 py-2 text-center">{index + 1}.</td>
                <td className="border border-slate-900 px-4 py-2 font-medium">
                  {item.item?.name}
                  <span className="block text-[10px] text-slate-500 font-mono">
                    Kode Barang: {item.item?.kodeSakti}
                  </span>
                </td>
                <td className="border border-slate-900 px-3 py-2 text-center">{item.item?.satuan || 'Pcs'}</td>
                <td className="border border-slate-900 px-2 py-2 text-center font-bold">
                  {item.jumlahDiminta}
                </td>
                <td className="border border-slate-900 px-2 py-2 text-center font-bold text-emerald-700">
                  {request.status === 'APPROVED' ? item.jumlahDisetujui : '-'}
                </td>
                <td className="border border-slate-900 px-4 py-2 text-slate-600">
                  {item.keterangan || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures Matching Word Document and Jawaban No 21 */}
        <div className="font-sans text-xs flex justify-between px-6 pt-4">
          <div className="text-center w-60">
            <p className="text-slate-600 mb-16">Administrator Gudang,</p>
            <p className="font-bold border-b border-slate-900 inline-block pb-0.5">
              {setting?.pengelolaPersediaanNama || 'Novia Dwima Santi, S.Tr.Stat'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              NIP. {setting?.pengelolaPersediaanNip || '199811062021042001'}
            </p>
          </div>

          <div className="text-center w-60">
            <p className="text-slate-600 mb-1">Sukoharjo, {tanggalStr}</p>
            <p className="text-slate-600 mb-16">Penanggung Jawab,</p>
            <p className="font-bold border-b border-slate-900 inline-block pb-0.5">
              {request.user?.name || '................................'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              NIP. {request.user?.nip || '................................'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
