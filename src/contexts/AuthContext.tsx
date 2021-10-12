import { createContext, ReactNode, useContext, useState } from "react";
import Router from 'next/router';
import { setCookie } from 'nookies';

import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type ResponseData = User & {
  token: string;
  refreshToken: string;
}

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post<ResponseData>('sessions', {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(null, '@nextauth:token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days    
        path: '/',  
      });
      setCookie(null, '@nextauth:refreshToken', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days    
        path: '/',  
      });
  
      setUser({
        email,
        permissions,
        roles,
      });

      Router.push('/dashboard');
    } catch (err) {

    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}