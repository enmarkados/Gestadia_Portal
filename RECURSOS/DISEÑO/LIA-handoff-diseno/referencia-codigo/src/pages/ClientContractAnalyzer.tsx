import { useStartupTask } from '../components/app/StartupSplash';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Paperclip, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { LiaAppShell, deriveNotifications } from '../components/app';
import { AppButton, AppCard, EmptyState, StatusBadge } from '../components/ui';
import { asuntosApi, AsuntoSummary } from '../services/asuntosApi';
import { clientUtilitiesApi, type ContractAnalysisRecord } from '../services/clientUtilitiesApi';
import { buildContractAnalysisDraftQuestion } from './clientUtilitiesModel';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function ClientContractAnalyzer() {
  const { user, profile, clientView } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<AsuntoSummary[]>([]);
  const [records, setRecords] = useState<ContractAnalysisRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [contractText, setContractText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useStartupTask(isLoading);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      setConsultations([]);
      setRecords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      asuntosApi.listAsuntos(),
      clientUtilitiesApi.listContractAnalyses(),
    ])
      .then(([nextConsultations, nextRecords]) => {
        if (!isActive) return;
        setConsultations(nextConsultations);
        setRecords(nextRecords);
        setShowForm(nextRecords.length === 0);
      })
      .catch((error) => {
        if (!isActive) return;
        console.error('Error loading contract analyzer data', error);
        setConsultations([]);
        setRecords([]);
        setShowForm(true);
        setLoadError('No se pudo cargar el historial. Puedes intentar de nuevo en unos segundos.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  const notifications = deriveNotifications({
    role: 'client',
    currentUserId: user?.uid,
    consultations,
  });

  const canAnalyze = contractText.trim().length >= 10;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && !contractText.trim() && file.type.startsWith('text/')) {
      setContractText(await file.text());
    }
  };

  const handleCreateConsultation = (record: ContractAnalysisRecord) => {
    navigate('/client', {
      state: {
        draftQuestion: buildContractAnalysisDraftQuestion(record.result),
        openNewConsultation: true,
      },
    });
  };

  const handleAnalyze = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canAnalyze || !user) return;

    setIsAnalyzing(true);
    setLoadError(null);
    try {
      const record = await clientUtilitiesApi.createContractAnalysis({
        file: selectedFile,
        text: contractText,
      });
      setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      setContractText('');
      setSelectedFile(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error analyzing contract', error);
      setLoadError('No se pudo guardar el analisis. Revisa el texto o el adjunto y vuelve a intentarlo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasRecords = records.length > 0;
  const latestRecord = useMemo(() => records[0] || null, [records]);

  return (
    <LiaAppShell
      role="client"
      backTo="/client/utilities"
      title="Analizador"
      subtitle="Contratos y documentos"
      notifications={notifications}
      onNewConsultation={() => navigate('/client', { state: { openNewConsultation: true } })}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="grid gap-4">
          {clientView === 'client' && <button
            type="button"
            onClick={() => navigate('/client/utilities')}
            className="inline-flex w-fit items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold/35"
          >
            <ArrowLeft className="h-4 w-4" />
            Utilidades
          </button>}

          <AppCard className="p-5">
            <StatusBadge tone="accent">Analizador</StatusBadge>
            <h2 className="mt-3 text-xl font-bold text-brand-navy">Analiza un contrato nuevo</h2>
            <p className="mt-2 text-sm leading-6 text-brand-gray">
              Guarda cada analisis, conserva el documento asociado y crea una consulta desde cualquier resultado.
            </p>
            {loadError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {loadError}
              </p>
            )}
            {hasRecords && (
              <AppButton className="mt-4 w-full" variant="primary" onClick={() => setShowForm((current) => !current)}>
                {showForm ? 'Ocultar formulario' : 'Nuevo analisis'}
              </AppButton>
            )}
          </AppCard>

          {showForm && (
            <AppCard className="p-4 sm:p-5">
              <form onSubmit={handleAnalyze} className="grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-brand-navy">
                  Texto del contrato
                  <textarea
                    rows={7}
                    className="min-h-[180px] resize-none rounded-lg border border-brand-blue-light bg-brand-light/40 p-4 font-mono text-sm font-normal text-brand-dark focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30 sm:min-h-[260px]"
                    placeholder="Pega aqui clausulas, condiciones o comunicaciones..."
                    value={contractText}
                    onChange={(event) => setContractText(event.target.value)}
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold text-brand-navy">
                  Documento adjunto
                  <span className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-brand-blue-light bg-white px-4 text-sm font-medium text-brand-gray">
                    <Paperclip className="h-5 w-5 text-brand-navy" />
                    <span className="min-w-0 flex-1 truncate">{selectedFile ? selectedFile.name : 'Adjuntar contrato o documento'}</span>
                    <input className="sr-only" type="file" accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,text/rtf" onChange={handleFileChange} />
                  </span>
                </label>

                <AppButton
                  type="submit"
                  variant="primary"
                  isLoading={isAnalyzing}
                  disabled={!canAnalyze}
                  icon={<Sparkles className="h-4 w-4" />}
                  className="w-full"
                >
                  {isAnalyzing ? 'Analizando' : 'Analizar y guardar'}
                </AppButton>
              </form>
            </AppCard>
          )}

          {latestRecord && (
            <AppCard className="p-4">
              <StatusBadge tone="info">Ultimo analisis</StatusBadge>
              <h3 className="mt-3 text-base font-bold text-brand-navy">{latestRecord.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-brand-gray">{latestRecord.result}</p>
              <AppButton className="mt-4 w-full" variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => handleCreateConsultation(latestRecord)}>
                Crear consulta
              </AppButton>
            </AppCard>
          )}
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-brand-navy">Analisis guardados</h2>
              <p className="text-sm text-brand-gray">{records.length} registros</p>
            </div>
          </div>

          {isLoading ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Cargando analisis"
              description="Estamos recuperando tu historial guardado."
            />
          ) : records.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Sin analisis guardados"
              description="Cuando analices un contrato quedara guardado aqui."
            />
          ) : (
            records.map((record) => (
              <AppCard key={record.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-brand-navy">{record.title}</h3>
                    <p className="mt-1 text-xs text-brand-gray">{formatDate(record.createdAt)}</p>
                  </div>
                  <StatusBadge tone={record.documentName ? 'accent' : 'neutral'}>
                    {record.documentName ? 'Adjunto' : 'Texto'}
                  </StatusBadge>
                </div>
                {record.documentName && <p className="mt-3 truncate text-xs font-medium text-brand-gray">{record.documentName}</p>}
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-dark">{record.result}</p>
                <AppButton className="mt-4 w-full" variant="secondary" icon={<Send className="h-4 w-4" />} onClick={() => handleCreateConsultation(record)}>
                  Crear consulta
                </AppButton>
              </AppCard>
            ))
          )}
        </section>
      </div>
    </LiaAppShell>
  );
}
