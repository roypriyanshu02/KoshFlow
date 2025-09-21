import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ACCOUNTANT" | "VIEWER" | "CUSTOMER" | "VENDOR";
  lastLogin?: string;
  isTwoFactorEnabled?: boolean;
  isActive?: boolean;
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gstin?: string;
  pan?: string;
}

interface LoginResponse {
  user: User;
  company: Company;
  accessToken: string;
  refreshToken: string;
  message?: string;
  requires2FA?: boolean;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    twoFactorCode?: string
  ) => Promise<LoginResponse>;
  register: (companyData: any, adminData: any) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  setup2FA: (
    password: string
  ) => Promise<{ secret: string; qrCode: string; manualEntryKey: string }>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: (token: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  is2FAEnabled: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      setError(null);
      apiClient.setToken(token);
      const data = (await apiClient.getProfile()) as any;
      setUser(data.user);
      setCompany(data.company);
      setToken(token);
    } catch (error: any) {
      console.error("Token verification failed:", error);
      apiClient.setToken(null);
      apiClient.setRefreshToken(null);
      setToken(null);
      setUser(null);
      setCompany(null);
      setError(error.message || "Session expired");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    twoFactorCode?: string
  ): Promise<LoginResponse> => {
    try {
      setError(null);
      setIsLoading(true);

      const data = (await apiClient.login(
        email,
        password,
        twoFactorCode
      )) as any;

      // Check if 2FA is required
      if (data.requires2FA) {
        setIsLoading(false);
        return data;
      }

      // Login successful
      setUser(data.user);
      setCompany(data.company);
      setToken(data.accessToken);
      apiClient.setToken(data.accessToken);
      apiClient.setRefreshToken(data.refreshToken);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });

      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    companyData: any,
    adminData: any
  ): Promise<LoginResponse> => {
    try {
      setError(null);
      setIsLoading(true);

      const data = (await apiClient.register({
        companyName: companyData.name,
        companyEmail: companyData.email,
        adminName: adminData.name,
        adminEmail: adminData.email,
        password: adminData.password,
        phone: companyData.phone,
        gstin: companyData.gstin,
        pan: companyData.pan,
      })) as any;

      setUser(data.user);
      setCompany(data.company);
      setToken(data.accessToken);
      apiClient.setToken(data.accessToken);
      apiClient.setRefreshToken(data.refreshToken);

      toast({
        title: "Registration Successful",
        description: `Welcome to KoshFlow, ${data.user.name}!`,
      });

      return data;
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.message || "Registration failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setCompany(null);
      setToken(null);
      setError(null);
      apiClient.setToken(null);
      apiClient.setRefreshToken(null);
    }
  };

  const refreshToken = async () => {
    try {
      setError(null);
      const data = await apiClient.getProfile();
      setUser(data.user);
      setCompany(data.company);
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      setError(error.message || "Session expired");
      await logout();
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setError(null);
      await apiClient.changePassword(currentPassword, newPassword);
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      setError(error.message || "Password change failed");
      throw error;
    }
  };

  const setup2FA = async (password: string) => {
    try {
      setError(null);
      const data = await apiClient.setup2FA(password);
      return data;
    } catch (error: any) {
      console.error("2FA setup error:", error);
      setError(error.message || "2FA setup failed");
      throw error;
    }
  };

  const verify2FA = async (token: string) => {
    try {
      setError(null);
      await apiClient.verify2FA(token);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled",
      });
      // Refresh user data to get updated 2FA status
      await refreshToken();
    } catch (error: any) {
      console.error("2FA verification error:", error);
      setError(error.message || "2FA verification failed");
      throw error;
    }
  };

  const disable2FA = async (token: string) => {
    try {
      setError(null);
      await apiClient.disable2FA(token);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
      // Refresh user data to get updated 2FA status
      await refreshToken();
    } catch (error: any) {
      console.error("2FA disable error:", error);
      setError(error.message || "2FA disable failed");
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    company,
    token,
    login,
    register,
    logout,
    refreshToken,
    changePassword,
    setup2FA,
    verify2FA,
    disable2FA,
    isLoading,
    isAuthenticated: !!user && !!token,
    is2FAEnabled: user?.isTwoFactorEnabled || false,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
