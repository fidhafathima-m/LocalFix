import React, { createContext, useContext, useEffect, useState } from "react";

type UserType = "user" | "serviceProvider" | "admin";
type ApplicationStatus =
  | "not-applied"
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

interface User {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserType;
  applicationStatus?: ApplicationStatus;
  isVerified?: boolean;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  applicationStatus: string;
  updateApplicationStatus: (status: string) => void;
  updateUsers: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<string>("not-applied");

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);

          try {
            setUser(parsedUser);
            setToken(savedToken);
            setApplicationStatus(parsedUser.applicationStatus || "not-applied");
          } catch (validationError) {
            console.warn(
              "Token validation failed, clearing auth data",
              validationError
            );
            logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, authToken: string) => {
    const userWithDefaults = {
      ...userData,
      applicationStatus: userData.applicationStatus || "not-applied",
    };

    try {
      localStorage.setItem("user", JSON.stringify(userWithDefaults));
      localStorage.setItem("token", authToken);

      setUser(userWithDefaults);
      setToken(authToken);
      setApplicationStatus(userWithDefaults.applicationStatus);
    } catch (error) {
      console.error("Login storage error:", error);
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
    setApplicationStatus("not-applied");
  };

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        setToken(currentToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const updateApplicationStatus = (status: string) => {
    const validStatuses: ApplicationStatus[] = [
      "not-applied",
      "draft",
      "submitted",
      "under_review",
      "approved",
      "rejected",
    ];

    if (validStatuses.includes(status as ApplicationStatus)) {
      const applicationStatus = status as ApplicationStatus;
      setApplicationStatus(applicationStatus);

      if (user) {
        const updatedUser: User = {
          ...user,
          applicationStatus,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } else {
      console.warn(`Invalid application status: ${status}`);
    }
  };

  const updateUsers = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (userData.applicationStatus) {
        setApplicationStatus(userData.applicationStatus);
      }
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        login,
        logout,
        applicationStatus,
        updateApplicationStatus,
        updateUsers,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
