import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(
    () => sessionStorage.getItem("admin_api_key"),
  );

  const setApiKey = useCallback((key: string | null) => {
    if (key) {
      sessionStorage.setItem("admin_api_key", key);
    } else {
      sessionStorage.removeItem("admin_api_key");
    }
    setApiKeyState(key);
  }, []);

  const logout = useCallback(() => {
    setApiKey(null);
  }, [setApiKey]);

  const value = useMemo(
    () => ({ apiKey, setApiKey, logout }),
    [apiKey, setApiKey, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
