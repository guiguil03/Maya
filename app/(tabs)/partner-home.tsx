import { NavigationTransition } from '@/components/common/navigation-transition';
import { PartnerBottomNav, PartnerTab } from '@/components/partners/partner-bottom-nav';
import { PartnerHeader } from '@/components/partners/partner-header';
import { PartnerHistory } from '@/components/partners/partner-history';
import { PartnerOverview } from '@/components/partners/partner-overview';
import { PartnerStats } from '@/components/partners/partner-stats';
import { PartnerStoreModal } from '@/components/partners/partner-store-modal';
import { PartnerStores } from '@/components/partners/partner-stores';
import { PartnerSubscription } from '@/components/partners/partner-subscription';
import { QRScanner } from '@/components/qr/qr-scanner';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useAuth } from '@/hooks/use-auth';
import { AuthService } from '@/services/auth.service';
import { ClientService } from '@/services/client.service';
import { QrService } from '@/services/qr.service';
import { StoresService } from '@/services/stores.service';
import { TransactionsService } from '@/services/transactions.service';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextStyle,
  ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Données mockées pour les abonnements
const mockSubscriptions = [
  {
    id: 1,
    planName: 'Plan Premium',
    price: 49.99,
    period: 'Mensuel',
    status: 'active',
    nextBilling: '2024-02-15',
    features: ['QR Code illimité', 'Statistiques avancées', 'Support prioritaire'],
  },
];

export default function PartnerHomeScreen() {
  const { user, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState<PartnerTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [validatingQR, setValidatingQR] = useState(false);
  
  // États pour les clients
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  // États pour les transactions du partenaire
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined);

  // États pour les stores
  const [stores, setStores] = useState<any[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeDetailLoading, setStoreDetailLoading] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const handleScanQR = () => {
    console.log('📱 [Partner Home] Bouton Scanner QR cliqué');
    setShowQRScanner(true);
    console.log('📱 [Partner Home] showQRScanner mis à true');
  };

  const handleQRScanned = async (qrData: string) => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📱 [QR SCAN] Début du processus de scan QR Code');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📥 [QR SCAN] Données brutes reçues:', {
      length: qrData.length,
      preview: qrData.substring(0, 100) + (qrData.length > 100 ? '...' : ''),
      hasTokenKeyword: qrData.includes('Token:'),
      hasColon: qrData.includes(':'),
      hasNewline: qrData.includes('\n'),
    });
    
    setShowQRScanner(false);
    setValidatingQR(true);
    
    try {
      // Le token peut être dans différents formats :
      // 1. Texte partagé : "Mon QR Code Maya\n\nToken: xxx"
      // 2. Token brut : "xxx"
      // 3. Format avec préfixe : "maya:token:xxx"
      let qrToken = qrData;
      console.log('🔄 [QR SCAN] Extraction du token...');
      console.log('📋 [QR SCAN] Format détecté:', {
        isSharedText: qrData.includes('Token:'),
        hasPrefix: qrData.includes(':') && !qrData.includes('Token:'),
        isRawToken: !qrData.includes('Token:') && !qrData.includes(':'),
      });
      
      // Extraire le token si c'est un texte partagé
      if (qrData.includes('Token:')) {
        console.log('🔍 [QR SCAN] Format détecté: Texte partagé');
        const tokenMatch = qrData.match(/Token:\s*([^\s\n]+)/);
        if (tokenMatch && tokenMatch[1]) {
          qrToken = tokenMatch[1];
          console.log('✅ [QR SCAN] Token extrait depuis le texte partagé:', {
            originalLength: qrData.length,
            extractedLength: qrToken.length,
            tokenPreview: qrToken.substring(0, 30) + '...',
          });
        } else {
          console.warn('⚠️ [QR SCAN] Pattern "Token:" trouvé mais extraction échouée');
        }
      } else if (qrData.includes(':') && !qrData.includes('Token:')) {
        console.log('🔍 [QR SCAN] Format détecté: Format avec préfixe');
        qrToken = qrData.split(':').pop() || qrData;
        console.log('✅ [QR SCAN] Token extrait depuis le format avec préfixe:', {
          originalLength: qrData.length,
          extractedLength: qrToken.length,
          tokenPreview: qrToken.substring(0, 30) + '...',
        });
      } else {
        console.log('🔍 [QR SCAN] Format détecté: Token brut');
        console.log('✅ [QR SCAN] Utilisation du token tel quel:', {
          length: qrToken.length,
          tokenPreview: qrToken.substring(0, 30) + '...',
        });
      }
      
      console.log('📤 [QR SCAN] Token final à valider:', {
        length: qrToken.length,
        preview: qrToken.substring(0, 50) + (qrToken.length > 50 ? '...' : ''),
        lastChars: qrToken.substring(Math.max(0, qrToken.length - 10)),
      });
      
      // Récupérer les informations du partenaire et de l'opérateur
      console.log('👤 [QR SCAN] Récupération des informations utilisateur...');
      let partnerId: string | undefined;
      let operatorUserId: string | undefined;
      let storeId: string | undefined;
      
      try {
        const startTime = Date.now();
        const userInfo = await AuthService.getCurrentUserInfo();
        const duration = Date.now() - startTime;
        
        console.log('✅ [QR SCAN] Informations utilisateur récupérées:', {
          duration: duration + 'ms',
          email: userInfo.email,
          id: userInfo.id,
          hasPartnerId: !!(userInfo as any)?.partnerId,
          hasId: !!userInfo.id,
          userInfoKeys: Object.keys(userInfo),
        });
        
        // L'ID du partenaire peut être dans userInfo.partnerId ou userInfo.id
        partnerId = (userInfo as any)?.partnerId || (userInfo as any)?.id;
        // L'ID de l'opérateur est l'ID de l'utilisateur connecté
        operatorUserId = userInfo.id;
        
        console.log('✅ [QR SCAN] IDs extraits:', {
          partnerId: partnerId ? partnerId.substring(0, 20) + '...' : 'undefined',
          operatorUserId: operatorUserId ? operatorUserId.substring(0, 20) + '...' : 'undefined',
          partnerIdSource: (userInfo as any)?.partnerId ? 'partnerId' : 'id',
        });
        
        if (!partnerId) {
          console.error('❌ [QR SCAN] partnerId manquant après extraction');
        }
        if (!operatorUserId) {
          console.error('❌ [QR SCAN] operatorUserId manquant après extraction');
        }
      } catch (error) {
        console.error('❌ [QR SCAN] Erreur lors de la récupération des infos utilisateur:', {
          error: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined,
        });
        throw new Error('Impossible de récupérer les informations du partenaire');
      }
      
      // Si le partenaire a plusieurs stores, demander de sélectionner un store
      // Sinon, utiliser le premier store disponible
      console.log('🏪 [QR SCAN] Vérification des stores disponibles...');
      console.log('📊 [QR SCAN] Nombre de stores actuellement chargés:', stores.length);
      
      if (stores.length === 0) {
        console.log('🔄 [QR SCAN] Aucun store chargé, chargement des stores...');
        const loadStartTime = Date.now();
        await loadStores();
        const loadDuration = Date.now() - loadStartTime;
        console.log('✅ [QR SCAN] Stores chargés:', {
          duration: loadDuration + 'ms',
          count: stores.length,
        });
      }
      
      if (stores.length === 0) {
        console.error('❌ [QR SCAN] Aucun magasin disponible pour le partenaire');
        Alert.alert(
          '⚠️ Aucun magasin',
          'Vous devez avoir au moins un magasin pour valider un QR Code.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('✅ [QR SCAN] Stores disponibles:', {
        count: stores.length,
        stores: stores.map((s: any) => ({
          id: s.id,
          name: s.name || s.partner?.name || 'N/A',
        })),
      });
      
      // Si un seul store, l'utiliser automatiquement
      if (stores.length === 1) {
        storeId = stores[0].id;
        console.log('✅ [QR SCAN] Store unique sélectionné automatiquement:', {
          storeId: storeId ? storeId.substring(0, 20) + '...' : 'undefined',
          storeName: stores[0].name || stores[0].partner?.name || 'N/A',
        });
      } else {
        // Si plusieurs stores, demander à l'utilisateur de choisir
        // Pour l'instant, on utilise le premier store
        // TODO: Implémenter une sélection de store
        storeId = stores[0].id;
        console.log('⚠️ [QR SCAN] Plusieurs stores disponibles, utilisation du premier:', {
          storeId: storeId ? storeId.substring(0, 20) + '...' : 'undefined',
          storeName: stores[0].name || stores[0].partner?.name || 'N/A',
          totalStores: stores.length,
          note: 'TODO: Implémenter une sélection de store',
        });
      }
      
      // Vérification finale des paramètres
      console.log('🔍 [QR SCAN] Vérification finale des paramètres...');
      const missingParams: string[] = [];
      if (!partnerId) missingParams.push('partnerId');
      if (!operatorUserId) missingParams.push('operatorUserId');
      if (!storeId) missingParams.push('storeId');
      if (!qrToken) missingParams.push('qrToken');
      
      if (missingParams.length > 0) {
        console.error('❌ [QR SCAN] Paramètres manquants:', missingParams);
        throw new Error(`Informations manquantes pour valider le QR Code: ${missingParams.join(', ')}`);
      }
      
      // À ce stade, tous les paramètres sont garantis d'être définis
      const finalPartnerId = partnerId!;
      const finalStoreId = storeId!;
      const finalOperatorUserId = operatorUserId!;
      
      console.log('✅ [QR SCAN] Tous les paramètres sont présents');
      console.log('📤 [QR SCAN] Paramètres de validation complets:', {
        qrToken: qrToken.substring(0, 30) + '...',
        qrTokenLength: qrToken.length,
        partnerId: finalPartnerId.substring(0, 20) + '...',
        storeId: finalStoreId.substring(0, 20) + '...',
        operatorUserId: finalOperatorUserId.substring(0, 20) + '...',
        amountGross: 0,
        personsCount: 0,
      });
      
      // Valider le QR Code via l'API avec tous les paramètres requis
      console.log('🌐 [QR SCAN] Appel API de validation...');
      const validationStartTime = Date.now();
      
      const validationResult = await QrService.validateQrToken(
        qrToken,
        finalPartnerId,
        finalStoreId,
        finalOperatorUserId,
        0, // amountGross - peut être modifié pour demander à l'utilisateur
        0  // personsCount - peut être modifié pour demander à l'utilisateur
      );
      
      const validationDuration = Date.now() - validationStartTime;
      
      console.log('✅ [QR SCAN] Validation réussie:', {
        duration: validationDuration + 'ms',
        hasResult: !!validationResult,
        resultType: typeof validationResult,
        resultKeys: validationResult ? Object.keys(validationResult) : [],
        clientName: validationResult?.clientName || validationResult?.client?.firstName || 'N/A',
        amount: validationResult?.amount || 'N/A',
        fullResult: JSON.stringify(validationResult, null, 2),
      });
      
      const selectedStore = stores.find((s: any) => s.id === finalStoreId);
      console.log('📋 [QR SCAN] Informations pour l\'alerte:', {
        clientName: validationResult?.clientName || validationResult?.client?.firstName || 'Client',
        storeName: selectedStore?.name || selectedStore?.partner?.name || 'N/A',
        amount: validationResult?.amount || 'N/A',
      });
      
      Alert.alert(
        '✅ QR Code validé',
        `Visite enregistrée avec succès !\n\nClient: ${validationResult.clientName || validationResult.client?.firstName || 'Client'}\nMagasin: ${selectedStore?.name || selectedStore?.partner?.name || 'N/A'}\nMontant: ${validationResult.amount || 'N/A'}€`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('🔄 [QR SCAN] Rechargement des clients après validation...');
              loadClients();
            }
          }
        ]
      );
      
      console.log('✅ [QR SCAN] Processus terminé avec succès');
      console.log('═══════════════════════════════════════════════════════════');
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ [QR SCAN] Erreur lors de la validation du QR Code');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ [QR SCAN] Détails de l\'erreur:', {
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      Alert.alert(
        '❌ Erreur',
        error instanceof Error ? error.message : 'Impossible de valider le QR Code. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
      
      console.error('═══════════════════════════════════════════════════════════');
    } finally {
      setValidatingQR(false);
      console.log('🏁 [QR SCAN] État de validation réinitialisé');
    }
  };

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const response = await ClientService.getClients({
        page: 1,
        pageSize: 100,
      });
      setClients(response.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setClientsError('Impossible de charger les clients');
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Charger les transactions du partenaire
  const loadPartnerTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactionsError('Utilisateur non connecté');
      setTransactionsLoading(false);
      return;
    }

    try {
      setTransactionsLoading(true);
      setTransactionsError(null);

      // Récupérer l'ID du partenaire depuis l'API si nécessaire
      let partnerId = user.id;
      try {
        const userInfo = await AuthService.getCurrentUserInfo();
        partnerId = userInfo.id || (userInfo as any)?.partnerId || user.id;
      } catch (apiError) {
        console.error('❌ [Partner History] Impossible de récupérer l\'ID depuis l\'API:', apiError);
      }

      // Calculer les dates selon la période sélectionnée
      let startDate: string | undefined;
      const now = new Date();
      
      if (filterPeriod === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString();
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString();
      }

      console.log('📊 [Partner History] Chargement des transactions pour le partenaire:', {
        partnerId,
        filterPeriod,
        startDate,
        selectedStoreId,
      });

      const response = await TransactionsService.getPartnerTransactions(partnerId, {
        page: 1,
        pageSize: 100,
        storeId: selectedStoreId,
        startDate: startDate,
      });

      console.log('✅ [Partner History] Transactions reçues:', {
        count: response.items?.length || 0,
        totalCount: response.totalCount,
      });

      setTransactions(response.items || []);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
      let errorMessage = 'Erreur lors du chargement';
      
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Accès refusé.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setTransactionsError(errorMessage);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [user, filterPeriod, selectedStoreId]);

  useEffect(() => {
    if (selectedTab === 'history') {
      loadPartnerTransactions();
    }
  }, [selectedTab, loadPartnerTransactions]);

  // Charger les stores du partenaire connecté uniquement
  const loadStores = useCallback(async () => {
    console.log('🏪 [Partner Home] Chargement des stores du partenaire...');
    setStoresLoading(true);
    setStoresError(null);
    try {
      // Récupérer les informations du partenaire connecté
      let partnerId: string | undefined;
      
      // Essayer d'abord avec user.id
      if (user?.id) {
        partnerId = user.id;
        console.log('✅ [Partner Home] PartnerId depuis user.id:', partnerId);
      }
      
      // Si pas trouvé, essayer avec getCurrentUserInfo
      if (!partnerId) {
        try {
          const userInfo = await AuthService.getCurrentUserInfo();
          console.log('👤 [Partner Home] Informations utilisateur:', {
            email: userInfo.email,
            id: userInfo.id,
            hasPartnerId: !!(userInfo as any)?.partnerId,
            allKeys: Object.keys(userInfo),
          });
          
          // L'ID du partenaire peut être dans userInfo.partnerId ou userInfo.id
          partnerId = (userInfo as any)?.partnerId || userInfo.id;
          
          if (partnerId) {
            console.log('✅ [Partner Home] PartnerId trouvé depuis getCurrentUserInfo:', partnerId);
          }
        } catch (error) {
          console.warn('⚠️ [Partner Home] Impossible de récupérer les infos utilisateur:', error);
        }
      }
      
      if (!partnerId) {
        console.error('❌ [Partner Home] Aucun partnerId trouvé');
        setStoresError('Impossible d\'identifier le partenaire');
        setStores([]);
        return;
      }

      console.log('🔍 [Partner Home] Recherche des stores pour le partenaire:', partnerId);

      // Récupérer tous les stores (l'API devrait filtrer automatiquement par partenaire si authentifié)
      const response = await StoresService.searchStores({
        page: 1,
        pageSize: 100,
      });
      
      console.log('✅ [Partner Home] Stores récupérés (avant filtre):', {
        total: response.items?.length || 0,
        firstStore: response.items?.[0] ? {
          id: response.items[0].id,
          name: response.items[0].name,
          partnerId: response.items[0].partnerId || response.items[0].partner?.id,
        } : null,
      });
      
      // Filtrer les stores pour ne garder que ceux du partenaire connecté
      let filteredStores = (response.items || []).filter((store: any) => {
        // Essayer plusieurs chemins pour trouver le partnerId du store
        const storePartnerId = store.partnerId 
          || store.partner?.id 
          || (store.partner && typeof store.partner === 'string' ? store.partner : null)
          || (store.partnerData?.id)
          || null;
        
        // Comparer les IDs (en tenant compte des formats string/UUID)
        const matches = storePartnerId 
          && (storePartnerId === partnerId 
              || storePartnerId.toString() === partnerId.toString()
              || storePartnerId.toString().toLowerCase() === partnerId.toString().toLowerCase());
        
        if (!matches && storePartnerId) {
          console.log('🚫 [Partner Home] Store filtré (ne correspond pas au partenaire):', {
            storeId: store.id,
            storeName: store.name || store.partner?.name,
            storePartnerId: storePartnerId.toString().substring(0, 20) + '...',
            currentPartnerId: partnerId.toString().substring(0, 20) + '...',
          });
        }
        
        return matches;
      });
      
      console.log('✅ [Partner Home] Stores filtrés (après filtre):', {
        count: filteredStores.length,
        stores: filteredStores.map((s: any) => ({
          id: s.id,
          name: s.name || s.partner?.name,
        })),
      });
      
      if (filteredStores.length === 0) {
        console.warn('⚠️ [Partner Home] Aucun store trouvé pour ce partenaire');
        setStoresError('Aucun magasin trouvé pour votre compte');
      } else {
        setStoresError(null);
      }
      
      setStores(filteredStores);
    } catch (error) {
      console.error('❌ [Partner Home] Erreur lors du chargement des stores:', error);
      if (error instanceof Error) {
        console.error('❌ [Partner Home] Détails de l\'erreur:', {
          message: error.message,
          name: error.name,
        });
        setStoresError(`Erreur: ${error.message}`);
      } else {
        setStoresError('Impossible de charger les stores');
      }
      setStores([]);
    } finally {
      setStoresLoading(false);
    }
  }, [user]);

  // Charger les stores au démarrage et quand on change d'onglet vers stores
  useEffect(() => {
    if (selectedTab === 'stores') {
      loadStores();
    }
  }, [selectedTab, loadStores]);

  // Charger les stores au démarrage pour les avoir disponibles pour le scanner QR
  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // Afficher les détails d'un store
  const handleStoreSelect = async (store: any) => {
    console.log('🔍 [Partner Home] Affichage des détails du store:', store.id);
    setSelectedStore(store);
    setShowStoreModal(true);
    setStoreDetailLoading(true);

    try {
      const storeDetails = await StoresService.getStoreById(store.id);
      console.log('✅ [Partner Home] Détails du store récupérés:', storeDetails);
      setSelectedStore(storeDetails);
    } catch (error) {
      console.error('❌ [Partner Home] Erreur lors du chargement des détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du store');
    } finally {
      setStoreDetailLoading(false);
    }
  };

  // Filtrer les stores
  const filteredStores = stores.filter((store) => {
    const storeName = (store.name || store.partner?.name || '').toLowerCase();
    const category = (store.category || store.partner?.category || '').toLowerCase();
    const address = (store.address?.street || store.address?.city || '').toLowerCase();
    const matchesSearch = 
      storeName.includes(storeSearchQuery.toLowerCase()) ||
      category.includes(storeSearchQuery.toLowerCase()) ||
      address.includes(storeSearchQuery.toLowerCase());
    
    return matchesSearch;
  });


  const handleExportData = () => {
    // Logique pour exporter les données
    console.log('Export des données');
  };

  // Filtrer les clients
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
    const email = (client.email || '').toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());
    
    // Note: Les clients n'ont pas de date de visite dans l'API /api/clients
    // Si tu veux filtrer par période, il faudrait une autre route API
    return matchesSearch;
  });

  // Statistiques basées sur les clients (à adapter selon tes besoins)
  const totalScans = clients.length;
  const totalRevenue = 0; // L'API clients ne fournit pas les montants
  const todayRevenue = 0; // L'API clients ne fournit pas les montants

  return (
    <NavigationTransition>
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <PartnerHeader 
            firstName={user?.firstName} 
            lastName={user?.lastName}
            onLogout={async () => {
              try {
                await signOut();
                router.replace('/connexion/login');
              } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                Alert.alert('Erreur', 'Impossible de se déconnecter');
              }
            }}
          />

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
          {selectedTab === 'overview' && (
            <PartnerOverview
              totalRevenue={totalRevenue}
              todayRevenue={todayRevenue}
              totalScans={totalScans}
              clients={clients}
              clientsLoading={clientsLoading}
              clientsError={clientsError}
              filteredClients={filteredClients}
              onExportData={handleExportData}
              onScanQR={handleScanQR}
              validatingQR={validatingQR}
            />
          )}

          {selectedTab === 'history' && (
            <PartnerHistory
              searchQuery={searchQuery}
              filterPeriod={filterPeriod}
              selectedStoreId={selectedStoreId}
              stores={stores}
              transactions={transactions}
              transactionsLoading={transactionsLoading}
              transactionsError={transactionsError}
              onSearchChange={setSearchQuery}
              onFilterPeriodChange={setFilterPeriod}
              onStoreFilterChange={setSelectedStoreId}
              onExportData={handleExportData}
            />
          )}

          {selectedTab === 'subscription' && (
            <PartnerSubscription subscriptions={mockSubscriptions} />
          )}

          {selectedTab === 'stores' && (
            <PartnerStores
              storeSearchQuery={storeSearchQuery}
              stores={stores}
              storesLoading={storesLoading}
              storesError={storesError}
              filteredStores={filteredStores}
              onSearchChange={setStoreSearchQuery}
              onStoreSelect={handleStoreSelect}
            />
          )}

          {selectedTab === 'stats' && <PartnerStats />}
        </ScrollView>

        <PartnerBottomNav selectedTab={selectedTab} onTabChange={setSelectedTab} />
        </SafeAreaView>

        <PartnerStoreModal
          visible={showStoreModal}
          selectedStore={selectedStore}
          loading={storeDetailLoading}
          onClose={() => {
            setShowStoreModal(false);
            setSelectedStore(null);
          }}
        />

        <QRScanner
          visible={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScanned}
          mode="partner"
        />
        </LinearGradient>
      </NavigationTransition>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  safeArea: {
    flex: 1,
  } as ViewStyle,
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  } as ViewStyle,
  headerTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold as any,
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  } as TextStyle,
  notificationButton: {
    padding: Spacing.sm,
    position: 'relative',
  } as ViewStyle,
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  } as ViewStyle,
  logoutButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  } as ViewStyle,
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 100, // Espace pour la barre de navigation en bas
  } as ViewStyle,
  scrollContent: {
    paddingBottom: Spacing.xl,
  } as ViewStyle,
  bottomNavBarContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: '#1A0A0E',
    borderTopWidth: 0,
    borderRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingBottom: 12,
    paddingTop: 12,
    height: 70,
  } as ViewStyle,
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: 2,
  } as ViewStyle,
  bottomNavItemActive: {
    // Style pour l'item actif
  } as ViewStyle,
  bottomNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  } as TextStyle,
  bottomNavTextActive: {
    color: '#8B2F3F',
    fontWeight: '600',
  } as TextStyle,
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  } as ViewStyle,
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  } as ViewStyle,
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  statValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold as any,
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium as any,
    letterSpacing: 0.5,
  } as TextStyle,
  qrCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  } as ViewStyle,
  qrCardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  qrCardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  } as TextStyle,
  scannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  } as ViewStyle,
  scannerLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  } as ViewStyle,
  scannerLoadingText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  } as TextStyle,
  scannerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  } as ViewStyle,
  scannerPlaceholderText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  } as ViewStyle,
  scanButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  } as TextStyle,
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 3,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  } as ViewStyle,
  qrGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as ViewStyle,
  qrSquare: {
    width: '12%',
    height: '12%',
    margin: '1%',
    borderRadius: 2,
  } as ViewStyle,
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  } as ViewStyle,
  downloadButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  } as TextStyle,
  reloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FCD34D',
  } as ViewStyle,
  reloadButtonText: {
    color: '#B45309',
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  } as TextStyle,
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  } as ViewStyle,
  loadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  } as ViewStyle,
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.status.error,
  } as TextStyle,
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  } as ViewStyle,
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  recentSection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: Spacing.md,
  } as TextStyle,
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  } as ViewStyle,
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  } as ViewStyle,
  transactionInfo: {
    flex: 1,
  } as ViewStyle,
  transactionName: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
  } as TextStyle,
  transactionDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  transactionAmount: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: '#10B981',
  } as TextStyle,
  historySection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  } as ViewStyle,
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  historyIcon: {
    marginRight: Spacing.md,
  } as ViewStyle,
  historyInfo: {
    flex: 1,
  } as ViewStyle,
  historyCustomer: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
  } as TextStyle,
  historyDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  historyAmount: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: '#10B981',
  } as TextStyle,
  historyStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as ViewStyle,
  amountBadge: {
    alignItems: 'flex-end',
    gap: 4,
  } as ViewStyle,
  amountText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
  } as TextStyle,
  discountText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.status.success,
  } as TextStyle,
  storeFilterContainer: {
    marginBottom: Spacing.md,
  } as ViewStyle,
  storeFilterLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  storeFilterScroll: {
    marginBottom: Spacing.sm,
  } as ViewStyle,
  storeFilterContent: {
    gap: Spacing.sm,
  } as ViewStyle,
  storeFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: Spacing.sm,
  } as ViewStyle,
  storeFilterChipActive: {
    backgroundColor: 'rgba(139, 47, 63, 0.3)',
    borderColor: '#8B2F3F',
  } as ViewStyle,
  storeFilterChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    color: Colors.text.secondary,
  } as TextStyle,
  storeFilterChipTextActive: {
    color: Colors.text.light,
    fontWeight: '600',
  } as TextStyle,
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  } as ViewStyle,
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: '#10B981',
  } as TextStyle,
  subscriptionSection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  } as ViewStyle,
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
  } as ViewStyle,
  subscriptionPlanName: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  subscriptionPrice: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.primary[600],
  } as TextStyle,
  subscriptionStatusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  } as ViewStyle,
  subscriptionStatusText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: '#10B981',
  } as TextStyle,
  subscriptionFeatures: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  } as ViewStyle,
  featureText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.light,
    fontWeight: '500',
  } as TextStyle,
  subscriptionFooter: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  } as ViewStyle,
  subscriptionNextBilling: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  } as TextStyle,
  manageButton: {
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  } as ViewStyle,
  manageButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.primary[600],
  } as TextStyle,
  
  // Statistiques
  statsSection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  } as ViewStyle,
  statsCardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: Spacing.md,
  } as TextStyle,
  chartContainer: {
    marginTop: Spacing.md,
  } as ViewStyle,
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingHorizontal: Spacing.sm,
  } as ViewStyle,
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  } as ViewStyle,
  chartBar: {
    width: '80%',
    backgroundColor: '#F59E0B',
    borderRadius: BorderRadius.sm,
    minHeight: 20,
    marginBottom: Spacing.xs,
  } as ViewStyle,
  chartLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    fontWeight: '600',
  } as TextStyle,
  periodStatsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  } as ViewStyle,
  periodStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.md,
  } as ViewStyle,
  periodStatLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  } as TextStyle,
  periodStatValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  periodStatTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  periodStatTrendText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: '#10B981',
  } as TextStyle,
  topClientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
  } as ViewStyle,
  topClientRank: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  } as ViewStyle,
  topClientRankText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary[600],
  } as TextStyle,
  topClientInfo: {
    flex: 1,
  } as ViewStyle,
  topClientName: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
  } as TextStyle,
  topClientDetails: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  peakHoursContainer: {
    marginTop: Spacing.md,
  } as ViewStyle,
  peakHourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  } as ViewStyle,
  peakHourLabel: {
    width: 40,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.text.secondary,
  } as TextStyle,
  peakHourBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  } as ViewStyle,
  peakHourBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: BorderRadius.full,
  } as ViewStyle,
  peakHourValue: {
    width: 30,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.text.light,
    textAlign: 'right',
  } as TextStyle,
  
  // QR Code amélioré
  qrCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  } as ViewStyle,
  qrActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  } as ViewStyle,
  qrActionButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  } as ViewStyle,
  qrButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  } as ViewStyle,
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  } as ViewStyle,
  printButtonText: {
    color: Colors.primary[600],
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  } as TextStyle,
  shareSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  } as ViewStyle,
  shareSuccessText: {
    color: '#10B981',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  } as TextStyle,
  
  // Actions rapides
  quickActionsSection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  } as ViewStyle,
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  } as ViewStyle,
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  quickActionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
  } as TextStyle,
  quickActionSubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
  } as TextStyle,
  
  // Historique amélioré
  historyHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  } as ViewStyle,
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  } as ViewStyle,
  exportButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.primary[600],
  } as TextStyle,
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  } as ViewStyle,
  searchIcon: {
    marginRight: Spacing.sm,
  } as TextStyle,
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text.light,
  } as TextStyle,
  filtersContainer: {
    marginBottom: Spacing.md,
  } as ViewStyle,
  filtersContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  } as ViewStyle,
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  } as ViewStyle,
  filterChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  } as ViewStyle,
  filterChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.text.secondary,
  } as TextStyle,
  filterChipTextActive: {
    color: 'white',
    fontWeight: '700',
  } as TextStyle,
  resultsCount: {
    marginBottom: Spacing.md,
  } as ViewStyle,
  resultsCountText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: '600',
  } as TextStyle,
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  } as ViewStyle,
  emptyStateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  } as TextStyle,
  emptyStateText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  } as TextStyle,
  
  // Statistiques améliorées
  periodStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  } as ViewStyle,
  performanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  } as ViewStyle,
  performanceGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  } as ViewStyle,
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  performanceValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  } as TextStyle,
  performanceLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  } as TextStyle,
  
  // Stores section
  storesSection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  storeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  } as ViewStyle,
  storeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  } as ViewStyle,
  storeInfo: {
    flex: 1,
  } as ViewStyle,
  storeName: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 4,
  } as TextStyle,
  storeCategory: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: '600',
    marginBottom: 4,
  } as TextStyle,
  storeAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  storeAddress: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    flex: 1,
  } as TextStyle,
  storeStatus: {
    marginTop: Spacing.sm,
  } as ViewStyle,
  statusBadgeOpen: {
    backgroundColor: '#D1FAE5',
  } as ViewStyle,
  statusBadgeClosed: {
    backgroundColor: '#FEE2E2',
  } as ViewStyle,
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.light,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[200],
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  } as ViewStyle,
  closeButton: {
    padding: Spacing.sm,
  } as ViewStyle,
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
  } as TextStyle,
  placeholder: {
    width: 40,
  } as ViewStyle,
  modalContent: {
    flex: 1,
  } as ViewStyle,
  modalContentContainer: {
    padding: Spacing.lg,
  } as ViewStyle,
  modalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  } as ViewStyle,
  modalLoadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  } as TextStyle,
  storeDetailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  } as ViewStyle,
  storeDetailIcon: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,
  storeDetailName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '800',
    color: Colors.text.light,
    textAlign: 'center',
    marginBottom: Spacing.md,
  } as TextStyle,
  storeDetailCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  } as ViewStyle,
  storeDetailCategoryText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    fontWeight: '600',
  } as TextStyle,
  storeDetailAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
  } as ViewStyle,
  storeDetailAddressText: {
    flex: 1,
  } as ViewStyle,
  storeDetailAddressLine: {
    fontSize: Typography.sizes.base,
    color: Colors.text.light,
    marginBottom: 2,
  } as TextStyle,
  storeDetailStatus: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as ViewStyle,
  storeDetailPartner: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  } as ViewStyle,
  storeDetailPartnerTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  } as TextStyle,
  storeDetailPartnerName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 4,
  } as TextStyle,
  storeDetailPartnerEmail: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  } as TextStyle,
  storeDetailDescription: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[100],
  } as ViewStyle,
  storeDetailDescriptionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  } as TextStyle,
  storeDetailDescriptionText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.light,
    lineHeight: 22,
  } as TextStyle,
});

