import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, Sparkles, TriangleAlert } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useStartupTask } from '../components/app/StartupSplash';
import { UserAppShell, useUserKeyboard } from '../components/user/UserAppShell';
import { AudioRecorderControl } from '../components/audio/AudioRecorderControl';
import { SpeechAudioPlayback } from '../components/audio/SpeechAudioPlayback';
import { asuntosApi, type AsuntoDetail } from '../services/asuntosApi';
import { asuntoAiApi } from '../services/asuntoAiApi';
import { speechApi } from '../services/speechApi';
import { conversationMessages, userConversation, UserConversationReplyError, UserConversationValidationError } from '../services/userConversation';
import { MIN_CONSULTATION_QUESTION_LENGTH } from '../../shared/consultationValidation';
import { getLiaReplyOptions } from '../services/liaReplyOptions';
import { LiaResponseContent } from '../components/lia/LiaResponseContent';
import { canComposeConversation, conversationRecovery, createConversationScope } from '../services/userConversationState';

const examples = [
  'Quiero reclamar una tarjeta revolving con intereses altos',
  'Tengo dudas con una cláusula de mi contrato',
  'Mi expareja no cumple lo acordado con los niños',
];
export default function UserHome() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryId = params.get('consulta');
  const [isNewChat, setIsNewChat] = useState(Boolean(location.state?.newChat));
  const [detail, setDetail] = useState<AsuntoDetail | null>(null);
  const detailRef = useRef<AsuntoDetail | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const lock = useRef(false);
  const [scope] = useState(createConversationScope);
  const [loading, setLoading] = useState(Boolean(queryId));
  useStartupTask(loading);
  const [error, setError] = useState('');
  const [validationWarning, setValidationWarning] = useState('');
  const [replyAction, setReplyAction] = useState<'initial' | 'reply' | null>(null);
  const [loadRetry, setLoadRetry] = useState(0);
  const retryRef = useRef(loadRetry);
  const scrollEnd = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const { hideFooter, height, top } = useUserKeyboard();
  const uidRef = useRef(profile?.uid);
  useEffect(() => () => scope.invalidate(), [scope]);
  useEffect(() => {
    if (uidRef.current !== profile?.uid) { detailRef.current = null; setDetail(null); setText(''); setIsNewChat(false); uidRef.current = profile?.uid; }
    const requestedRetry = retryRef.current !== loadRetry;
    retryRef.current = loadRetry;
    if (queryId === detailRef.current?.id && !requestedRetry) return;
    scope.invalidate(); lock.current = false; setBusy(false);
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    detailRef.current = null; setDetail(null); setError(''); setValidationWarning(''); setReplyAction(null);
    if (!queryId) { setLoading(false); return; }
    setIsNewChat(false);
    setLoading(true);
    async function read() {
      try {
        const value = await asuntosApi.getAsunto(queryId!);
        if (!active) return;
        detailRef.current = value; setDetail(value);
        const recovery = conversationRecovery(value);
        setReplyAction(recovery.action); setError(recovery.error);
        if (value.aiStatus === 'queued' || value.aiStatus === 'processing') timer = setTimeout(read, 1500);
      } catch { if (active) setError('No pudimos abrir esta consulta.'); }
      finally { if (active) setLoading(false); }
    }
    void read();
    return () => { active = false; clearTimeout(timer); };
  }, [queryId, profile?.uid, loadRetry, scope]);
  useEffect(() => { scrollEnd.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [detail, busy]);
  function newChat() {
    if (lock.current) return;
    scope.invalidate();
    detailRef.current = null; setDetail(null); setText(''); setError(''); setReplyAction(null);
    setValidationWarning('');
    if (input.current) input.current.style.height = 'auto';
    setIsNewChat(true);
    navigate('/client', { replace: true, state: null });
  }
  useEffect(() => { if (location.state?.newChat) newChat(); }, [location.state?.newChat]);
  useEffect(() => {
    if (typeof location.state?.draftQuestion === 'string' && !lock.current) { newChat(); setText(location.state.draftQuestion); }
  }, [location.state?.draftQuestion]);
  async function submit(value: string, isCurrent: () => boolean, audioJobId?: string) {
    if (!value.trim() || !isCurrent()) return;
    setError(''); setValidationWarning(''); setReplyAction(null);
    try {
      const saved = await userConversation.submit(detailRef.current, value.trim(), audioJobId, persisted => {
        if (!isCurrent()) return;
        detailRef.current = persisted; setDetail(persisted); setText('');
        if (!queryId) navigate(`/client?consulta=${encodeURIComponent(persisted.id)}`, { replace: true });
      });
      if (!isCurrent()) return;
      detailRef.current = saved; setDetail(saved);
      if (audioJobId) {
        const latest = [...saved.messages].reverse().find(m => m.senderRole === 'ai' && m.channel === 'lia');
        if (latest?.text?.trim()) {
          try {
            const tts = await speechApi.createOptionalSynthesisJob({ contextType: 'asunto', contextId: saved.id, sourceMessageId: latest.id, text: latest.text });
            if (isCurrent() && tts?.audioAttachment) {
              const spoken = { ...saved, messages: saved.messages.map(m => m.id === latest.id ? { ...m, audioAttachments: [...(m.audioAttachments ?? []), tts.audioAttachment!] } : m) };
              detailRef.current = spoken; setDetail(spoken);
            }
          } catch { if (isCurrent()) setError('LIA ha respondido, pero el audio no está disponible.'); }
        }
      }
    } catch (e) {
      if (!isCurrent()) return;
      if (e instanceof UserConversationValidationError) { setText(value); setValidationWarning(e.message); input.current?.focus(); }
      else if (e instanceof UserConversationReplyError) { setReplyAction(e.action); setError('Tu mensaje está guardado. No pudimos obtener la respuesta de LIA.'); }
      else { setText(value); setError('No pudimos guardar el mensaje. Inténtalo de nuevo.'); }
    }
  }
  async function send(value = text) {
    if (lock.current || isRecordingAudio || !canComposeConversation(queryId, detailRef.current, loading) || !value.trim() || replyAction) return;
    const isCurrent = scope.capture();
    lock.current = true; setBusy(true);
    try { await submit(value, isCurrent); } finally { if (isCurrent()) { lock.current = false; setBusy(false); } }
  }
  async function record(audio: Blob) {
    if (lock.current || !canComposeConversation(queryId, detailRef.current, loading) || replyAction) return;
    const isCurrent = scope.capture();
    lock.current = true; setBusy(true); setError(''); setValidationWarning('');
    try {
      let job = await speechApi.createTranscriptionJob({ audio, contextType: detailRef.current ? 'asunto' : 'lia_session', contextId: detailRef.current?.id ?? `client-chat-${profile?.uid}`, targetChannel: 'lia' });
      if (job.status !== 'completed') job = await speechApi.waitForTranscriptionJob(job.id);
      if (job.status !== 'completed' || !job.transcription?.trim()) throw new Error('STT no disponible');
      await submit(job.transcription, isCurrent, job.id);
    } catch { if (isCurrent()) setError('No pudimos transcribir el audio. Puedes volver a grabar o escribir tu consulta.'); }
    finally { if (isCurrent()) { lock.current = false; setBusy(false); } }
  }
  async function retryReply() {
    if (lock.current || !detailRef.current || !replyAction) return;
    const isCurrent = scope.capture();
    lock.current = true; setBusy(true); setError('');
    try {
      const saved = await (replyAction === 'initial' ? asuntoAiApi.generateConsultation(detailRef.current.id) : asuntoAiApi.createChatReply(detailRef.current.id));
      if (!isCurrent()) return;
      detailRef.current = saved; setDetail(saved); setReplyAction(null);
    } catch { if (isCurrent()) setError('LIA sigue sin poder responder. Puedes reintentarlo en unos momentos.'); }
    finally { if (isCurrent()) { lock.current = false; setBusy(false); } }
  }
  const messages = detail ? conversationMessages(detail) : [];
  const lastMessage = messages.at(-1);
  const replyOptions = lastMessage?.senderRole === 'ai' ? getLiaReplyOptions(lastMessage.text) : [];
  const canCompose = canComposeConversation(queryId, detail, loading) && !replyAction;
  return <UserAppShell onNewChat={newChat} hideFooter={hideFooter} viewportHeight={height} viewportTop={top} footer={<div className="mx-auto w-full max-w-[850px] px-4 pb-3 pt-2">
    <form className="lia-user-chat-input" onSubmit={e => { e.preventDefault(); void send(); }}>
      <textarea ref={input} className={isRecordingAudio ? 'hidden' : undefined} rows={1} maxLength={12000} aria-label="Escribe tu consulta" aria-invalid={Boolean(validationWarning)} aria-describedby={validationWarning ? 'consultation-warning' : undefined} placeholder="Escribe o dicta tu consulta…" value={text} disabled={busy || !canCompose} onChange={e => { setText(e.target.value); if (e.target.value.trim().length >= MIN_CONSULTATION_QUESTION_LENGTH) setValidationWarning(''); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />
      <AudioRecorderControl className={isRecordingAudio ? 'min-w-0 flex-1' : 'shrink-0'} disabled={busy || !canCompose} isProcessing={busy} onRecordingComplete={record} onRecordingStateChange={setIsRecordingAudio} onError={setError} />
      <button aria-label="Enviar consulta" type="submit" onPointerDown={e => e.preventDefault()} disabled={busy || !canCompose || !text.trim() || isRecordingAudio} className={`${isRecordingAudio ? 'hidden' : 'flex'} h-10 w-10 items-center justify-center rounded-full bg-[#c49b36] disabled:opacity-50`}><ArrowRight size={22} /></button>
    </form>
    {validationWarning && <div id="consultation-warning" role="alert" className="mt-2 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div><p className="font-semibold">Necesito un poco más de información</p><p>{validationWarning}</p></div>
    </div>}
  </div>}>
    <div className="mx-auto max-w-[850px] px-5 py-6">
      {loading ? <p role="status">Cargando conversación…</p> : !detail && !queryId ? isNewChat ? <div className="flex items-start gap-2">
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e6eaf0] bg-white"><Sparkles size={15} /></div>
        <article className="lia-user-message border border-[#e6eaf0] bg-white" aria-label="Respuesta de LIA"><p>¿En qué te puedo ayudar?</p></article>
      </div> : <>
        <p className="text-[15px] text-[#5b6b82]">Hola{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}</p>
        <h1 className="mt-1 mb-3 max-w-lg text-[28px] font-bold leading-[1.15] md:text-[38px]">¿En qué te puedo ayudar hoy?</h1>
        <p className="max-w-xl text-[15px] leading-[1.5] text-[#5b6b82]">Cuéntame tu problema con tus palabras. Te oriento y, si hace falta, lo paso a un abogado.</p>
        <h2 className="mt-5 mb-2 text-[12px] font-bold tracking-[1.5px] text-[#5b6b82]">EJEMPLOS</h2>
        <div className="space-y-2.5">{examples.map(example => <button key={example} className="flex w-full items-center justify-between gap-4 rounded-[14px] border border-[#d9e0ea] bg-white px-3.5 py-3 text-left text-[15px] leading-[1.2]" onClick={() => { setText(example); input.current?.focus(); }}><span>{example}</span><ChevronRight size={20} className="shrink-0 text-[#9a7a24]" /></button>)}</div>
      </> : <div className="space-y-4">{messages.map(m => <div key={m.id} className={`flex items-start gap-2 ${m.senderRole === 'client' ? 'justify-end' : ''}`}>
        {m.senderRole !== 'client' && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e6eaf0] bg-white"><Sparkles size={15} /></div>}
        <div className="min-w-0 max-w-[min(85%,600px)]">
          <article className={`lia-user-message !max-w-full ${m.senderRole === 'client' ? 'bg-[#1c2e4a] text-white' : 'border border-[#e6eaf0] bg-white'}`} aria-label={m.senderRole === 'client' ? 'Tu mensaje' : 'Respuesta de LIA'}>
            {m.senderRole === 'ai' ? <LiaResponseContent text={m.text} /> : <p className="whitespace-pre-wrap">{m.text}</p>}{m.audioAttachments?.map(a => <div key={a.url}><SpeechAudioPlayback attachment={a} className="mt-3" /></div>)}
          </article>
          {m.id === lastMessage?.id && replyOptions.length > 0 && <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Opciones para responder a LIA">
            {replyOptions.map(option => <button key={option} type="button" disabled={busy || !canCompose || detail?.aiStatus === 'queued' || detail?.aiStatus === 'processing'} aria-label={`Responder: ${option}`} className="min-h-10 rounded-[20px] border border-[#d9e0ea] bg-white px-3.5 py-2 text-left text-[15px] text-[#1c2e4a] hover:border-[#c49b36] disabled:opacity-50" onClick={() => { void send(option); }}>{option}</button>)}
          </div>}
        </div>
      </div>)}</div>}
      {(busy || detail?.aiStatus === 'queued' || detail?.aiStatus === 'processing') && <p className="mt-4 text-sm text-[#5b6b82]" role="status">LIA está preparando tu respuesta…</p>}
      {error && <div className="mt-4 rounded-xl border border-[#d9e0ea] bg-white p-3 text-sm" role="alert"><p>{error}</p>{replyAction ? <button disabled={busy} className="mt-2 font-semibold underline" onClick={retryReply}>Reintentar respuesta</button> : queryId && !canCompose ? <button className="mt-2 underline" onClick={() => setLoadRetry(r => r + 1)}>Reintentar carga</button> : null}</div>}
      <div ref={scrollEnd} />
    </div>
  </UserAppShell>;
}
