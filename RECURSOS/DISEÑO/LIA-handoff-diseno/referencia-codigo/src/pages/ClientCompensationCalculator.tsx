import { useStartupTask } from '../components/app/StartupSplash';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calculator, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { LiaAppShell, deriveNotifications } from '../components/app';
import { AppButton, AppCard, EmptyState, StatusBadge } from '../components/ui';
import { asuntosApi, AsuntoSummary } from '../services/asuntosApi';
import { clientUtilitiesApi, type CompensationRecord } from '../services/clientUtilitiesApi';
import {
  buildCompensationDraftQuestion,
  CompensationClaimType,
  getClaimTypeLabel,
} from './clientUtilitiesModel';

const claimTypes: CompensationClaimType[] = ['revolving', 'hipoteca', 'prestamo'];

interface QaSelectorScaleReport {
  afterScale: number;
  beforeScale: number;
  fontSize: string;
  value: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatScale(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : 'n/d';
}

export default function ClientCompensationCalculator() {
  const { user, profile, clientView } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const claimTypeSelectRef = useRef<HTMLSelectElement>(null);
  const [consultations, setConsultations] = useState<AsuntoSummary[]>([]);
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [calcType, setCalcType] = useState<CompensationClaimType>('revolving');
  const [calcAmount, setCalcAmount] = useState('');
  const [activeResult, setActiveResult] = useState<CompensationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useStartupTask(isLoading);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [qaSelectorReport, setQaSelectorReport] = useState<QaSelectorScaleReport | null>(null);
  const qaSelectorZoom = process.env.NODE_ENV !== 'production'
    && new URLSearchParams(location.search).get('qaSelectorZoom') === '1';

  useEffect(() => {
    let isActive = true;

    if (!user) {
      setConsultations([]);
      setRecords([]);
      setActiveResult(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      asuntosApi.listAsuntos(),
      clientUtilitiesApi.listCompensationEstimates(),
    ])
      .then(([nextConsultations, nextRecords]) => {
        if (!isActive) return;
        setConsultations(nextConsultations);
        setRecords(nextRecords);
        setShowForm(nextRecords.length === 0);
        setActiveResult(nextRecords[0] || null);
      })
      .catch((error) => {
        if (!isActive) return;
        console.error('Error loading compensation calculator data', error);
        setConsultations([]);
        setRecords([]);
        setActiveResult(null);
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

  useEffect(() => {
    if (!qaSelectorZoom || isLoading) return;
    setShowForm(true);
  }, [isLoading, qaSelectorZoom]);

  useEffect(() => {
    if (!qaSelectorZoom || isLoading || !showForm) return undefined;

    const select = claimTypeSelectRef.current;
    if (!select) return undefined;

    const beforeScale = window.visualViewport?.scale ?? 1;
    select.focus({ preventScroll: true });
    setCalcType('hipoteca');

    const timer = window.setTimeout(() => {
      const afterScale = window.visualViewport?.scale ?? 1;
      const fontSize = getComputedStyle(select).fontSize;
      setQaSelectorReport({
        afterScale,
        beforeScale,
        fontSize,
        value: select.value,
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isLoading, qaSelectorZoom, showForm]);

  const notifications = deriveNotifications({
    role: 'client',
    currentUserId: user?.uid,
    consultations,
  });

  const amount = Number.parseFloat(calcAmount);
  const canCalculate = Number.isFinite(amount) && amount > 0;

  const activeResultLabel = useMemo(() => {
    if (!activeResult) return null;
    return formatCurrency(activeResult.estimatedRecovery);
  }, [activeResult]);

  const handleCreateConsultation = (record: CompensationRecord) => {
    navigate('/client', {
      state: {
        draftQuestion: buildCompensationDraftQuestion(record.claimType, record.amount, record.estimatedRecovery),
        openNewConsultation: true,
      },
    });
  };

  const handleCalculate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCalculate || !user) return;

    setIsSaving(true);
    setLoadError(null);
    try {
      const record = await clientUtilitiesApi.createCompensationEstimate({
        amount,
        claimType: calcType,
      });
      setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      setActiveResult(record);
      setShowForm(false);
      setCalcAmount('');
    } catch (error) {
      console.error('Error creating compensation estimate', error);
      setLoadError('No se pudo guardar la estimacion. Revisa el importe y vuelve a intentarlo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LiaAppShell
      role="client"
      backTo="/client/utilities"
      title="Calculadora"
      subtitle="Estimaciones guardadas"
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
            <StatusBadge tone="accent">Calculadora</StatusBadge>
            <h2 className="mt-3 text-xl font-bold text-brand-navy">Nueva estimacion</h2>
            <p className="mt-2 text-sm leading-6 text-brand-gray">
              Calcula una recuperacion orientativa y guarda el resultado para convertirlo en consulta.
            </p>
            {loadError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {loadError}
              </p>
            )}
            {records.length > 0 && (
              <AppButton className="mt-4 w-full" variant="primary" onClick={() => setShowForm((current) => !current)}>
                {showForm ? 'Ocultar formulario' : 'Nueva estimacion'}
              </AppButton>
            )}
          </AppCard>

          {showForm && (
            <AppCard className="p-4 sm:p-5">
              <form onSubmit={handleCalculate} className="grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-brand-navy">
                  Tipo de reclamacion
                  <select
                    ref={claimTypeSelectRef}
                    value={calcType}
                    onChange={(event) => setCalcType(event.target.value as CompensationClaimType)}
                    className="min-h-12 rounded-lg border border-brand-blue-light bg-white px-3 text-sm font-normal text-brand-dark focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  >
                    {claimTypes.map((type) => (
                      <option key={type} value={type}>{getClaimTypeLabel(type)}</option>
                    ))}
                  </select>
                </label>

                {qaSelectorReport && (
                  <p
                    data-qa-selector-zoom
                    role="status"
                    className="rounded-lg border border-brand-blue-light bg-brand-light px-3 py-2 text-xs font-bold text-brand-navy"
                  >
                    QA selector escala {formatScale(qaSelectorReport.beforeScale)} {'->'} {formatScale(qaSelectorReport.afterScale)} · font {qaSelectorReport.fontSize} · {getClaimTypeLabel(qaSelectorReport.value as CompensationClaimType)}
                  </p>
                )}

                <label className="grid gap-2 text-sm font-bold text-brand-navy">
                  Importe base
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={calcAmount}
                    onChange={(event) => setCalcAmount(event.target.value)}
                    placeholder="Ej. 10000"
                    className="min-h-12 rounded-lg border border-brand-blue-light bg-white px-3 text-sm font-normal text-brand-dark focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    required
                  />
                </label>

                <AppButton type="submit" variant="primary" disabled={!canCalculate} isLoading={isSaving} icon={<Calculator className="h-4 w-4" />} className="w-full">
                  {isSaving ? 'Guardando' : 'Calcular y guardar'}
                </AppButton>
              </form>
            </AppCard>
          )}

          {activeResult && activeResultLabel && (
            <AppCard className="p-5 text-center">
              <StatusBadge tone="success">Resultado seleccionado</StatusBadge>
              <p className="mt-3 text-3xl font-bold text-brand-navy">{activeResultLabel}</p>
              <p className="mt-2 text-xs leading-5 text-brand-gray">
                Estimacion orientativa para {getClaimTypeLabel(activeResult.claimType)} sobre {formatCurrency(activeResult.amount)}.
              </p>
              <AppButton className="mt-4 w-full" variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => handleCreateConsultation(activeResult)}>
                Crear consulta
              </AppButton>
            </AppCard>
          )}
        </section>

        <section className="grid gap-3">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Estimaciones guardadas</h2>
            <p className="text-sm text-brand-gray">{records.length} registros</p>
          </div>

          {isLoading ? (
            <EmptyState
              icon={<Calculator className="h-8 w-8" />}
              title="Cargando estimaciones"
              description="Estamos recuperando tu historial guardado."
            />
          ) : records.length === 0 ? (
            <EmptyState
              icon={<Calculator className="h-8 w-8" />}
              title="Sin estimaciones guardadas"
              description="Cuando calcules una reclamacion quedara guardada aqui."
            />
          ) : (
            records.map((record) => (
              <AppCard key={record.id} interactive className="p-4">
                <button
                  type="button"
                  onClick={() => setActiveResult(record)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-gold/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-brand-navy">{getClaimTypeLabel(record.claimType)}</h3>
                      <p className="mt-1 text-xs text-brand-gray">{formatDate(record.createdAt)}</p>
                    </div>
                    <StatusBadge tone={activeResult?.id === record.id ? 'accent' : 'neutral'}>
                      {formatCurrency(record.estimatedRecovery)}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-brand-gray">Importe base: {formatCurrency(record.amount)}</p>
                </button>
              </AppCard>
            ))
          )}
        </section>
      </div>
    </LiaAppShell>
  );
}
