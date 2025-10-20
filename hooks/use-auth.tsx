import { AuthService, LoginRequest, PublicUser, RegisterRequest } from '@/services/auth.service';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AuthUser = PublicUser & { role?: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (params: LoginRequest) => Promise<void>;
  signUp: (params: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Commencer par true pour charger l'utilisateur

  // Charger l'utilisateur au démarrage avec persistance
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await AuthService.isAuthenticated();
        
        if (isAuth) {
          // Essayer de récupérer les infos complètes depuis l'API
          try {
            const userInfo = await AuthService.getCurrentUserInfo();
            setUser(userInfo);
            console.log('👤 Utilisateur chargé depuis l\'API:', userInfo.email);
          } catch (apiError) {
            // Si l'API échoue, utiliser les données locales
            console.log('⚠️ API indisponible, utilisation des données locales');
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              console.log('👤 Utilisateur chargé depuis le stockage local:', currentUser.email);
            } else {
              setUser(null);
            }
          }
        } else {
          setUser(null);
          console.log('❌ Aucun utilisateur connecté');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = useCallback(async (loginData: LoginRequest) => {
    setLoading(true);
    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('MISSING_CREDENTIALS');
      }
      await AuthService.signIn(loginData);
      
      // Récupérer les infos complètes de l'utilisateur après connexion
      const userInfo = await AuthService.getCurrentUserInfo();
      setUser(userInfo);
      console.log('✅ Connexion réussie:', userInfo.email);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (registerData: RegisterRequest) => {
    setLoading(true);
    try {
      if (!registerData.email || !registerData.password) {
        throw new Error('MISSING_CREDENTIALS');
      }
      const newUser = await AuthService.signUp(registerData);
      setUser(newUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      setUser(null); // Déconnecter quand même localement
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (user) {
        const userInfo = await AuthService.getCurrentUserInfo();
        setUser(userInfo);
        console.log('🔄 Utilisateur rafraîchi:', userInfo.email);
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, signOut, refreshUser }),
    [user, loading, signIn, signUp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};


