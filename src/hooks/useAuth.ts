import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { getUsers, validateUser } from '../utils/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure permissions object exists with default values
      const userWithPermissions = {
        ...parsedUser,
        permissions: {
          dashboard: true,
          officeEquipment: true,
          electronicEquipment: true,
          vehicles: true,
          reports: true,
          userManagement: false,
          ...parsedUser.permissions
        }
      };
      setUser(userWithPermissions);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const validUser = validateUser(username, password);
    
    if (validUser) {
      // Ensure permissions object exists with default values
      const userWithPermissions = {
        ...validUser,
        permissions: {
          dashboard: true,
          officeEquipment: true,
          electronicEquipment: true,
          vehicles: true,
          reports: true,
          userManagement: false,
          ...validUser.permissions
        }
      };
      setUser(userWithPermissions);
      localStorage.setItem('currentUser', JSON.stringify(userWithPermissions));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return {
    user,
    login,
    logout,
    loading,
  };
};

export { AuthContext };