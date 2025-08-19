import { useState, useEffect } from 'react';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(getUser());
  const [isLoading, setIsLoading] = useState(true);

  console.log("🔐 useAuth Debug:");
  console.log("- Current user state:", user);
  console.log("- Current loading state:", isLoading);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getUser();
      console.log("🔄 useAuth: Storage changed, new user:", currentUser);
      setUser(currentUser);
      setIsLoading(false);
    };

    // Custom event listener for auth changes
    const handleAuthChange = () => {
      console.log("🎯 useAuth: Auth change event triggered");
      handleStorageChange();
    };

    // Initial check
    console.log("🚀 useAuth: Initial check");
    handleStorageChange();

    // Listen for custom auth change events
    window.addEventListener('auth-change', handleAuthChange);
    
    // Also listen for storage events (for cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (token, userData) => {
    console.log("🔑 useAuth: Login called with:", { token: token ? '***' : 'undefined', userData });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    // Dispatch custom event
    window.dispatchEvent(new Event('auth-change'));
    console.log("✅ useAuth: Login completed, user set to:", userData);
  };

  const logout = () => {
    console.log("🚪 useAuth: Logout called");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    // Dispatch custom event
    window.dispatchEvent(new Event('auth-change'));
    console.log("✅ useAuth: Logout completed");
  };

  const isLoggedIn = () => {
    const result = !!user && !!localStorage.getItem('token');
    console.log("🔍 useAuth: isLoggedIn check:", result);
    return result;
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isLoggedIn
  };
}; 