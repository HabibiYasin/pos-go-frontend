import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Clock3, Lock, LogOut, RefreshCw, User as UserIcon, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { menuService } from '../../services/menuService';
import { getAllTransactions, updateTransactionStatus, type TransactionResponse } from '../../services/transactionService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Dropdown from '../../components/UI/Dropdown';
import type { Menu } from '../../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(value);

const statusLabel: Record<string, string> = {
  pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', cancelled: 'Dibatalkan',
};

export default function KasirDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [transactionData, menuResponse] = await Promise.all([
        getAllTransactions(),
        menuService.getAllMenus(),
      ]);
      setTransactions(transactionData);
      setMenus(menuResponse.data ?? []);
    } catch {
      setError('Data kasir gagal dimuat. Periksa koneksi ke backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const updateStatus = async (transaction: TransactionResponse, orderStatus: string) => {
    setUpdatingId(transaction.id);
    setError('');
    try {
      const updated = await updateTransactionStatus(transaction.id, { order_status: orderStatus });
      setTransactions((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch {
      setError('Status transaksi gagal diperbarui.');
    } finally {
      setUpdatingId(null);
    }
  };

  const todayTransactions = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter((transaction) => new Date(transaction.created_at).toDateString() === today);
  }, [transactions]);
  const activeTransactions = transactions.filter((transaction) =>
    transaction.order_status === 'pending' || transaction.order_status === 'processing',
  );
  const todayRevenue = todayTransactions
    .filter((transaction) => transaction.payment_status === 'paid' || transaction.payment_method === 'cash')
    .reduce((total, transaction) => total + transaction.total_amount, 0);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <img src="/logo-dashboard.png" alt="POS Go" className="h-16 w-auto" />
          <Dropdown
            trigger={
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><UserIcon size={18} className="text-gray-600" /></div>
                <div className="text-left hidden sm:block"><p className="text-sm font-medium text-gray-900">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
              </div>
            }
            items={[
              { label: 'Ubah Password', icon: <Lock size={16} />, onClick: () => navigate('/change-password') },
              { label: 'Logout', icon: <LogOut size={16} />, onClick: handleLogout, variant: 'danger' },
            ]}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1><p className="text-gray-600">Kelola pesanan pelanggan yang masuk.</p></div>
          <Button variant="outline" onClick={fetchDashboard} disabled={isLoading}><span className="inline-flex items-center gap-2"><RefreshCw size={16} /> Refresh</span></Button>
        </div>
        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><p className="text-sm text-gray-500">Transaksi Hari Ini</p><p className="text-2xl font-bold mt-1">{todayTransactions.length}</p></Card>
          <Card><p className="text-sm text-gray-500">Pendapatan Hari Ini</p><p className="text-2xl font-bold mt-1">{formatCurrency(todayRevenue)}</p></Card>
          <Card><p className="text-sm text-gray-500">Pesanan Aktif</p><p className="text-2xl font-bold mt-1">{activeTransactions.length}</p></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900">Antrean Pesanan</h2><span className="text-sm text-gray-500">{transactions.length} transaksi</span></div>
            {isLoading ? <p className="text-gray-500 py-10 text-center">Memuat transaksi...</p> : transactions.length === 0 ? <p className="text-gray-500 py-10 text-center">Belum ada transaksi.</p> : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div><p className="font-semibold text-gray-900">{transaction.customer_name}</p><p className="text-xs text-gray-500">#{transaction.id.slice(0, 8)} · {new Date(transaction.created_at).toLocaleString('id-ID')}</p></div>
                      <div className="text-right"><p className="font-bold">{formatCurrency(transaction.total_amount)}</p><p className="text-xs text-gray-500">{transaction.payment_method}</p></div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-gray-600">{transaction.items.map((item) => `${item.menu_name} x${item.quantity}`).join(', ')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{statusLabel[transaction.order_status] ?? transaction.order_status}</span>
                        {transaction.order_status === 'pending' && <Button className="text-sm" onClick={() => updateStatus(transaction, 'processing')} disabled={updatingId === transaction.id}><span className="inline-flex items-center gap-1"><Clock3 size={14} /> Proses</span></Button>}
                        {transaction.order_status === 'processing' && <Button className="text-sm" onClick={() => updateStatus(transaction, 'completed')} disabled={updatingId === transaction.id}><span className="inline-flex items-center gap-1"><Check size={14} /> Selesai</span></Button>}
                        {(transaction.order_status === 'pending' || transaction.order_status === 'processing') && <Button variant="danger" className="text-sm" onClick={() => updateStatus(transaction, 'cancelled')} disabled={updatingId === transaction.id}><span className="inline-flex items-center gap-1"><XCircle size={14} /> Batal</span></Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card><h2 className="text-xl font-bold text-gray-900 mb-4">Menu Tersedia</h2>{menus.length === 0 ? <p className="text-gray-500">Belum ada menu tersedia.</p> : <div className="space-y-3">{menus.map((menu) => <div key={menu.id} className="flex justify-between gap-3 border-b border-gray-100 pb-3"><span className="text-gray-700">{menu.name}</span><span className="font-medium">{formatCurrency(menu.price)}</span></div>)}</div>}</Card>
        </div>
      </main>
    </div>
  );
}
