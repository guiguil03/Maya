import { NavigationTransition } from '@/components/common/navigation-transition';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { useAuth } from '@/hooks/use-auth';
import { TransactionsService } from '@/services/transactions.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  transactionId: string;
  storeName: string;
  partnerId?: string;
  amount?: number;
  discount?: number;
  createdAt?: string;
  date?: string;
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async (isRefresh = false) => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Récupérer l'ID utilisateur depuis l'API pour être sûr d'avoir le bon ID
      let userId = user.id;
      
      // Si l'ID n'est pas disponible localement, récupérer depuis l'API
      if (!userId) {
        console.log('🔄 [History] ID utilisateur non disponible localement, récupération depuis l\'API...');
        try {
          const userInfo = await AuthService.getCurrentUserInfo();
          userId = userInfo.id;
          console.log('✅ [History] ID utilisateur récupéré depuis l\'API:', userId);
        } catch (apiError) {
          console.error('❌ [History] Impossible de récupérer l\'ID depuis l\'API:', apiError);
          setError('Impossible de récupérer l\'ID utilisateur');
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      if (!userId) {
        setError('ID utilisateur non disponible');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('📊 [History] Chargement des transactions pour l\'utilisateur:', userId);

      const response = await TransactionsService.getUserTransactions(userId, {
        page: 1,
        pageSize: 50,
      });

      // Transformer les données de l'API en format utilisable
      const formattedTransactions = response.items.map((item: any) => ({
        transactionId: item.transactionId || item.id,
        storeName: item.storeName || 'Partenaire inconnu',
        partnerId: item.partnerId,
        amount: item.amount || item.totalAmount || 0,
        discount: item.discount || item.discountPercentage || 0,
        createdAt: item.createdAt || item.date || item.transactionDate,
        date: formatDate(item.createdAt || item.date || item.transactionDate),
      }));

      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
      let errorMessage = 'Erreur lors du chargement';
      
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Accès refusé.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Ressource non trouvée.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Aujourd\'hui';
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'Date inconnue';
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const onRefresh = () => {
    loadTransactions(true);
  };

  return (
    <NavigationTransition>
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Historique des achats</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Chargement...' : transactions.length > 0 
                ? `${transactions.length} transaction${transactions.length > 1 ? 's' : ''} récente${transactions.length > 1 ? 's' : ''}`
                : 'Aucune transaction'}
            </Text>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.text.light} />
            }
          >
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.text.light} />
                <Text style={styles.loadingText}>Chargement de l&apos;historique...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.status.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => loadTransactions()}>
                  <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color={Colors.text.muted} />
                <Text style={styles.emptyText}>Aucune transaction</Text>
                <Text style={styles.emptySubtext}>Vos transactions apparaîtront ici</Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <TouchableOpacity key={transaction.transactionId} style={styles.transactionCard}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.partnerName}>{transaction.storeName}</Text>
                    <Text style={styles.date}>{transaction.date}</Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    {transaction.amount ? (
                      <Text style={styles.amount}>{transaction.amount.toFixed(2)} €</Text>
                    ) : null}
                    {transaction.discount ? (
                      <View style={styles.discountBadge}>
                        <Ionicons name="sparkles" size={12} color={Colors.status.success} />
                        <Text style={styles.discount}>-{transaction.discount}%</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </NavigationTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold as any,
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...Shadows.md,
  },
  transactionInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold as any,
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold as any,
    color: Colors.text.light,
    marginBottom: Spacing.xs,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 239, 161, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  discount: {
    fontSize: Typography.sizes.sm,
    color: Colors.status.success,
    fontWeight: Typography.weights.semibold as any,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: Colors.status.error,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.light,
    fontWeight: Typography.weights.semibold as any,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.sizes.xl,
    color: Colors.text.light,
    fontWeight: Typography.weights.semibold as any,
  },
  emptySubtext: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
});