import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("zyra_token");
    if (token) {
      getProfile()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem("zyra_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("zyra_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("zyra_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
