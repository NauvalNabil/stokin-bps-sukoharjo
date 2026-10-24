'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let html5QrCode: any = null;

    if (isOpen) {
      setCameraError(null);
      setIsScanning(true);

      // Dynamically import html5-qrcode on client only
      import('html5-qrcode')
        .then(({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 180 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          };

          html5QrCode = new Html5Qrcode('interactive-scanner-region');
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: 'environment' }, // Rear camera on mobile
              config,
              (decodedText: string) => {
                // Success callback
                if (html5QrCode && html5QrCode.isScanning) {
                  html5QrCode.stop().then(() => {
                    onScanSuccess(decodedText);
                  });
                } else {
                  onScanSuccess(decodedText);
                }
              },
              () => {
                // frame ignore
              }
            )
            .catch((err: any) => {
              console.warn('Camera access warning:', err);
              setCameraError(
                'Kamera tidak dapat diakses (pastikan izin kamera diizinkan di browser). Anda juga bisa memasukkan kode secara manual di bawah.'
              );
              setIsScanning(false);
            });
        })
        .catch((err) => {
          console.error('Failed to load scanner library:', err);
          setCameraError('Gagal memuat library pemindai.');
        });
    }

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-sky-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">Scan Barcode Kemasan ATK</h3>
          <p className="text-xs text-slate-400 mt-1">
            Arahkan kamera HP ke garis barcode strip di kemasan barang
          </p>
        </div>

        {/* Video / Scanner Viewport */}
        <div className="relative w-full aspect-4/3 bg-black rounded-2xl overflow-hidden border-2 border-dashed border-sky-500/50 flex items-center justify-center">
          <div id="interactive-scanner-region" className="w-full h-full"></div>

          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-xs text-slate-300 mb-3">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Quick Sample Barcode Simulation for Testing */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 text-center">
            🧪 Simulasi Cepat (Klik kode contoh untuk menguji tanpa kamera):
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => onScanSuccess('8992775123456')}
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 p-2 rounded-xl text-left border border-slate-700/60 font-mono text-[10px]"
            >
              📄 Kertas HVS A4<br />
              <span className="text-slate-400">8992775123456</span>
            </button>
            <button
              onClick={() => onScanSuccess('8991389211029')}
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 p-2 rounded-xl text-left border border-slate-700/60 font-mono text-[10px]"
            >
              ✏️ Pensil 2B<br />
              <span className="text-slate-400">8991389211029</span>
            </button>
            <button
              onClick={() => onScanSuccess('8992988102910')}
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 p-2 rounded-xl text-left border border-slate-700/60 font-mono text-[10px]"
            >
              🗂️ Map Arsip BPS<br />
              <span className="text-slate-400">8992988102910</span>
            </button>
            <button
              onClick={() => onScanSuccess('4711583000018')}
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 p-2 rounded-xl text-left border border-slate-700/60 font-mono text-[10px]"
            >
              🖊️ Ballpoint Pentel<br />
              <span className="text-slate-400">4711583000018</span>
            </button>
          </div>
        </div>

        {/* Manual Code Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Atau ketik barcode / kode barang..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            onClick={() => {
              if (manualCode.trim()) onScanSuccess(manualCode.trim());
            }}
            disabled={!manualCode.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm"
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  );
}
