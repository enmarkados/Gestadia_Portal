import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { BottomSheet } from '../ui/BottomSheet';
import { lawyerContactApi } from '../../services/lawyerContactApi';
import { createLawyerContactRequestId } from '../../services/lawyerContactRequestId';

export function LawyerContactForm({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phoneE164 ?? '');
  const [description, setDescription] = useState('');
  const [id] = useState(createLawyerContactRequestId);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try { await lawyerContactApi.create({ id, name, phone, description }); setDone(true); }
    catch { setError('No pudimos enviar la solicitud. Revisa el nombre y el teléfono e inténtalo de nuevo.'); }
    finally { locked.current = false; setBusy(false); }
  }
  return <BottomSheet title="Hablar con un abogado" onClose={() => { if (!busy) onClose(); }}>
    {done ? <div className="space-y-4 py-3 text-center" role="status">
      <CheckCircle2 className="mx-auto h-10 w-10 text-brand-gold" />
      <h3 className="text-lg font-semibold text-brand-navy">Solicitud enviada</h3>
      <p>Nos pondremos en contacto contigo en el teléfono indicado.</p>
      <button className="lia-user-primary w-full" onClick={onClose}>Entendido</button>
    </div> : <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-brand-gray">Déjanos tus datos para que un abogado se ponga en contacto contigo.</p>
      <label className="block text-sm font-medium">Nombre
        <input required minLength={2} maxLength={160} autoComplete="name" className="mt-1 w-full rounded-xl border border-brand-blue-light p-3" value={name} onChange={e => setName(e.target.value)} disabled={busy} />
      </label>
      <label className="block text-sm font-medium">Teléfono de contacto
        <input required type="tel" autoComplete="tel" maxLength={32} className="mt-1 w-full rounded-xl border border-brand-blue-light p-3" value={phone} onChange={e => setPhone(e.target.value)} disabled={busy} placeholder="+34 600 000 000" />
      </label>
      <label className="block text-sm font-medium">¿Qué ocurre? <span className="font-normal text-brand-gray">(opcional)</span>
        <textarea maxLength={4000} rows={4} className="mt-1 w-full rounded-xl border border-brand-blue-light p-3" value={description} onChange={e => setDescription(e.target.value)} disabled={busy} />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="lia-user-primary w-full" type="submit">{busy ? 'Enviando…' : 'Solicitar contacto'}</button>
    </form>}
  </BottomSheet>;
}
