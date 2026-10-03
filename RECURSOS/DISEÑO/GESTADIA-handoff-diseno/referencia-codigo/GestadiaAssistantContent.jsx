import React from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, FileCheck, ShieldCheck } from 'lucide-react';

/**
 * GestadiaAssistantContent
 * Renderiza respuestas del asistente DGT en Markdown semántico limpio:
 * - Convierte negritas (**texto**), saltos de línea y viñetas en etiquetas HTML semánticas.
 * - Elimina defectos de asteriscos sin procesar.
 * - Renderiza botones de acción rápida (Quick Replies) interactivos.
 */
export function GestadiaAssistantContent({ content, quickReplies = [], onSelectOption }) {
  // Parser semántico simple para párrafos, negritas y listas
  function formatMarkdown(text) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let listType = null;

    function flushList() {
      if (currentList.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${elements.length}`} style={{ margin: '8px 0', paddingLeft: '22px' }}>
              {currentList.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {currentList.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
        listType = null;
      }
    }

    function parseInline(str) {
      const parts = [];
      const regex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} style={{ color: '#1F1F1F', fontWeight: 700 }}>
            {match[1]}
          </strong>
        );
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }

      return parts;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      // Elemento de lista ordenada (1. , 2. )
      const olMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (olMatch) {
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        currentList.push(olMatch[2]);
        continue;
      }

      // Elemento de lista no ordenada (- o * )
      const ulMatch = line.match(/^[-*]\s+(.*)/);
      if (ulMatch) {
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        currentList.push(ulMatch[1]);
        continue;
      }

      flushList();
      elements.push(
        <p key={`p-${i}`} style={{ marginBottom: '8px', lineHeight: 1.55 }}>
          {parseInline(line)}
        </p>
      );
    }

    flushList();
    return elements;
  }

  return (
    <div className="gestadia-assistant-bubble">
      {/* Encabezado del Asistente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: '#FDEDEC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C0392B',
            fontWeight: 800,
            fontSize: 12
          }}
        >
          G.
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#2C2C2C' }}>
          Asistente Virtual DGT · IA Preventa
        </span>
      </div>

      {/* Contenido Formateado */}
      <div>{formatMarkdown(content)}</div>

      {/* Píldoras / Acciones Rápidas (Quick Replies) */}
      {quickReplies && quickReplies.length > 0 && (
        <div className="gestadia-reply-options" style={{ marginTop: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
          {quickReplies.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className="gestadia-reply-chip"
              onClick={() => onSelectOption && onSelectOption(option)}
            >
              <span>{option.label || option}</span>
              <ChevronRight size={15} style={{ color: '#C0392B' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default GestadiaAssistantContent;
