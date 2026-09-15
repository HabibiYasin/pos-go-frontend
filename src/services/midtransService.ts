import api from './api';

let loading: Promise<void> | undefined;

export const prepareMidtrans = async (): Promise<void> => {
  if (window.snap) return;
  if (loading) return loading;
  loading = (async () => {
    const { data } = await api.get('/transaction/payment-config');
    const config = data.data;
    if (!config.enabled || !config.client_key || config.environment !== 'sandbox') {
      throw new Error('Pembayaran non-tunai belum tersedia. Silakan pilih tunai atau coba lagi nanti.');
    }
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.dataset.clientKey = config.client_key;
      const fail = () => {
        clearTimeout(timer);
        script.remove();
        reject(new Error('Halaman pembayaran gagal dimuat. Silakan coba lagi.'));
      };
      const timer = setTimeout(fail, 15000);
      script.onload = () => { clearTimeout(timer); if (window.snap) resolve(); else fail(); };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  })();
  try { await loading; } catch (error) { loading = undefined; throw error; }
};
