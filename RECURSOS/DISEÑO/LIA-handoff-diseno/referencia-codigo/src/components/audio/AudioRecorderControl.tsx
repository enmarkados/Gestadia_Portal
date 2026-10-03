import React, { useEffect, useState } from 'react';
import { Loader2, Mic, Square, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

interface AudioRecorderControlProps {
  className?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  maxDurationMs?: number;
  onError?: (error: string) => void;
  onRecordingComplete: (audio: Blob) => Promise<void> | void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function formatRecordingTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

const RECORDING_WAVEFORM_BARS = [12, 18, 10, 24, 15, 28, 13, 21, 16, 26, 11, 19, 14, 23, 12, 17];

function RecordingWaveform({ isBusy }: { isBusy: boolean }) {
  return (
    <div
      aria-label="Onda de grabacion"
      role="img"
      className="flex h-8 flex-1 items-center justify-center gap-1 overflow-hidden rounded-full bg-white/10 px-2"
    >
      {RECORDING_WAVEFORM_BARS.map((height, index) => (
        <span
          key={`${height}-${index}`}
          aria-hidden="true"
          className={cn(
            'w-1 rounded-full bg-red-400/90 shadow-[0_0_12px_rgba(248,113,113,0.45)]',
            isBusy ? 'animate-pulse' : 'animate-pulse motion-reduce:animate-none'
          )}
          style={{
            animationDelay: `${index * 70}ms`,
            animationDuration: `${720 + (index % 5) * 90}ms`,
            height: `${height}px`,
          }}
        />
      ))}
    </div>
  );
}

export function AudioRecorderControl({
  className,
  disabled = false,
  isProcessing = false,
  maxDurationMs,
  onError,
  onRecordingComplete,
  onRecordingStateChange,
}: AudioRecorderControlProps) {
  const { cancelRecording, startRecording, state, stopRecording } = useAudioRecorder({ maxDurationMs });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBusy = isSubmitting || isProcessing || state.status === 'requesting_permission' || state.status === 'stopping';
  const isDisabled = disabled || isBusy || !state.isSupported;

  useEffect(() => {
    onRecordingStateChange?.(state.status === 'recording' || state.status === 'stopping');
  }, [onRecordingStateChange, state.status]);

  const handleStart = async () => {
    await startRecording();
  };

  const handleStop = async () => {
    setIsSubmitting(true);
    try {
      const audio = await stopRecording();
      if (audio) {
        await onRecordingComplete(audio);
      } else {
        onError?.('No se pudo completar la grabacion.');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'No se pudo procesar la grabacion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.status === 'recording' || state.status === 'stopping') {
    return (
      <div
        className={cn(
          'flex min-h-12 w-full items-center gap-3 rounded-full border border-red-500 bg-black px-3 py-2 text-white shadow-lg shadow-red-950/25',
          className
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-200">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
        </span>
        <span className="min-w-14 font-mono text-sm font-bold tabular-nums">
          {formatRecordingTime(state.elapsedMs)}
        </span>
        <RecordingWaveform isBusy={isBusy} />
        <button
          type="button"
          aria-label="Detener grabacion"
          disabled={isBusy}
          onClick={handleStop}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-red-500 text-white transition hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4 fill-current" />}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={cancelRecording}
          className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-white/15 px-3 text-xs font-bold text-white/85 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="Grabar audio"
      disabled={isDisabled}
      onClick={handleStart}
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-blue-light bg-white text-brand-navy shadow-sm transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold/35 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      title={state.isSupported ? 'Grabar audio' : 'Grabacion de audio no disponible'}
    >
      {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
