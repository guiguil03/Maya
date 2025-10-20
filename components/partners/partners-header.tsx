import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PartnersHeaderProps {
  title: string;
  subtitle: string;
  totalPartners: number;
  nearbyPartners: number;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  style?: any;
}

export function PartnersHeader({
  title,
  subtitle,
  totalPartners,
  nearbyPartners,
  onLocationPress,
  onNotificationPress,
  style
}: PartnersHeaderProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <LinearGradient
      colors={['#6366F1', '#4F46E5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={16} color={Colors.text.light} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications" size={16} color={Colors.text.light} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistiques rapides */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statCard, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.statIcon}>
              <Ionicons name="business" size={14} color={Colors.text.light} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalPartners}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </Animated.View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="location" size={14} color={Colors.text.light} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{nearbyPartners}</Text>
              <Text style={styles.statLabel}>Proche</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="gift" size={14} color={Colors.text.light} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Promos</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="star" size={14} color={Colors.accent.gold} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>4.7</Text>
              <Text style={styles.statLabel}>Note moy.</Text>
            </View>
          </View>
        </View>

        {/* Indicateur de scroll */}
        <View style={styles.scrollIndicator}>
          <View style={styles.scrollDot} />
        </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  safeArea: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
  titleSection: {
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  } as TextStyle,
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  } as ViewStyle,
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  } as ViewStyle,
  notificationBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: Colors.status.error,
    borderRadius: BorderRadius.full,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.text.light,
  } as ViewStyle,
  notificationText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.text.light,
  } as TextStyle,
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  } as ViewStyle,
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  } as ViewStyle,
  statIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  statContent: {
    flex: 1,
  } as ViewStyle,
  statValue: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 1,
  } as TextStyle,
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  } as TextStyle,
  scrollIndicator: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  } as ViewStyle,
  scrollDot: {
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 1.5,
  } as ViewStyle,
});
