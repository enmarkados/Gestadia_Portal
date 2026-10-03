import { useEffect, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAppShell } from '../components/user/UserAppShell';
import { asuntosApi, type AsuntoSummary } from '../services/asuntosApi';
import { useAuth } from '../components/AuthContext';
import { useStartupTask } from '../components/app/StartupSplash';

function dateLabel(date: string) {
  const value = new Date(date);
  const now = new Date();
  if (value.toDateString() === now.toDateString()) return 'Hoy';
  now.setDate(now.getDate() - 1);
  return value.toDateString() === now.toDateString() ? 'Ayer' : value.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
export default function UserQueries() {
  const { profile } = useAuth();
  const [queries, setQueries] = useState<AsuntoSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  useStartupTask(loading);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError(false); setQueries([]);
    asuntosApi.listAsuntos().then(rows => { if (active) setQueries(rows); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile?.uid, retry]);
  const shown = queries.filter(q => `${q.title} ${q.lastMessagePreview ?? q.question}`.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')));
  return <UserAppShell><div className="mx-auto max-w-[850px] px-5 py-6">
    <h1 className="text-[26px] font-bold">Mis consultas</h1>
    <p className="mt-2 mb-5 text-[15px] text-[#5b6b82]">Aquí encontrarás tus conversaciones con LIA.</p>
    <label className="mb-5 flex items-center gap-2 rounded-[14px] border border-[#d9e0ea] bg-white px-4 py-3"><Search size={18} className="text-[#5b6b82]" /><input className="w-full min-w-0 outline-none" aria-label="Buscar consultas" placeholder="Buscar en mis consultas…" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {loading ? <p role="status">Cargando consultas…</p> : error ? <p role="alert">No se pudieron cargar. <button className="underline" onClick={() => setRetry(r => r + 1)}>Reintentar</button></p> : shown.length === 0 ? <p className="py-6 text-center text-[#5b6b82]">{search ? 'No encontramos consultas con esa búsqueda.' : 'Tu primera conversación aparecerá aquí.'}</p> : <div className="overflow-hidden rounded-2xl border border-[#e6eaf0] bg-white">{shown.map(q => <Link key={q.id} to={`/client?consulta=${encodeURIComponent(q.id)}`} className="flex items-center gap-3 border-b border-[#eef1f5] px-4 py-4 last:border-0">
      <div className="min-w-0 flex-1"><h2 className="truncate text-[15px] font-semibold">{q.title}</h2><p className="mt-1 truncate text-[13px] text-[#5b6b82]">{q.lastMessagePreview ?? q.question}</p></div>
      <span className="shrink-0 text-xs text-[#5b6b82]">{dateLabel(q.updatedAt)}</span><ChevronRight className="shrink-0 text-[#9a7a24]" size={17} />
    </Link>)}</div>}
  </div></UserAppShell>;
}
