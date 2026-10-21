import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Key,
  RefreshCw,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import type { NewsArticle } from '../types/news';
import {
  queryAIAssistant,
  getCustomGroqKey,
  saveCustomGroqKey,
  clearCustomGroqKey
} from '../services/aiAssistant';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  onSelectArticleTitle?: (title: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  '¿Qué impacto tiene el litio en Sudamérica según Sofía Valenzuela?',
  '¿Cómo influyen los BRICS+ en la desdolarización del comercio según Camila Morales?',
  '¿Qué es la Extracción Directa de Litio (EDL) y qué ventajas ofrece?',
  '¿Qué recomendaciones formula el observatorio sobre la regulación ambiental EUDR?'
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  articles
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy el Asistente Académico del Observatorio de Economía & RR.II. Puedo responder tus preguntas y consultas citando las investigaciones, autores y glosarios elaborados por los estudiantes de la cátedra. ¿Sobre qué tema te gustaría consultar?',
      timestamp: 'Ahora'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [customKey, setCustomKey] = useState(getCustomGroqKey());
  const [keySavedMsg, setKeySavedMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const answer = await queryAIAssistant(query, articles);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ ${err.message || 'Ocurrió un error al consultar a Groq API.'}\n\nPuedes presionar el icono de la llave 🔑 arriba a la derecha para configurar tu GROQ_API_KEY o verificar tu archivo .env.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKey.trim()) return;
    saveCustomGroqKey(customKey.trim());
    setKeySavedMsg('¡Clave Groq guardada con éxito en tu navegador!');
    setTimeout(() => {
      setKeySavedMsg('');
      setShowKeySettings(false);
    }, 2000);
  };

  const handleClearKey = () => {
    clearCustomGroqKey();
    setCustomKey('');
    setKeySavedMsg('Clave eliminada.');
    setTimeout(() => setKeySavedMsg(''), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl h-[88vh] max-h-[750px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 font-sans">
        {/* Header */}
        <div className="px-5 py-4 bg-white/80 border-b border-slate-200/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                  Asistente Académico IA
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5" /> Groq • Mixtral 8x7B
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Respuestas basadas exclusivamente en las investigaciones de los estudiantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowKeySettings(!showKeySettings)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Configurar clave Groq API"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Key Configuration Drawer */}
        {showKeySettings && (
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Configuración de Clave Groq API
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Obtener API Key gratuita</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <form onSubmit={handleSaveKey} className="flex gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-all cursor-pointer"
              >
                Guardar
              </button>
              {customKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
                >
                  Borrar
                </button>
              )}
            </form>
            {keySavedMsg && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1.5">{keySavedMsg}</p>
            )}
          </div>
        )}

        {/* Chat Messages Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#F8F9FA] to-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none font-sans whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600">
                Consultando análisis estudiantiles y glosarios con Mixtral 8x7B...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 font-mono flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Sugerencias:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl text-[11px] bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-900 shrink-0 transition-all cursor-pointer shadow-2xs text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/60 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Haz una pregunta sobre el litio, BRICS, comercio, glosario o autores..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preguntar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
