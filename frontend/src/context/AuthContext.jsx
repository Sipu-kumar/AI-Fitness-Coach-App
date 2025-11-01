import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logout } from '../api/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(res => setUser(res.data.user)).catch(() => setUser(null));
  }, []);

  const doLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, doLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
