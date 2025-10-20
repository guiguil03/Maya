import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface PartnerStatsProps {
  totalPartners: number;
  nearbyPartners: number;
  activePromotions: number;
  averageRating: number;
  style?: any;
}

export function PartnerStats({ 
  totalPartners, 
  nearbyPartners, 
  activePromotions, 
  averageRating,
  style 
}: PartnerStatsProps) {
  const stats = [
    {
      label: 'Total',
      value: totalPartners,
      icon: 'business' as const,
      color: Colors.primary[600],
      backgroundColor: Colors.primary[50],
    },
    {
      label: 'Proche',
      value: nearbyPartners,
      icon: 'location' as const,
      color: Colors.status.success,
      backgroundColor: Colors.status.success + '15',
    },
    {
      label: 'Promos',
      value: activePromotions,
      icon: 'gift' as const,
      color: Colors.accent.orange,
      backgroundColor: Colors.accent.orange + '15',
    },
    {
      label: 'Note moy.',
      value: averageRating.toFixed(1),
      icon: 'star' as const,
      color: Colors.accent.gold,
      backgroundColor: Colors.accent.gold + '15',
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Statistiques</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: stat.backgroundColor }
            ]}>
              <Ionicons 
                name={stat.icon} 
                size={20} 
                color={stat.color} 
              />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  } as TextStyle,
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  statCard: {
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  } as ViewStyle,
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  } as TextStyle,
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
});
