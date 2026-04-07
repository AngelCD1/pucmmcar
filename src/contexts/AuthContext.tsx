import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  studentId: string;
  career: string;
  role: "driver" | "passenger" | "admin";
  verified: boolean;
  rating: number;
  tripsCompleted: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Usuario simulado — reemplazar con llamada real a API cuando el backend esté listo
const MOCK_USER: User = {
  id: "usr_001",
  name: "Jonathan Báez",
  initials: "JB",
  email: "j_baez@ce.pucmm.edu.do",
  studentId: "10161606",
  career: "Ingeniería de Sistemas",
  role: "driver",
  verified: true,
  rating: 4.9,
  tripsCompleted: 128,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar desde localStorage para que la sesión persista al recargar
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("pucmmcar_user");
    return stored ? JSON.parse(stored) : MOCK_USER; // inicio de sesión automático con simulacro por ahora
  });

  const login = async (_email: string, _password: string) => {
    // TODO: reemplazar con llamada real a API: await api.post('/auth/login', { email, password })
    localStorage.setItem("pucmmcar_user", JSON.stringify(MOCK_USER));
    setUser(MOCK_USER);
  };

  const logout = () => {
    localStorage.removeItem("pucmmcar_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
