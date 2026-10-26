'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Search,
  ShoppingCart,
  FileText,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Plus,
  LogOut,
  User as UserIcon,
  Smartphone,
  Monitor,
  Printer,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Lock,
  Pencil,
  Trash2,
  RotateCcw,
  ArrowDownToLine,
  Calendar,
  Settings as SettingsIcon,
} from 'lucide-react';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import OfficialRequestForm from '@/components/OfficialRequestForm';
import DailyRecapForm from '@/components/DailyRecapForm';
import StockInReportForm from '@/components/StockInReportForm';

export default function Home() {
  // Authentication & Mode State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state (Opsi A)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    team: 'Tim Statistik Sosial',
    password: '',
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Settings
  const [setting, setSetting] = useState<any>(null);

  // Data states
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [stockIns, setStockIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI View states
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile_preview'>('responsive');
  const [activeTab, setActiveTab] = useState<'katalog' | 'approval' | 'riwayat' | 'barang_masuk' | 'profil'>('katalog');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'cart' | 'stock_in_existing' | 'stock_in_new' | 'edit_item'>('cart');
  const [printRequest, setPrintRequest] = useState<any | null>(null);
  const [showDailyRecap, setShowDailyRecap] = useState(false);
  const [showStockInReport, setShowStockInReport] = useState(false);

  // Riwayat Bon date filter
  const [riwayatDateFilter, setRiwayatDateFilter] = useState('');

  // Stock In tab search & filter
  const [stockInSearch, setStockInSearch] = useState('');
  const [stockInFilterSumber, setStockInFilterSumber] = useState('ALL');

  // User Profile & Reporting Settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    nip: '',
    email: '',
    team: 'Subbagian Umum',
    phone: '',
    password: '',
    namaSatker: 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO',
    kepalaBpsNama: 'Anang Sarwoto, S.Si, MM',
    kepalaBpsNip: '197505271997121001',
    alamat: 'Jl. Jenderal Sudirman No. 199, Sukoharjo',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Admin Edit Master Item Modal state
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [editItemForm, setEditItemForm] = useState({
    id: '',
    name: '',
    kodeSakti: '',
    barcode: '',
    categoryName: '',
    satuan: 'Pcs',
    stokSaatIni: 0,
  });

  // Admin Return / Cancel Request Modal state
  const [returnModalReq, setReturnModalReq] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState('Dikembalikan oleh staf karena tim sudah memiliki barang sendiri');

  // Cart / Request Draft state
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [keperluan, setKeperluan] = useState('Kegiatan Rutin Kantor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock In / New Item Modal state
  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [stockInMode, setStockInMode] = useState<'existing' | 'new'>('existing');
  const [stockInForm, setStockInForm] = useState({
    itemId: '',
    jumlah: 1,
    sumber: 'APBN',
    nomorNota: '',
    keterangan: '',
  });
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    kodeSakti: '',
    barcode: '',
    categoryName: 'Alat Tulis Kantor',
    satuan: 'Pcs',
    stokAwal: 1,
  });

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Users & Initialize
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users && data.users.length > 0) {
        setAvailableUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  // Fetch Main Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Items
      const resItems = await fetch(`/api/items?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`);
      const dataItems = await resItems.json();
      if (dataItems.items) setItems(dataItems.items);
      if (dataItems.categories) setCategories(dataItems.categories);

      // 2. Fetch Requests
      const resReqs = await fetch(`/api/requests`);
      const dataReqs = await resReqs.json();
      if (dataReqs.requests) setRequests(dataReqs.requests);

      // 3. Fetch Settings
      const resSetting = await fetch(`/api/settings`);
      const dataSetting = await resSetting.json();
      if (dataSetting.setting) setSetting(dataSetting.setting);

      // 4. Fetch Stock-Ins
      const resStockIn = await fetch(`/api/stock-in`);
      const dataStockIn = await resStockIn.json();
      if (dataStockIn.stockIns) setStockIns(dataStockIn.stockIns);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Set default tab ONLY when the logged-in user changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        setActiveTab('approval');
      } else {
        setActiveTab('katalog');
      }
    }
  }, [currentUser?.id]);

  // Fetch data when user, search query, or category filter changes (without resetting activeTab)
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, searchQuery, selectedCategory]);

  // Synchronize profileForm when currentUser or setting changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        nip: currentUser.nip || '',
        email: currentUser.email || '',
        team: currentUser.team || 'Subbagian Umum',
        phone: currentUser.phone || '',
        password: '',
        namaSatker: setting?.namaSatker || 'BADAN PUSAT STATISTIK KABUPATEN SUKOHARJO',
        kepalaBpsNama: setting?.kepalaBpsNama || 'Anang Sarwoto, S.Si, MM',
        kepalaBpsNip: setting?.kepalaBpsNip || '197505271997121001',
        alamat: setting?.alamat || 'Jl. Jenderal Sudirman No. 199, Sukoharjo',
      });
    }
  }, [currentUser, setting]);

  // Handle Save User Profile & Reporting Settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profileForm.name.trim() || !profileForm.email.trim()) return;
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          ...profileForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        if (data.setting) {
          setSetting(data.setting);
        }
        const resUsers = await fetch('/api/users');
        const dataUsers = await resUsers.json();
        if (dataUsers.users) setAvailableUsers(dataUsers.users);
        await fetchData();
        setProfileForm((prev) => ({ ...prev, password: '' }));
        showToast('✓ Profil pengguna & data pelaporan berhasil diperbarui!');
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (err) {
      showToast('Gagal menyimpan perubahan profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // BPS Team Options for Registration (Opsi A)
  const BPS_TEAMS = [
    'Tim Statistik Sosial',
    'Tim Statistik Produksi',
    'Tim Statistik Distribusi',
    'Tim Neraca Wilayah & Analisis Statistik',
    'Tim IPDS (Integrasi Pengolahan & Diseminasi Statistik)',
    'Subbagian Umum',
    'Pegawai Pemerintah Non Organik / Mitra',
    'Lainnya / Mahasiswa Magang',
  ];

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        showToast(`Selamat datang kembali, ${data.user.name}!`);
      } else {
        setLoginError(data.error || 'Login gagal, periksa email dan password Anda');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan koneksi saat login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Register (Opsi A - Otomatis Role STAFF & Langsung Masuk Dashboard)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password) {
      setRegisterError('Nama lengkap, email, dan password wajib diisi');
      return;
    }
    if (registerForm.password.length < 4) {
      setRegisterError('Password minimal 4 karakter');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setActiveTab('katalog');
        showToast(`✓ Pendaftaran berhasil! Selamat datang, ${data.user.name}.`);
        fetchUsers();
        fetchData();
        setRegisterForm({
          name: '',
          email: '',
          team: 'Tim Statistik Sosial',
          password: '',
        });
      } else {
        setRegisterError(data.error || 'Pendaftaran gagal');
      }
    } catch (err) {
      setRegisterError('Terjadi kesalahan koneksi saat pendaftaran');
    } finally {
      setIsRegistering(false);
    }
  };

  // Switch demo account safely using real database accounts
  const handleSelectUser = (user: any) => {
    setCurrentUser(user);
    setCart({});
    showToast(`Beralih akun: ${user.name} (${user.role === 'ADMIN' ? 'Admin TU' : 'Staf'})`);
  };

  // Handle Barcode Scanned
  const handleBarcodeScanned = async (code: string) => {
    setScannerOpen(false);

    // Target 1: Admin is adding a brand new item, filling in its barcode
    if (scannerTarget === 'stock_in_new') {
      setNewItemForm((prev) => ({ ...prev, barcode: code }));
      showToast(`✓ Barcode ${code} berhasil dipindai!`);
      return;
    }

    // Target 1b: Admin is editing an item, filling in its barcode
    if (scannerTarget === 'edit_item') {
      setEditItemForm((prev) => ({ ...prev, barcode: code }));
      showToast(`✓ Barcode ${code} berhasil dipindai!`);
      return;
    }

    // Target 2: Admin is adding stock to existing item, auto-selecting item in dropdown
    if (scannerTarget === 'stock_in_existing') {
      try {
        const res = await fetch(`/api/items/barcode/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.item) {
          setStockInForm((prev) => ({ ...prev, itemId: data.item.id }));
          showToast(`✓ Barcode cocok: "${data.item.name}" terpilih!`);
        } else {
          showToast(`⚠️ Barcode ${code} belum terdaftar di sistem.`);
        }
      } catch (e) {
        showToast('Gagal memproses kode barcode');
      }
      return;
    }

    // Target 3 (Default): Staff or admin scanning to add item to request cart
    try {
      const res = await fetch(`/api/items/barcode/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.item) {
        addToCart(data.item.id);
        showToast(`✓ Barcode cocok: "${data.item.name}" ditambahkan!`);
      } else {
        showToast(`⚠️ Barcode ${code} belum terdaftar.`);
        setSearchQuery(code);
      }
    } catch (e) {
      showToast('Gagal memproses kode barcode');
    }
  };

  // Cart operations
  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    const item = items.find((i) => i.id === itemId);
    if (item) showToast(`"${item.name}" dimasukkan ke permintaan`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const updateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prev) => ({ ...prev, [itemId]: qty }));
    }
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Submit Request (FIXED: Uses actual currentUser.id from database!)
  const handleSubmitRequest = async () => {
    if (totalCartCount === 0 || !currentUser) return;
    setIsSubmitting(true);
    try {
      const payload = {
        userId: currentUser.id, // REAL ID from database
        keperluan,
        items: Object.entries(cart).map(([itemId, jumlah]) => ({
          itemId,
          jumlah,
        })),
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast('✓ Permohonan ATK berhasil diajukan! Menunggu persetujuan TU.');
        setCart({});
        await fetchData();
        setActiveTab('riwayat');
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Terjadi kesalahan saat mengajukan permohonan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Approval Action (Admin Only)
  const handleApproveRequest = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          status === 'APPROVED'
            ? '✓ Permohonan disetujui & stok otomatis terpotong!'
            : 'Permohonan ditolak.'
        );
        fetchData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal memproses approval');
    }
  };

  // Handle Stock-In Submission
  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.itemId || stockInForm.jumlah <= 0) return;

    try {
      const res = await fetch('/api/stock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stockInForm,
          adminName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('✓ Barang masuk berhasil dicatat & stok bertambah!');
        setStockInModalOpen(false);
        setStockInForm({
          itemId: '',
          jumlah: 1,
          sumber: 'APBN',
          nomorNota: '',
          keterangan: '',
        });
        fetchData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal mencatat barang masuk');
    }
  };

  // Handle New Item Creation
  const handleNewItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name.trim() || !newItemForm.kodeSakti.trim()) return;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemForm),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✓ Barang baru "${newItemForm.name}" berhasil ditambahkan!`);
        setStockInModalOpen(false);
        setNewItemForm({
          name: '',
          kodeSakti: '',
          barcode: '',
          categoryName: 'Alat Tulis Kantor',
          satuan: 'Pcs',
          stokAwal: 1,
        });
        fetchData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal menambahkan barang baru');
    }
  };

  // Open Edit Master Item Modal (Admin CRUD)
  const handleOpenEditItem = (item: any) => {
    setEditItemForm({
      id: item.id,
      name: item.name,
      kodeSakti: item.kodeSakti,
      barcode: item.barcode || '',
      categoryName: item.category?.name || 'Alat Tulis Kantor',
      satuan: item.satuan || 'Pcs',
      stokSaatIni: item.stokSaatIni ?? 0,
    });
    setEditItemModalOpen(true);
  };

  // Submit Edit Master Item (Admin CRUD)
  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItemForm.id || !editItemForm.name.trim() || !editItemForm.kodeSakti.trim()) return;

    try {
      const res = await fetch(`/api/items/${editItemForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItemForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Data barang "${editItemForm.name}" berhasil diperbarui!`);
        setEditItemModalOpen(false);
        fetchData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal memperbarui data barang');
    }
  };

  // Delete Master Item (Admin CRUD)
  const handleDeleteItem = async (item: any) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus "${item.name}" dari katalog persediaan?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Barang "${item.name}" berhasil dihapus dari katalog.`);
        fetchData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal menghapus barang');
    }
  };

  // Submit Return / Rollback Request (Admin Retur)
  const handleReturnRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalReq) return;

    try {
      const res = await fetch(`/api/requests/${returnModalReq.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RETURNED',
          adminName: currentUser.name,
          catatanAdmin: returnReason.trim() || 'Barang dikembalikan ke gudang oleh pemohon',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('✓ Barang berhasil diretur & stok gudang otomatis dikembalikan!');
        setReturnModalReq(null);
        fetchData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (e) {
      showToast('Gagal memproses pengembalian barang');
    }
  };

  // Stats
  const totalItemTypes = items.length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const criticalStockCount = items.filter((i) => i.stokSaatIni <= 5).length;

  // Filter requests for Staff vs Admin
  const visibleRequests = currentUser?.role === 'ADMIN'
    ? requests
    : requests.filter((r) => r.userId === currentUser?.id);

  // Helper to format date as YYYY-MM-DD in local time
  const toLocalDateKey = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Unique dates in visibleRequests for quick date filter chips
  const availableRiwayatDates = Array.from(
    new Set(visibleRequests.map((r) => toLocalDateKey(r.tanggal)))
  ).sort((a, b) => b.localeCompare(a));

  // Filtered requests for Riwayat tab by selected date
  const filteredRiwayatRequests = visibleRequests.filter((req) => {
    if (!riwayatDateFilter) return true;
    return toLocalDateKey(req.tanggal) === riwayatDateFilter;
  });

  // Filter Stock-In records for Admin view
  const filteredStockIns = stockIns.filter((stk) => {
    const q = stockInSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      stk.item?.name?.toLowerCase().includes(q) ||
      stk.item?.kodeSakti?.toLowerCase().includes(q) ||
      (stk.nomorNota && stk.nomorNota.toLowerCase().includes(q)) ||
      (stk.keterangan && stk.keterangan.toLowerCase().includes(q));
    const matchSumber =
      stockInFilterSumber === 'ALL' || stk.sumber === stockInFilterSumber;
    return matchSearch && matchSumber;
  });

  if (printRequest) {
    return (
      <OfficialRequestForm
        request={printRequest}
        setting={setting}
        onBack={() => setPrintRequest(null)}
      />
    );
  }

  if (showDailyRecap) {
    return (
      <DailyRecapForm
        requests={requests}
        setting={setting}
        onBack={() => setShowDailyRecap(false)}
      />
    );
  }

  if (showStockInReport) {
    return (
      <StockInReportForm
        stockIns={stockIns}
        setting={setting}
        onBack={() => setShowStockInReport(false)}
      />
    );
  }

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <img src="/logo-bps.svg" alt="Logo Resmi BPS" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">STOK-IN BPS Sukoharjo</h2>
            <p className="text-xs text-slate-500 mt-1">Sistem Tracking Operasional & Ketersediaan Inventaris ATK</p>
          </div>

          {/* Auth Mode Toggle: Masuk vs Daftar */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegisterError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daftar Pegawai Baru
            </button>
          </div>

          {/* MODE 1: LOGIN FORM */}
          {authMode === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                {loginError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@bps.go.id atau email pribadi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Password:</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {isLoggingIn ? 'Memproses Masuk...' : 'Masuk ke Sistem'}
                </button>
              </form>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegisterError(null);
                  }}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold transition-colors"
                >
                  Belum punya akun? Daftar sebagai staf baru →
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTER FORM (Opsi A) */}
          {authMode === 'register' && (
            <div>
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                {registerError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Lengkap & Gelar: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Contoh: Nama Lengkap, Gelar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email Pengguna: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="nama@bps.go.id atau email pribadi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Unit Kerja / Tim BPS: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={registerForm.team}
                    onChange={(e) => setRegisterForm({ ...registerForm, team: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 text-xs font-medium text-slate-700"
                  >
                    {BPS_TEAMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Unit kerja akan otomatis tercantum pada formulir bon ATK Anda.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Password Akun: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Minimal 4 karakter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-xl text-[11px] text-sky-800">
                  ℹ️ Akun baru otomatis memiliki peran sebagai <strong>Staf Pegawai</strong> untuk mengajukan permohonan ATK.
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {isRegistering ? 'Mendaftarkan Akun...' : 'Daftar & Masuk ke Dashboard'}
                </button>
              </form>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  Sudah memiliki akun? Masuk di sini →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      
      {/* ======================================================== */}
      {/* TOP HEADER BAR                                           */}
      {/* ======================================================== */}
      <header className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <img src="/logo-bps.svg" alt="Logo BPS" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white block">
                STOK-IN BPS SUKOHARJO
              </span>
              <span className="text-[10px] text-slate-400">
                Sistem Tracking Operasional & Ketersediaan Inventaris ATK
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-7xl mx-auto min-h-[calc(100vh-60px)] flex flex-col md:flex-row">

          {/* ==================================================== */}
          {/* SIDEBAR NAVIGATION                                   */}
          {/* ==================================================== */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 flex flex-col border-r border-slate-800 shrink-0">
            <div>
              {/* Current Logged In User Profile (Click to open User Settings) */}
              <div
                onClick={() => setActiveTab('profil')}
                title="Klik untuk mengatur profil pengguna (Nama, NIP, Tim, dll.)"
                className={`p-3 rounded-2xl border mb-5 flex items-center justify-between gap-2 shadow-xs cursor-pointer transition-all group ${
                  activeTab === 'profil'
                    ? 'bg-slate-800 border-sky-500 ring-2 ring-sky-500/30'
                    : 'bg-slate-800/80 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center font-bold text-xs text-sky-400 shrink-0 group-hover:bg-sky-600/30 transition-colors">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                        {currentUser.name}
                      </p>
                      <SettingsIcon className="w-3 h-3 text-slate-400 group-hover:text-sky-400 shrink-0 transition-colors" />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {currentUser.nip ? `NIP. ${currentUser.nip}` : currentUser.role === 'ADMIN' ? 'Pengelola BMN / TU' : currentUser.team}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role === 'ADMIN' ? 'Admin TU' : 'Staf Pegawai'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentUser(null);
                  }}
                  className="text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 p-1.5 rounded-xl transition-all shrink-0"
                  title="Keluar / Ganti Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Strict Role-Based Navigation */}
              <nav className="space-y-1 text-xs font-medium">
                
                {/* 1. Katalog ATK (Available to Staff & Admin) */}
                <button
                  onClick={() => setActiveTab('katalog')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    activeTab === 'katalog'
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4" />
                    <span>Katalog ATK</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{items.length}</span>
                </button>

                {/* 2. ADMIN ONLY: Approval Permintaan */}
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('approval')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'approval'
                        ? 'bg-sky-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Persetujuan Permintaan</span>
                    </div>
                    {pendingRequestsCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* 3. ADMIN ONLY: Riwayat Barang Masuk */}
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('barang_masuk')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === 'barang_masuk'
                        ? 'bg-sky-600 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Riwayat Barang Masuk</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {stockIns.length}
                    </span>
                  </button>
                )}

                {/* 4. Permohonan / Riwayat Bon */}
                <button
                  onClick={() => setActiveTab('riwayat')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeTab === 'riwayat'
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{currentUser.role === 'ADMIN' ? 'Semua Riwayat Bon' : 'Permohonan Saya'}</span>
                </button>

                {/* 5. ADMIN ONLY: Cetak Rekap Harian */}
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setShowDailyRecap(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Rekap Harian</span>
                  </button>
                )}

                {/* 6. ADMIN ONLY: Cetak Laporan Barang Masuk */}
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setShowStockInReport(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Laporan Masuk</span>
                  </button>
                )}

                {/* 7. ADMIN ONLY: Export Rekap Persediaan Excel */}
                {currentUser.role === 'ADMIN' && (
                  <a
                    href="/api/reports/export-excel"
                    target="_blank"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Persediaan (Excel)</span>
                  </a>
                )}

                {/* 8. ADMIN ONLY: Export Riwayat Barang Masuk Excel */}
                {currentUser.role === 'ADMIN' && (
                  <a
                    href="/api/reports/export-excel?type=stock-in"
                    target="_blank"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Barang Masuk</span>
                  </a>
                )}
              </nav>
            </div>
          </aside>

          {/* ==================================================== */}
          {/* MAIN WORKSPACE                                       */}
          {/* ==================================================== */}
          <main className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
            
            {/* Top Bar on Desktop */}
            <div className="hidden md:flex bg-white border-b border-slate-200 px-6 py-4 items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {activeTab === 'katalog' && 'Katalog & Persediaan Barang ATK'}
                  {activeTab === 'approval' && 'Persetujuan Permintaan Barang ATK'}
                  {activeTab === 'riwayat' && (currentUser.role === 'ADMIN' ? 'Semua Riwayat Bon ATK' : 'Riwayat Permintaan Saya')}
                  {activeTab === 'barang_masuk' && 'Riwayat & Buku Penerimaan Barang Masuk (ATK)'}
                  {activeTab === 'profil' && 'Pengaturan Profil Pengguna & Data Pelaporan'}
                </h2>
                <p className="text-xs text-slate-500">
                  Satker: 054010300019098000KD - BPS Kabupaten Sukoharjo
                </p>
              </div>

              {/* Desktop Header Actions */}
              <div className="flex items-center gap-3">
                {currentUser.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      setScannerTarget('cart');
                      setScannerOpen(true);
                    }}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs transition-all"
                  >
                    <Camera className="w-4 h-4 text-sky-600" />
                    <span>Scan Barcode Kamera</span>
                  </button>
                )}

                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setStockInModalOpen(true)}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Input Barang Masuk</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between md:hidden">
              <div
                onClick={() => setActiveTab('profil')}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Klik untuk membuka Pengaturan Profil"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <img src="/logo-bps.svg" alt="Logo BPS" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-sky-600 transition-colors">
                      Halo, {currentUser.name.split(' ')[0]} 👋
                    </h3>
                    <SettingsIcon className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {currentUser.nip ? `NIP. ${currentUser.nip} • ` : ''}{currentUser.team}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('profil')}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                  activeTab === 'profil'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Pengaturan</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 md:p-6 space-y-5 flex-1">

              {/* ADMIN DASHBOARD STATS (Only visible to Admin) */}
              {currentUser.role === 'ADMIN' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Total Jenis ATK</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalItemTypes}</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Stok Terdata Otomatis</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Permintaan Pending</p>
                    <h3 className="text-2xl font-bold text-amber-500 mt-1">{pendingRequestsCount}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Menunggu persetujuan</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <p className="text-xs font-medium text-slate-500">Stok Kritis / Menipis</p>
                    <h3 className="text-2xl font-bold text-rose-600 mt-1">{criticalStockCount}</h3>
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">Stok ≤ 5 item</p>
                  </div>
                  <div
                    onClick={() => setActiveTab('barang_masuk')}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
                    title="Klik untuk melihat riwayat barang masuk"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-500 group-hover:text-sky-600 transition-colors">Barang Masuk</p>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-sky-600 mt-1">{stockIns.length}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Transaksi pengadaan</p>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* TAB 1: KATALOG ATK                                 */}
              {/* -------------------------------------------------- */}
              {activeTab === 'katalog' && (
                <div className="space-y-4">
                  
                  {/* Search bar with single integrated Scan Button (Scan only for Staff) */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cari nama barang, barcode, atau kode barang..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {currentUser.role !== 'ADMIN' && (
                      <button
                        onClick={() => {
                          setScannerTarget('cart');
                          setScannerOpen(true);
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all shrink-0 md:hidden"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Scan</span>
                      </button>
                    )}
                  </div>

                  {/* Category Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory('Semua')}
                      className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-all ${
                        selectedCategory === 'Semua'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Semua
                    </button>
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-all ${
                          selectedCategory === cat.name
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Items List */}
                  {items.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                      <Package className="w-10 h-10 text-slate-300 mx-auto" />
                      <div>
                        <p className="font-bold text-xs text-slate-700">Katalog Barang ATK Masih Kosong</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Belum ada item persediaan ATK yang terdaftar di dalam sistem.
                        </p>
                      </div>
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setStockInMode('new');
                            setStockInModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Barang ATK Baru</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((item) => {
                        const inCart = cart[item.id] || 0;
                        const isLow = item.stokSaatIni <= 5;

                        return (
                          <div
                            key={item.id}
                            className={`bg-white border rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between transition-all hover:border-sky-300 ${
                              isLow ? 'border-amber-200' : 'border-slate-200/80'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="bg-sky-50 text-sky-700 text-[9px] font-bold px-2 py-0.5 rounded border border-sky-100 truncate max-w-[150px]">
                                  {item.category?.name || 'ATK'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    isLow
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {isLow ? `⚠️ Sisa: ${item.stokSaatIni}` : `Sisa: ${item.stokSaatIni}`} {item.satuan}
                                </span>
                              </div>

                              <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-2">
                                {item.name}
                              </h4>

                              <div className="mt-1 space-y-0.5 font-mono text-[10px] text-slate-400">
                                <p>Kode Barang: {item.kodeSakti}</p>
                                {item.barcode && <p className="text-sky-600 font-semibold">Barcode: {item.barcode}</p>}
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">Satuan: <b className="text-slate-700">{item.satuan}</b></span>

                              {currentUser.role === 'ADMIN' ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditItem(item)}
                                    className="bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 font-semibold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                    title="Edit Data Barang"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item)}
                                    className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold text-[11px] p-1.5 rounded-lg transition-all"
                                    title="Hapus Barang"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : inCart > 0 ? (
                                <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateCartQty(item.id, inCart - 1)}
                                    className="w-5 h-5 bg-white text-sky-800 rounded font-bold text-xs flex items-center justify-center shadow-2xs"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold text-sky-800 px-1.5">{inCart}</span>
                                  <button
                                    onClick={() => updateCartQty(item.id, inCart + 1)}
                                    className="w-5 h-5 bg-sky-600 text-white rounded font-bold text-xs flex items-center justify-center shadow-2xs"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item.id)}
                                  className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Minta</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* TAB 2: APPROVAL PERMINTAAN (ADMIN ONLY)            */}
              {/* -------------------------------------------------- */}
              {activeTab === 'approval' && currentUser.role === 'ADMIN' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-800">Daftar Pengajuan Bon ATK Pegawai</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">Total: {requests.length} Permohonan</span>
                      <button
                        onClick={() => setShowDailyRecap(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Rekap Harian</span>
                      </button>
                    </div>
                  </div>

                  {requests.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-xs">
                      Belum ada permohonan ATK yang diajukan oleh staf.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-sky-700">{req.nomorForm}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    req.status === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : req.status === 'RETURNED'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      : req.status === 'REJECTED'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {req.status === 'APPROVED'
                                    ? 'Disetujui'
                                    : req.status === 'RETURNED'
                                    ? '↩️ Dikembalikan (Retur)'
                                    : req.status === 'REJECTED'
                                    ? 'Ditolak'
                                    : 'Menunggu Approval'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                Pemohon: <b className="text-slate-800">{req.user?.name}</b> ({req.user?.team})
                              </p>
                              <p className="text-[11px] text-slate-400">Keperluan: {req.keperluan}</p>
                              {req.catatanAdmin && (
                                <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                                  Catatan TU: {req.catatanAdmin}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => setPrintRequest(req)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>Cetak Bon Word</span>
                            </button>
                          </div>

                          {/* Requested Items List */}
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                              Rincian Barang yang Diminta:
                            </p>
                            <ul className="divide-y divide-slate-200/60 text-xs">
                              {req.items?.map((it: any) => (
                                <li key={it.id} className="py-1.5 flex justify-between items-center">
                                  <div>
                                    <span className="font-medium text-slate-800">{it.item?.name}</span>
                                    <span className="text-[10px] text-slate-400 block font-mono">
                                      Stok Gudang: {it.item?.stokSaatIni} {it.item?.satuan}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                      {it.jumlahDiminta} {it.item?.satuan}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Approval Actions */}
                          {req.status === 'PENDING' && (
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleApproveRequest(req.id, 'REJECTED')}
                                className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                              >
                                Tolak
                              </button>
                              <button
                                onClick={() => handleApproveRequest(req.id, 'APPROVED')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui & Potong Stok</span>
                              </button>
                            </div>
                          )}

                          {/* Return / Rollback Action for Approved Requests */}
                          {req.status === 'APPROVED' && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => {
                                  setReturnReason('Dikembalikan oleh staf karena tim sudah memiliki barang sendiri');
                                  setReturnModalReq(req);
                                }}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retur / Kembalikan Stok</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* TAB 3: RIWAYAT PERMOHONAN                          */}
              {/* -------------------------------------------------- */}
              {activeTab === 'riwayat' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h3 className="font-bold text-xs text-slate-800">
                        {currentUser.role === 'ADMIN' ? 'Semua Riwayat Bon ATK' : 'Riwayat Permintaan Saya'}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Filter berdasarkan tanggal pengajuan untuk meninjau atau mencetak bon ATK
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Date Filter Input */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="text-slate-500 font-medium text-[11px]">Tanggal:</span>
                        <input
                          type="date"
                          value={riwayatDateFilter}
                          onChange={(e) => setRiwayatDateFilter(e.target.value)}
                          className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none"
                        />
                        {riwayatDateFilter && (
                          <button
                            onClick={() => setRiwayatDateFilter('')}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded-md transition-colors"
                            title="Tampilkan Semua Tanggal"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => setShowDailyRecap(true)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Rekap Harian</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Date Chips if there are existing dates */}
                  {availableRiwayatDates.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[11px] text-slate-400 font-medium shrink-0 mr-1">Pilih Cepat:</span>
                      <button
                        onClick={() => setRiwayatDateFilter('')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                          !riwayatDateFilter
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Semua Tanggal ({visibleRequests.length})
                      </button>
                      {availableRiwayatDates.map((dKey) => {
                        const [y, m, d] = dKey.split('-');
                        const label = new Date(
                          parseInt(y, 10),
                          parseInt(m, 10) - 1,
                          parseInt(d, 10)
                        ).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                        return (
                          <button
                            key={dKey}
                            onClick={() => setRiwayatDateFilter(dKey)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                              riwayatDateFilter === dKey
                                ? 'bg-sky-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredRiwayatRequests.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-xs">
                      {riwayatDateFilter
                        ? 'Tidak ada riwayat bon ATK pada tanggal yang dipilih.'
                        : 'Belum ada permohonan ATK yang diajukan.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRiwayatRequests.map((req) => (
                        <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-xs font-bold text-sky-700">{req.nomorForm}</span>
                              <p className="text-xs font-semibold text-slate-800 mt-0.5">{req.keperluan}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Pemohon: <span className="font-semibold text-slate-800">{req.user?.name || '-'}</span>
                                {req.user?.nip ? ` (NIP. ${req.user.nip})` : ''} • {req.user?.team || '-'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(req.tanggal).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              {req.catatanAdmin && (
                                <p className="text-[11px] text-indigo-600 font-medium mt-1">
                                  Catatan TU: {req.catatanAdmin}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'RETURNED'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : req.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status === 'APPROVED'
                                ? '✓ Disetujui'
                                : req.status === 'RETURNED'
                                ? '↩️ Dikembalikan (Retur)'
                                : req.status === 'REJECTED'
                                ? '✕ Ditolak'
                                : '⏳ Menunggu'}
                            </span>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-slate-500 text-[11px]">{req.items?.length || 0} macam barang</span>
                            <div className="flex items-center gap-3">
                              {currentUser.role === 'ADMIN' && req.status === 'APPROVED' && (
                                <button
                                  onClick={() => {
                                    setReturnReason('Dikembalikan oleh staf karena tim sudah memiliki barang sendiri');
                                    setReturnModalReq(req);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Retur / Kembalikan Stok</span>
                                </button>
                              )}
                              <button
                                onClick={() => setPrintRequest(req)}
                                className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Lihat Formulir Cetak</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* TAB 4: RIWAYAT BARANG MASUK                        */}
              {/* -------------------------------------------------- */}
              {activeTab === 'barang_masuk' && currentUser.role === 'ADMIN' && (
                <div className="space-y-4">
                  {/* Header action bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h3 className="font-bold text-xs text-slate-800">
                        Buku Penerimaan Barang Persediaan (ATK)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menampilkan seluruh riwayat barang masuk dari pengadaan APBN & transfer masuk
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setStockInModalOpen(true)}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Input Masuk</span>
                      </button>
                      <button
                        onClick={() => setShowStockInReport(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Laporan</span>
                      </button>
                      <a
                        href="/api/reports/export-excel?type=stock-in"
                        target="_blank"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Excel</span>
                      </a>
                    </div>
                  </div>

                  {/* Search and Filter toolbar */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama barang, kode, nomor BAST/nota, atau keterangan..."
                        value={stockInSearch}
                        onChange={(e) => setStockInSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 shadow-2xs"
                      />
                      {stockInSearch && (
                        <button
                          onClick={() => setStockInSearch('')}
                          className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="w-full sm:w-60">
                      <select
                        value={stockInFilterSumber}
                        onChange={(e) => setStockInFilterSumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 shadow-2xs"
                      >
                        <option value="ALL">Semua Sumber Pengadaan</option>
                        <option value="APBN">APBN DIPA Sukoharjo</option>
                        <option value="Transfer Masuk BPS Provinsi">Transfer Masuk BPS Provinsi</option>
                        <option value="Hibah / Lainnya">Hibah / Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Data Table / Cards */}
                  {filteredStockIns.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-xs shadow-2xs">
                      {stockIns.length === 0
                        ? 'Belum ada transaksi barang masuk yang dicatat.'
                        : 'Tidak ada data barang masuk yang sesuai dengan kata kunci pencarian.'}
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                              <tr>
                                <th className="px-4 py-3 w-10 text-center">No.</th>
                                <th className="px-4 py-3 w-28">Tanggal</th>
                                <th className="px-4 py-3">Nama & Kode Barang</th>
                                <th className="px-4 py-3 w-28">Kategori</th>
                                <th className="px-4 py-3 w-24 text-center">Jumlah</th>
                                <th className="px-4 py-3 w-36">Sumber Pengadaan</th>
                                <th className="px-4 py-3 w-36">No. Nota / BAST</th>
                                <th className="px-4 py-3">Keterangan</th>
                                <th className="px-4 py-3 w-28">Dicatat Oleh</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredStockIns.map((stk, index) => {
                                const d = new Date(stk.tanggal);
                                const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                const timeFormatted = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                                return (
                                  <tr key={stk.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <p className="font-semibold text-slate-800">{dateFormatted}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">{timeFormatted} WIB</p>
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="font-bold text-slate-900">{stk.item?.name || 'Barang Terhapus'}</p>
                                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                        Kode Barang: {stk.item?.kodeSakti || '-'}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 font-medium">
                                      {stk.item?.category?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                        +{stk.jumlah} {stk.item?.satuan || 'Pcs'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                          stk.sumber.includes('Provinsi')
                                            ? 'bg-purple-100 text-purple-800'
                                            : stk.sumber === 'APBN'
                                            ? 'bg-sky-100 text-sky-800'
                                            : 'bg-slate-100 text-slate-800'
                                        }`}
                                      >
                                        {stk.sumber}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[11px]">
                                      {stk.nomorNota ? (
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                                          {stk.nomorNota}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 italic">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                      {stk.keterangan || <span className="text-slate-400 italic">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-[11px] font-medium">
                                      {stk.adminName || 'Admin TU'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile & Tablet Card Layout */}
                      <div className="lg:hidden space-y-3">
                        {filteredStockIns.map((stk) => {
                          const d = new Date(stk.tanggal);
                          const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                          return (
                            <div key={stk.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">{dateFormatted} WIB</span>
                                  <h4 className="font-bold text-slate-900 text-xs mt-0.5">{stk.item?.name || 'Barang Terhapus'}</h4>
                                  <p className="text-[10px] font-mono text-slate-500">Kode Barang: {stk.item?.kodeSakti || '-'}</p>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                  +{stk.jumlah} {stk.item?.satuan || 'Pcs'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-500">Sumber:</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    stk.sumber.includes('Provinsi')
                                      ? 'bg-purple-100 text-purple-800'
                                      : stk.sumber === 'APBN'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {stk.sumber}
                                </span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-[11px] text-slate-600">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Bukti Nota / BAST:</span>
                                  <span className="font-mono font-bold text-slate-700">{stk.nomorNota || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Keterangan:</span>
                                  <span className="font-medium text-slate-700">{stk.keterangan || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Dicatat oleh:</span>
                                  <span className="font-medium text-slate-700">{stk.adminName || 'Admin TU'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* TAB 5: PENGATURAN PROFIL & DATA PELAPORAN          */}
              {/* -------------------------------------------------- */}
              {activeTab === 'profil' && (
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                          {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : currentUser.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            Pengaturan Profil Pengguna & Identitas Pelaporan
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Perubahan Nama, NIP, dan Unit Kerja akan otomatis menyesuaikan seluruh cetakan bon & laporan resmi.
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          currentUser.role === 'ADMIN'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {currentUser.role === 'ADMIN' ? 'Admin TU / Pengelola Persediaan' : 'Staf Pegawai BPS'}
                      </span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="mt-5 space-y-5 text-xs">
                      {/* Identitas Utama Pengguna */}
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                          <span>1. Data Diri & Identitas Pegawai</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Nama Lengkap & Gelar: <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              placeholder="Contoh: Novia Dwima Santi, S.Tr.Stat"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Tercantum otomatis pada nama pemohon / pejabat penanda tangan laporan.
                            </p>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              NIP (Nomor Induk Pegawai):
                            </label>
                            <input
                              type="text"
                              value={profileForm.nip}
                              onChange={(e) => setProfileForm({ ...profileForm, nip: e.target.value })}
                              placeholder="Contoh: 199811062021042001"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-sky-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Tercantum otomatis di bawah garis tanda tangan pada formulir cetak.
                            </p>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Unit Kerja / Tim Kerja:
                            </label>
                            <input
                              type="text"
                              value={profileForm.team}
                              onChange={(e) => setProfileForm({ ...profileForm, team: e.target.value })}
                              placeholder="Contoh: Subbagian Umum / Tim Statistik Sosial"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Alamat Email (Login): <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              placeholder="nama@bps.go.id"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Nomor Telepon / WhatsApp (Opsional):
                            </label>
                            <input
                              type="text"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              placeholder="Contoh: 081234567890"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Password Baru (Opsional):
                            </label>
                            <input
                              type="password"
                              value={profileForm.password}
                              onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                              placeholder="Kosongkan jika tidak ingin mengubah password"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pengaturan Instansi & Pejabat Pelaporan (Khusus Admin TU) */}
                      {currentUser.role === 'ADMIN' && (
                        <div className="pt-4 border-t border-slate-200">
                          <h4 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5 text-sky-600" />
                            <span>2. Pengaturan Kop Instansi & Pejabat Penanda Tangan Laporan</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mb-3">
                            Nama & NIP Anda di atas otomatis menjadi <strong>Administrator Gudang / Pengelola Persediaan</strong> pada semua laporan cetak. Di bawah ini Anda juga dapat menyesuaikan data Kepala BPS & Kop Satker.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="md:col-span-2">
                              <label className="font-semibold text-slate-700 block mb-1">
                                Nama Satuan Kerja (Header Cetakan):
                              </label>
                              <input
                                type="text"
                                value={profileForm.namaSatker}
                                onChange={(e) => setProfileForm({ ...profileForm, namaSatker: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">
                                Nama Kepala BPS / Kuasa Pengguna Barang:
                              </label>
                              <input
                                type="text"
                                value={profileForm.kepalaBpsNama}
                                onChange={(e) => setProfileForm({ ...profileForm, kepalaBpsNama: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-sky-500"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-slate-700 block mb-1">
                                NIP Kepala BPS:
                              </label>
                              <input
                                type="text"
                                value={profileForm.kepalaBpsNip}
                                onChange={(e) => setProfileForm({ ...profileForm, kepalaBpsNip: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Live Preview Tanda Tangan Pelaporan */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Pratinjau Tanda Tangan pada Cetakan Dokumen Resmi:
                        </p>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-around items-center gap-6 text-xs">
                          {currentUser.role === 'ADMIN' ? (
                            <>
                              <div className="text-center">
                                <p className="text-slate-500 text-[11px] mb-8">Administrator Gudang / Pengelola Persediaan,</p>
                                <p className="font-bold text-slate-900 border-b border-slate-800 inline-block pb-0.5">
                                  {profileForm.name || '................................'}
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                                  NIP. {profileForm.nip || '................................'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-slate-500 text-[11px] mb-8">Kuasa Pengguna Barang / Kepala BPS,</p>
                                <p className="font-bold text-slate-900 border-b border-slate-800 inline-block pb-0.5">
                                  {profileForm.kepalaBpsNama || '................................'}
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                                  NIP. {profileForm.kepalaBpsNip || '................................'}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center">
                              <p className="text-slate-500 text-[11px] mb-8">Penanggung Jawab / Pemohon ({profileForm.team || 'Staf'}),</p>
                              <p className="font-bold text-slate-900 border-b border-slate-800 inline-block pb-0.5">
                                {profileForm.name || '................................'}
                              </p>
                              <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                                NIP. {profileForm.nip || '................................'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab(currentUser.role === 'ADMIN' ? 'approval' : 'katalog')}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-all"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Pengaturan Profil'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>

            {/* ==================================================== */}
            {/* MOBILE BOTTOM NAVIGATION                             */}
            {/* ==================================================== */}
            <div
              className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-around text-slate-500 md:hidden sticky bottom-0 z-30"
            >
              <button
                onClick={() => setActiveTab('katalog')}
                className={`flex flex-col items-center gap-1 ${
                  activeTab === 'katalog' ? 'text-sky-600 font-bold' : 'text-slate-400'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="text-[10px]">Katalog</span>
              </button>

              {currentUser.role !== 'ADMIN' && (
                <button
                  onClick={() => {
                    setScannerTarget('cart');
                    setScannerOpen(true);
                  }}
                  className="flex flex-col items-center gap-1 -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 ring-4 ring-white active:scale-95 transition-all">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-sky-700">Scan</span>
                </button>
              )}

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('barang_masuk')}
                  className={`flex flex-col items-center gap-1 relative ${
                    activeTab === 'barang_masuk' ? 'text-sky-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ArrowDownToLine className="w-5 h-5" />
                  <span className="text-[10px]">Masuk</span>
                  {stockIns.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {stockIns.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab(currentUser.role === 'ADMIN' ? 'approval' : 'riwayat')}
                className={`flex flex-col items-center gap-1 relative ${
                  activeTab === 'riwayat' || activeTab === 'approval' ? 'text-sky-600 font-bold' : 'text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[10px]">{currentUser.role === 'ADMIN' ? 'Approval' : 'Permohonan'}</span>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-bps-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
                {currentUser.role === 'ADMIN' && pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </div>

          </main>

        </div>
      </div>

      {/* ======================================================== */}
      {/* FLOATING CART BAR (Submitting Request)                   */}
      {/* ======================================================== */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:w-96 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-xs">{totalCartCount} ATK Dipilih</span>
            </div>
            <button
              onClick={() => setCart({})}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Kosongkan
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Keperluan Pengambilan:</label>
            <input
              type="text"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Contoh: Cetak kuesioner Susenas"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={handleSubmitRequest}
            disabled={isSubmitting}
            className="w-full bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Mengajukan...</span>
            ) : (
              <>
                <span>Ajukan Permohonan Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INPUT BARANG MASUK / TAMBAH BARANG BARU (ADMIN)   */}
      {/* ======================================================== */}
      {stockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Input Barang Masuk & Katalog ATK</span>
              </h3>
              <button
                onClick={() => setStockInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl mb-4 text-xs">
              <button
                type="button"
                onClick={() => setStockInMode('existing')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  stockInMode === 'existing'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tambah Stok Lama
              </button>
              <button
                type="button"
                onClick={() => setStockInMode('new')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  stockInMode === 'new'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Barang ATK Baru
              </button>
            </div>

            {stockInMode === 'existing' && items.length > 0 ? (
              <form onSubmit={handleStockInSubmit} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Pilih Barang ATK:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('stock_in_existing');
                        setScannerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-lg transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-600" />
                      <span>Scan Kemasan</span>
                    </button>
                  </div>
                  <select
                    required
                    value={stockInForm.itemId}
                    onChange={(e) => setStockInForm({ ...stockInForm, itemId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} (Sisa: {it.stokSaatIni} {it.satuan})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Jumlah Masuk:</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={stockInForm.jumlah}
                      onChange={(e) => setStockInForm({ ...stockInForm, jumlah: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Sumber Pengadaan:</label>
                    <select
                      value={stockInForm.sumber}
                      onChange={(e) => setStockInForm({ ...stockInForm, sumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="APBN">APBN DIPA BPS</option>
                      <option value="Transfer Masuk BPS Provinsi">Transfer BPS Provinsi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Nota / BAST (Opsional):</label>
                  <input
                    type="text"
                    placeholder="Contoh: BAST/01/2026"
                    value={stockInForm.nomorNota}
                    onChange={(e) => setStockInForm({ ...stockInForm, nomorNota: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Keterangan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Droping logistik sensus ekonomi"
                    value={stockInForm.keterangan}
                    onChange={(e) => setStockInForm({ ...stockInForm, keterangan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStockInModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    Simpan Barang Masuk
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNewItemSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Barang ATK:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kertas HVS A4 80 Gram"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="font-semibold text-slate-700 block mb-1">Kode Barang:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: ATK-001"
                      value={newItemForm.kodeSakti}
                      onChange={(e) => setNewItemForm({ ...newItemForm, kodeSakti: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="font-semibold text-slate-700 block mb-1 truncate">Barcode Kemasan (Opsional):</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="899277512345"
                        value={newItemForm.barcode}
                        onChange={(e) => setNewItemForm({ ...newItemForm, barcode: e.target.value })}
                        className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScannerTarget('stock_in_new');
                          setScannerOpen(true);
                        }}
                        className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
                        title="Scan Barcode Kemasan dengan Kamera"
                      >
                        <Camera className="w-3.5 h-3.5 text-sky-600" />
                        <span>Scan</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Kategori:</label>
                    <input
                      type="text"
                      required
                      placeholder="Alat Tulis"
                      value={newItemForm.categoryName}
                      onChange={(e) => setNewItemForm({ ...newItemForm, categoryName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Satuan:</label>
                    <input
                      type="text"
                      required
                      placeholder="Pcs / Rim / Box"
                      value={newItemForm.satuan}
                      onChange={(e) => setNewItemForm({ ...newItemForm, satuan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stok Awal:</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newItemForm.stokAwal}
                      onChange={(e) => setNewItemForm({ ...newItemForm, stokAwal: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStockInModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    Simpan Barang Baru
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DATA MASTER BARANG ATK (ADMIN CRUD)          */}
      {/* ======================================================== */}
      {editItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-sky-600" />
                <span>Edit Data Master Barang ATK</span>
              </h3>
              <button
                onClick={() => setEditItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Barang ATK:</label>
                <input
                  type="text"
                  required
                  value={editItemForm.name}
                  onChange={(e) => setEditItemForm({ ...editItemForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="font-semibold text-slate-700 block mb-1">Kode Barang:</label>
                  <input
                    type="text"
                    required
                    value={editItemForm.kodeSakti}
                    onChange={(e) => setEditItemForm({ ...editItemForm, kodeSakti: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="min-w-0">
                  <label className="font-semibold text-slate-700 block mb-1 truncate">Barcode Kemasan (Opsional):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="899277512345"
                      value={editItemForm.barcode}
                      onChange={(e) => setEditItemForm({ ...editItemForm, barcode: e.target.value })}
                      className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('edit_item');
                        setScannerOpen(true);
                      }}
                      className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
                      title="Scan Barcode Kemasan"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-600" />
                      <span>Scan</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori:</label>
                  <input
                    type="text"
                    required
                    value={editItemForm.categoryName}
                    onChange={(e) => setEditItemForm({ ...editItemForm, categoryName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan:</label>
                  <input
                    type="text"
                    required
                    value={editItemForm.satuan}
                    onChange={(e) => setEditItemForm({ ...editItemForm, satuan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stok Saat Ini:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editItemForm.stokSaatIni}
                    onChange={(e) => setEditItemForm({ ...editItemForm, stokSaatIni: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RETUR / PENGEMBALIAN BARANG ATK (ADMIN)           */}
      {/* ======================================================== */}
      {returnModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>Retur / Pengembalian Barang ATK</span>
              </h3>
              <button
                onClick={() => setReturnModalReq(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnRequestSubmit} className="space-y-3.5 text-xs">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 space-y-1.5">
                <p className="font-bold text-indigo-900">
                  Formulir: <span className="font-mono">{returnModalReq.nomorForm}</span>
                </p>
                <p className="text-slate-600">
                  Pemohon: <b>{returnModalReq.user?.name}</b> ({returnModalReq.user?.team})
                </p>
                <div className="pt-1 border-t border-indigo-100">
                  <p className="text-[11px] font-semibold text-indigo-800 mb-1">
                    Stok yang akan dikembalikan otomatis ke gudang:
                  </p>
                  <ul className="space-y-0.5 text-[11px] text-slate-700">
                    {returnModalReq.items?.map((it: any) => (
                      <li key={it.id} className="flex justify-between">
                        <span>• {it.item?.name}</span>
                        <b className="text-emerald-700">
                          +{it.jumlahDisetujui ?? it.jumlahDiminta} {it.item?.satuan}
                        </b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alasan Retur / Catatan Pengembalian:
                </label>
                <textarea
                  rows={2}
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Contoh: Dikembalikan oleh staf karena tim sudah memiliki pulpen sendiri"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalReq(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Konfirmasi Retur & Kembalikan Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BARCODE SCANNER (PHONE CAMERA)                    */}
      {/* ======================================================== */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
      />

      {/* ======================================================== */}
      {/* TOAST NOTIFICATION                                       */}
      {/* ======================================================== */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
