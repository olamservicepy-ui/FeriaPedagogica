import { initSupabase } from './storage';

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  token?: string;
  loggedInAt: string;
}

const AUTH_STORAGE_KEY = 'observatorio_admin_auth_v1';

// Configurable Admin Password from env or safe default
const ENV_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim();
const DEFAULT_ADMIN_PASSWORD = ENV_ADMIN_PASSWORD || 'admin2026';
const DEFAULT_ADMIN_EMAIL = 'admin@observatorio.edu';

/**
 * Check if there is an active authenticated admin session
 */
export function isAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const session: AdminUser = JSON.parse(raw);
    return Boolean(session && session.email && session.role === 'admin');
  } catch {
    return false;
  }
}

/**
 * Get currently authenticated admin user
 */
export function getAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Authenticate admin user
 * 1. Attempts Supabase Auth if Supabase client is configured.
 * 2. Fallbacks to environment-configured VITE_ADMIN_PASSWORD token.
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Por favor, ingresa tu correo y contraseña.' };
  }

  // 1. Try Supabase Auth if available
  const supabase = initSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.session?.user) {
        const adminUser: AdminUser = {
          email: data.session.user.email || cleanEmail,
          name: data.session.user.user_metadata?.full_name || 'Editor Académico',
          role: 'admin',
          token: data.session.access_token,
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
    } catch (err) {
      console.warn('Supabase auth attempt failed, falling back to local admin check:', err);
    }
  }

  // 2. Token / Environment Variable authentication
  // Matches against VITE_ADMIN_PASSWORD or default admin2026
  if (cleanPassword === DEFAULT_ADMIN_PASSWORD) {
    const adminUser: AdminUser = {
      email: cleanEmail || DEFAULT_ADMIN_EMAIL,
      name: cleanEmail.split('@')[0].toUpperCase() || 'Editor Responsable',
      role: 'admin',
      token: 'admin-token-' + Date.now(),
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    return { success: true, user: adminUser };
  }

  return {
    success: false,
    error: 'Credenciales inválidas. Verifica tu correo y contraseña de administración.',
  };
}

/**
 * Logout admin user and terminate session
 */
export async function logout(): Promise<void> {
  const supabase = initSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out from Supabase:', err);
    }
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
