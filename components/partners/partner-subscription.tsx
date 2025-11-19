import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface Subscription {
  id: number;
  planName: string;
  price: number;
  period: string;
  status: string;
  nextBilling: string;
  features: string[];
}

interface PartnerSubscriptionProps {
  subscriptions: Subscription[];
}

export function PartnerSubscription({ subscriptions }: PartnerSubscriptionProps) {
  return (
    <View style={styles.subscriptionSection}>
      {subscriptions.map((sub) => (
        <View key={sub.id} style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.subscriptionPlanName}>{sub.planName}</Text>
              <Text style={styles.subscriptionPrice}>
                {sub.price}€ / {sub.period}
              </Text>
            </View>
            <View style={styles.subscriptionStatusBadge}>
              <Text style={styles.subscriptionStatusText}>Actif</Text>
            </View>
          </View>
          <View style={styles.subscriptionFeatures}>
            {sub.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <View style={styles.subscriptionFooter}>
            <Text style={styles.subscriptionNextBilling}>
              Prochain paiement : {new Date(sub.nextBilling).toLocaleDateString('fr-FR')}
            </Text>
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Gérer l&apos;abonnement</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
});

