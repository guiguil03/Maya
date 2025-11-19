import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PartnerStoreModalProps {
  visible: boolean;
  selectedStore: any | null;
  loading: boolean;
  onClose: () => void;
}

export function PartnerStoreModal({ visible, selectedStore, loading, onClose }: PartnerStoreModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text.light} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Détails du magasin</Text>
          <View style={styles.placeholder} />
        </View>
        
        {selectedStore && (
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            {loading && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={Colors.text.light} />
                <Text style={styles.modalLoadingText}>Chargement...</Text>
              </View>
            )}

            <View style={styles.storeDetailCard}>
              <View style={styles.storeDetailIcon}>
                <Ionicons name="storefront" size={48} color={Colors.primary[600]} />
              </View>
              
              <Text style={styles.storeDetailName}>
                {selectedStore.name || selectedStore.partner?.name || 'Magasin sans nom'}
              </Text>

              {selectedStore.category && (
                <View style={styles.storeDetailCategory}>
                  <Ionicons name="pricetag" size={16} color={Colors.text.secondary} />
                  <Text style={styles.storeDetailCategoryText}>{selectedStore.category}</Text>
                </View>
              )}

              {selectedStore.address && (
                <View style={styles.storeDetailAddress}>
                  <Ionicons name="location" size={18} color={Colors.text.secondary} />
                  <View style={styles.storeDetailAddressText}>
                    {selectedStore.address.street && (
                      <Text style={styles.storeDetailAddressLine}>
                        {selectedStore.address.street}
                      </Text>
                    )}
                    <Text style={styles.storeDetailAddressLine}>
                      {[selectedStore.address.postalCode, selectedStore.address.city]
                        .filter(Boolean)
                        .join(' ')}
                    </Text>
                    {selectedStore.address.country && (
                      <Text style={styles.storeDetailAddressLine}>
                        {selectedStore.address.country}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {selectedStore.isOpen !== undefined && (
                <View style={styles.storeDetailStatus}>
                  <View style={[styles.statusBadge, selectedStore.isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
                    <Ionicons 
                      name="time" 
                      size={16} 
                      color={selectedStore.isOpen ? '#10B981' : Colors.status.error} 
                    />
                    <Text style={[styles.statusText, { color: selectedStore.isOpen ? '#10B981' : Colors.status.error }]}>
                      {selectedStore.isOpen ? 'Ouvert' : 'Fermé'}
                    </Text>
                  </View>
                </View>
              )}

              {selectedStore.partner && (
                <View style={styles.storeDetailPartner}>
                  <Text style={styles.storeDetailPartnerTitle}>Partenaire</Text>
                  <Text style={styles.storeDetailPartnerName}>
                    {selectedStore.partner.name || 'N/A'}
                  </Text>
                  {selectedStore.partner.email && (
                    <Text style={styles.storeDetailPartnerEmail}>
                      {selectedStore.partner.email}
                    </Text>
                  )}
                </View>
              )}

              {selectedStore.description && (
                <View style={styles.storeDetailDescription}>
                  <Text style={styles.storeDetailDescriptionTitle}>Description</Text>
                  <Text style={styles.storeDetailDescriptionText}>
                    {selectedStore.description}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  statusBadgeOpen: {
    backgroundColor: '#D1FAE5',
  } as ViewStyle,
  statusBadgeClosed: {
    backgroundColor: '#FEE2E2',
  } as ViewStyle,
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: '#10B981',
  } as TextStyle,
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

