import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { login } from '../services/auth';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas.');
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al procesar el inicio de sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@observatorio.edu');
    setPassword('admin2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <button
          onClick={onBackToHome}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Observatorio</span>
        </button>

        {/* Card Principal Apple Glassmorphism */}
        <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shadow-md mx-auto">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider font-mono">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Área Restringida
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-sans">
                Acceso Administrativo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Panel de moderación, edición y aprobación editorial de investigaciones de Relaciones Internacionales.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 relative z-10">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-slate-700 tracking-wide"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@observatorio.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-700 tracking-wide"
                >
                  Contraseña de Moderador
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-300 ease-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel de Moderación</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Credentials Card */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 text-center">
            <p className="text-[11px] text-slate-400 font-normal">
              Acceso institucional para docentes y coordinadores de cátedra.
            </p>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer transition-colors"
            >
              Completar credenciales predeterminadas (admin2026)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
