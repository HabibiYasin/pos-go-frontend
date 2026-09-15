import { useState, useEffect } from 'react';
import { Bug } from 'lucide-react';
import { useDebugDateStore } from '../../store/debugDateStore';

const locale = 'id-ID';
const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};
const timeOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

export default function DateTimeWidget({ debug = false, resetDebugOnMount = false }: { debug?: boolean; resetDebugOnMount?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const debugDate = useDebugDateStore((state) => state.date);
  const setDebugDate = useDebugDateStore((state) => state.setDate);

  useEffect(() => {
    if (resetDebugOnMount) setDebugDate('');
  }, [resetDebugOnMount, setDebugDate]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const displayedDate = new Date(now);
  if (debug && debugDate) {
    const [year, month, day] = debugDate.split('-').map(Number);
    displayedDate.setFullYear(year, month - 1, day);
  }
  const dateStr = displayedDate.toLocaleDateString(locale, dateOptions);
  const timeStr = now.toLocaleTimeString(locale, timeOptions);

  return (
    <div className="relative flex flex-wrap items-center gap-2 text-sm text-gray-600">
      {debug && (
        <>
          <button
            type="button"
            data-testid="debug-date-toggle"
            aria-label="Debug tanggal"
            aria-expanded={isDebugOpen}
            onClick={() => setIsDebugOpen(!isDebugOpen)}
            className={`rounded-lg border p-2 ${debugDate ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-300 hover:bg-gray-200'}`}
          >
            <Bug size={16} />
          </button>
          {isDebugOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
              <label htmlFor="debug-date" className="mb-2 block font-medium">Tanggal debug</label>
              <input
                id="debug-date"
                type="date"
                data-testid="debug-date-input"
                value={debugDate}
                onChange={(event) => setDebugDate(event.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <p className="mt-2 text-xs">Hari mengikuti tanggal yang dipilih. Reset saat refresh atau kembali dari checkout.</p>
              <p className="mt-2 text-xs">Tanggal ini dipakai untuk simulasi voucher. Pembuatan pesanan memakai tanggal asli.</p>
              <button type="button" onClick={() => setDebugDate('')} className="mt-3 text-teal-700 hover:underline">Gunakan tanggal asli</button>
            </div>
          )}
        </>
      )}
      <span>{dateStr}</span>
      <span className="hidden sm:inline text-gray-300">·</span>
      <span className="tabular-nums font-medium text-gray-800">{timeStr}</span>
    </div>
  );
}
