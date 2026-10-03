import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Mic, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import { GestadiaAssistantContent } from './GestadiaAssistantContent';

const PROMPT_EXAMPLES = [
  'Quiero canjear mi carnet de conducir de Colombia o Venezuela',
  'Cómo transferir un coche de segunda mano y qué impuestos pago',
  'He perdido el carnet de conducir y necesito un duplicado urgente'
];

export function GestadiaHome({ isNewChat = false, onSelectQuickAction }) {
  const [messages, setMessages] = useState(
    isNewChat
      ? [
          {
            role: 'assistant',
            content:
              '¡Hola! Soy el asistente digital de **Gestadia**. ¿Qué duda o trámite ante la **DGT** quieres resolver hoy?',
            quickReplies: [
              { label: 'Canje de carnet extranjero' },
              { label: 'Transferencia de vehículo' },
              { label: 'Duplicado de carnet' }
            ]
          }
        ]
      : []
  );

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handlePromptExampleClick(text) {
    setInputText(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }

  function handleSend(overrideText) {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || isSending) return;

    const userMsg = { role: 'user', content: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    // Simulación de respuesta inteligente de Gestadia
    setTimeout(() => {
      let assistantMsg = {
        role: 'assistant',
        content:
          'Para gestionar tu trámite ante la **DGT**, te confirmo los requisitos oficiales:\n\n1. **Identificación oficial:** NIE, TIE o DNI en vigor y empadronamiento actualizado.\n2. **Documentación del trámite:** Permiso original o contrato de compraventa firmado.\n3. **Informe psicotécnico:** Solo requerido en canjes o renovaciones.\n\nEn **Gestadia** gestionamos la solicitud 100% online y sin necesidad de cita previa en Tráfico.',
        quickReplies: [
          { label: 'Iniciar trámite ahora (210 €)' },
          { label: 'Verificar requisitos de mi país' },
          { label: 'Hablar con un gestor' }
        ]
      };

      if (textToSend.toLowerCase().includes('canj')) {
        assistantMsg.content =
          'El **Canje de Carnet** en España se tramita bajo convenio bilateral con la DGT:\n\n* **Validez legal:** Puedes conducir un máximo de 6 meses desde la concesión de tu residencia legal.\n* **Exención de examen:** Los permisos clase B (turismos) de Colombia, Argentina, Perú y Ecuador están **exentos de examen**.\n* **Servicio Integral Gestadia:** **210 € todo incluido** (gestión telemática completa, sin cita previa y entrega en tu domicilio).\n\n¿Quieres que revisemos los requisitos de tu país emisor ahora mismo?';
        assistantMsg.quickReplies = [
          { label: 'Verificar mi carnet de Colombia' },
          { label: 'Iniciar Canje Online (210 €)' },
          { label: 'Hablar con un gestor' }
        ];
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setIsSending(false);
    }, 800);
  }

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Vista de Bienvenida (si aún no hay conversación iniciada) */}
      {messages.length === 0 ? (
        <div style={{ flex: 1, paddingBottom: 24 }}>
          {/* Saludo Personalizado */}
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(26px, 6vw, 34px)',
                fontWeight: 800,
                color: '#2C2C2C',
                lineHeight: 1.15,
                marginTop: 0,
                marginBottom: 10
              }}
            >
              ¿Qué trámite de Tráfico necesitas gestionar hoy?
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.5 }}>
              Nuestro asistente LidIA cualifica tus requisitos al instante. Tras contratar, tu gestor tramita tu expediente sin cita previa.
            </p>
          </div>

          {/* 3 Ejemplos de Consulta Contextuales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>
              Consultas habituales
            </span>
            {PROMPT_EXAMPLES.map((example, idx) => (
              <div
                key={idx}
                onClick={() => handlePromptExampleClick(example)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
              >
                <span style={{ fontSize: 14.5, color: '#2C2C2C', fontWeight: 500, lineHeight: 1.35 }}>
                  {example}
                </span>
                <ChevronRight size={18} style={{ color: '#C0392B', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vista de Conversación Activa */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === 'user' ? (
                <div className="gestadia-user-bubble">{msg.content}</div>
              ) : (
                <GestadiaAssistantContent
                  content={msg.content}
                  quickReplies={msg.quickReplies}
                  onSelectOption={(opt) => {
                    const label = opt.label || opt;
                    if (label.includes('gestor')) {
                      if (onSelectQuickAction) onSelectQuickAction('gestor');
                    } else if (label.includes('Canje') || label.includes('trámite')) {
                      handleSend(`Quiero tramitar el canje`);
                    } else {
                      handleSend(label);
                    }
                  }}
                />
              )}
            </div>
          ))}
          {isSending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13, padding: '4px 8px' }}>
              <Sparkles size={16} style={{ color: '#C0392B' }} />
              <span>El Asistente Gestadia está redactando tu respuesta...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Compositor Fijo al Pie */}
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <div className="gestadia-user-chat-input">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? 'Escuchando tu consulta...' : '¿Qué necesitas?'}
          />

          <button
            type="button"
            className="gestadia-mic-btn"
            onClick={() => setIsRecording(!isRecording)}
            aria-label="Grabar consulta por voz"
            title="Dictar consulta"
          >
            <Mic size={20} style={{ color: isRecording ? '#C0392B' : undefined }} />
          </button>

          <button
            type="button"
            className="gestadia-send-btn"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isSending}
            aria-label="Enviar consulta"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
export default GestadiaHome;
