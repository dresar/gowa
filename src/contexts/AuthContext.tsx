import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Auth Context for GoWA
interface Credentials {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  credentials: Credentials | null;
  deviceId: string | null;
  preferredDeviceId: string | null;
  isServerOnline: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  setActiveDevice: (deviceId: string | null) => void;
  setPreferredDevice: (deviceId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(null);
  const [isServerOnline, setIsServerOnline] = useState(true);

  useEffect(() => {
    const storedCredentials = localStorage.getItem('gowa_credentials');
    const storedDeviceId = localStorage.getItem('gowa_device_id');
    const storedPreferredId = localStorage.getItem('gowa_preferred_device_id');

    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
    }
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    }
    if (storedPreferredId) {
      setPreferredDeviceId(storedPreferredId);
    }

    // Monitor server status periodically
    const checkStatus = () => {
      import('@/lib/api').then(({ getServerOnlineStatus }) => {
        setIsServerOnline(getServerOnlineStatus());
      });
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const login = (username: string, password: string) => {
    const creds = { username, password };
    localStorage.setItem('gowa_credentials', JSON.stringify(creds));
    setCredentials(creds);
  };

  const logout = () => {
    localStorage.removeItem('gowa_credentials');
    localStorage.removeItem('gowa_device_id');
    localStorage.removeItem('gowa_preferred_device_id');
    setCredentials(null);
    setDeviceId(null);
    setPreferredDeviceId(null);
  };

  const setActiveDevice = (id: string | null) => {
    if (id) {
      localStorage.setItem('gowa_device_id', id);
    } else {
      localStorage.removeItem('gowa_device_id');
    }
    setDeviceId(id);
  };

  const setPreferredDevice = (id: string | null) => {
    if (id) {
      localStorage.setItem('gowa_preferred_device_id', id);
      // When setting preferred, also make it active
      setActiveDevice(id);
    } else {
      localStorage.removeItem('gowa_preferred_device_id');
    }
    setPreferredDeviceId(id);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!credentials,
        credentials,
        deviceId,
        preferredDeviceId,
        isServerOnline,
        login,
        logout,
        setActiveDevice,
        setPreferredDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
