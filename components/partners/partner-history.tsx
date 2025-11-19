import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface PartnerHistoryProps {
  searchQuery: string;
  filterPeriod: 'all' | 'today' | 'week' | 'month';
  selectedStoreId?: string;
  stores: any[];
  transactions: any[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  onSearchChange: (query: string) => void;
  onFilterPeriodChange: (period: 'all' | 'today' | 'week' | 'month') => void;
  onStoreFilterChange: (storeId?: string) => void;
  onExportData: () => void;
}

export function PartnerHistory({
  searchQuery,
  filterPeriod,
  selectedStoreId,
  stores,
  transactions,
  transactionsLoading,
  transactionsError,
  onSearchChange,
  onFilterPeriodChange,
  onStoreFilterChange,
  onExportData,
}: PartnerHistoryProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date inconnue';
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const storeName = (transaction.storeName || transaction.partnerName || '').toLowerCase();
    const clientName = (transaction.clientName || '').toLowerCase();
    return storeName.includes(searchLower) || clientName.includes(searchLower);
  });

  return (
    <View style={styles.historySection}>
      <View style={styles.historyHeaderSection}>
        <Text style={styles.sectionTitle}>Historique complet</Text>
        <TouchableOpacity style={styles.exportButton} onPress={onExportData}>
          <Ionicons name="download-outline" size={18} color={Colors.primary[600]} />
          <Text style={styles.exportButtonText}>Exporter</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une transaction..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres par période */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {[
          { key: 'all', label: 'Tout' },
          { key: 'today', label: "Aujourd'hui" },
          { key: 'week', label: '7 jours' },
          { key: 'month', label: '30 jours' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              filterPeriod === filter.key && styles.filterChipActive,
            ]}
            onPress={() => onFilterPeriodChange(filter.key as any)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterPeriod === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtre par store */}
      {stores.length > 0 && (
        <View style={styles.storeFilterContainer}>
          <Text style={styles.storeFilterLabel}>Filtrer par magasin:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.storeFilterScroll}
            contentContainerStyle={styles.storeFilterContent}
          >
            <TouchableOpacity
              style={[
                styles.storeFilterChip,
                !selectedStoreId && styles.storeFilterChipActive,
              ]}
              onPress={() => onStoreFilterChange(undefined)}
            >
              <Text
                style={[
                  styles.storeFilterChipText,
                  !selectedStoreId && styles.storeFilterChipTextActive,
                ]}
              >
                Tous les magasins
              </Text>
            </TouchableOpacity>
            {stores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeFilterChip,
                  selectedStoreId === store.id && styles.storeFilterChipActive,
                ]}
                onPress={() => onStoreFilterChange(store.id)}
              >
                <Text
                  style={[
                    styles.storeFilterChipText,
                    selectedStoreId === store.id && styles.storeFilterChipTextActive,
                  ]}
                >
                  {store.name || 'Magasin'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Résultats filtrés */}
      {transactionsLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.text.light} />
          <Text style={styles.emptyStateText}>Chargement des transactions...</Text>
        </View>
      ) : transactionsError ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={64} color={Colors.status.error} />
          <Text style={styles.emptyStateTitle}>Erreur</Text>
          <Text style={styles.emptyStateText}>{transactionsError}</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={Colors.text.secondary} />
          <Text style={styles.emptyStateTitle}>Aucune transaction</Text>
          <Text style={styles.emptyStateText}>
            Aucune transaction trouvée pour cette période
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsCount}>
            <Text style={styles.resultsCountText}>
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
            </Text>
          </View>
          {filteredTransactions.map((transaction, index) => {
            const transactionDate = transaction.createdAt || transaction.date || transaction.transactionDate;
            return (
              <View key={transaction.id || transaction.transactionId || index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="receipt" size={24} color={Colors.text.light} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyCustomer}>
                      {transaction.storeName || transaction.partnerName || 'Partenaire inconnu'}
                    </Text>
                    <Text style={styles.historyDate}>{formatDate(transactionDate)}</Text>
                    {transaction.clientName && (
                      <Text style={styles.historyDate}>Client: {transaction.clientName}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.historyStatus}>
                  <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>
                      {transaction.amount ? `${transaction.amount.toFixed(2)}€` : 'N/A'}
                    </Text>
                    {transaction.discount && transaction.discount > 0 && (
                      <Text style={styles.discountText}>
                        -{transaction.discount}%
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historySection: {
    marginBottom: Spacing.lg,
  } as ViewStyle,
  historyHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  } as ViewStyle,
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: Spacing.md,
  } as TextStyle,
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
    ...Spacing.sm,
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
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
});

