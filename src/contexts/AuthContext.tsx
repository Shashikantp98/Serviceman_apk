import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  loading: boolean;
  role: string | null;
  latitude: string | null;
  longitude: string | null;
  setLatLong: (newLatitude: number, newLongitude: number) => void;
  currentLocation: string | null;
  setCurrentLocationFn: (newCurrentLocation: string) => void;
  isGuest: boolean;
  setIsGuestFn: (newIsGuest: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check for existing token in localStorage on app start
    const savedToken = localStorage.getItem("authmobileToken");
    const savedRole = localStorage.getItem("authmobileRole");
    const savedLatitude = localStorage.getItem("authmobileLatitude");
    const savedLongitude = localStorage.getItem("authmobileLongitude");
    const savedIsGuest = localStorage.getItem("authmobileIsGuest");
    const savedCurrentLocation = localStorage.getItem(
      "authmobileCurrentLocation"
    );
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedRole) {
      setRole(savedRole);
    }
    if (savedLatitude) {
      setLatitude(savedLatitude);
    }
    if (savedLongitude) {
      setLongitude(savedLongitude);
    }
    if (savedIsGuest) {
      setIsGuest(savedIsGuest === "true");
    }
    if (savedCurrentLocation) {
      setCurrentLocation(savedCurrentLocation);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newRole: string) => {
    setToken(newToken);
    localStorage.setItem("authmobileToken", newToken);
    setRole(newRole);
    localStorage.setItem("authmobileRole", newRole);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("authmobileToken");
    setRole(null);
    localStorage.removeItem("authmobileRole");
    setLatitude(null);
    localStorage.removeItem("authmobileLatitude");
    setLongitude(null);
    localStorage.removeItem("authmobileLongitude");
    setCurrentLocation(null);
    localStorage.removeItem("authmobileCurrentLocation");
  };

  const setLatLong = (newLatitude: number, newLongitude: number) => {
    setLatitude(newLatitude.toString());
    setLongitude(newLongitude.toString());
    localStorage.setItem("authmobileLatitude", newLatitude.toString());
    localStorage.setItem("authmobileLongitude", newLongitude.toString());
  };

  const setCurrentLocationFn = (newCurrentLocation: string) => {
    setCurrentLocation(newCurrentLocation);
    localStorage.setItem("authmobileCurrentLocation", newCurrentLocation);
  };

  const setIsGuestFn = (newIsGuest: boolean) => {
    setIsGuest(newIsGuest);
    localStorage.setItem("authmobileIsGuest", newIsGuest.toString());
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        loading,
        role,
        latitude,
        longitude,
        setLatLong,
        currentLocation,
        setCurrentLocationFn,
        isGuest,
        setIsGuestFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
