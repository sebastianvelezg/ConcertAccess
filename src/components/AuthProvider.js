"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      redirectUser(userData);
    }
  }, []);

  const redirectUser = (userData) => {
    switch (userData.role) {
      case "admin":
        router.push("/admin/add-route");
        break;
      case "staff":
        router.push("/staff");
        break;
      default:
        router.push("/user");
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    redirectUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
