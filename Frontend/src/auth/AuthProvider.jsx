import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth.api";
import { userApi } from "../api/user.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

const refreshProfile = useCallback(async () => {
  try {
    const res = await userApi.profile();
    setUser(res.data?.user ?? null);
  } catch (error) {
    if (error?.response?.status === 401) {
      setUser(null);
    } else {
      console.error("Profile fetch error:", error);
    }

  } finally {
    setBooting(false);
  }
}, []);


  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (emailid, password) => {
    const res = await authApi.login({ emailid, password });
    setUser(res.data?.user ?? null);
    return res.data;
  };

  const signup = async (firstname, emailid, password) => {
    const res = await authApi.signup({ firstname, emailid, password });
    setUser(res.data?.user ?? null);
    return res.data;
  };

 const logout = async () => {
  await authApi.logout();
  localStorage.removeItem("user_cache"); 
  setUser(null);
};

  const updatePassword = async (data) => {
    const res = await userApi.updatePassword(data);
    return res.data;
  };

  const value = useMemo(
    () => ({
      user,
      booting,
      login,
      signup,
      logout,
      refreshProfile,
      updatePassword,
    }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
