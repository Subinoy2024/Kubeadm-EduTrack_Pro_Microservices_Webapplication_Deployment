import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

type AppRole = "admin" | "teacher" | "student";

interface AppUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: AppRole | null;
}

interface AuthContextType {
  user: AppUser | null;
  session: null;
  loading: boolean;
  role: AppRole | null;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  profile: null,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  const applyUserState = (backendUser: any) => {
    const nextUser: AppUser = {
      id: backendUser.id,
      email: backendUser.email,
      first_name: backendUser.first_name ?? null,
      last_name: backendUser.last_name ?? null,
      phone: backendUser.phone ?? null,
      avatar_url: backendUser.avatar_url ?? null,
      role: (backendUser.role ?? "student") as AppRole,
    };

    setUser(nextUser);
    setRole((backendUser.role ?? "student") as AppRole);
    setProfile({
      full_name:
        `${backendUser.first_name ?? ""} ${backendUser.last_name ?? ""}`.trim() || null,
      avatar_url: backendUser.avatar_url ?? null,
    });
  };

  const clearAuthState = () => {
    api.clearTokens();
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    try {
      const token = api.getAccessToken();

      if (!token) {
        clearAuthState();
        return;
      }

      const meRes = await api.auth.getMe();

      if (!meRes.success || !meRes.data?.user) {
        clearAuthState();
        return;
      }

      applyUserState(meRes.data.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      clearAuthState();
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };

    bootstrap();
  }, []);

  const signOut = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.warn("Logout request failed, clearing local session anyway:", error);
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        loading,
        role,
        profile,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);