import { AnimatedButton } from '@/components/animated-button';
import { NavigationTransition } from '@/components/navigation-transition';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const handleScanPartner = () => {
    // Logique pour scanner un partenaire
    console.log('Scanner un partenaire');
  };

  const handlePartnerMode = () => {
    // Logique pour le mode partenaire
    console.log('Mode partenaire');
  };

  return (
    <NavigationTransition>
      <View style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Bonjour, Sarah</Text>
                <Text style={styles.greetingEmoji}>✨✨</Text>
              </View>
              <Text style={styles.subtitle}>Prête à économiser aujourd'hui ?</Text>
              
              <TouchableOpacity style={styles.partnerModeButton} onPress={handlePartnerMode}>
                <Ionicons name="storefront" size={20} color={Colors.accent.orange} />
                <Text style={styles.partnerModeText}>Mode Partenaire</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.familyText}>Famille</Text>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Votre QR Code Maya</Text>
            <Text style={styles.qrSubtitle}>Présentez ce code chez tous nos partenaires</Text>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrCode}>
                {/* QR Code simulé */}
                <View style={styles.qrGrid}>
                  {Array.from({ length: 25 }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.qrSquare,
                        { backgroundColor: Math.random() > 0.5 ? Colors.primary[600] : 'white' }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            <AnimatedButton
              title="Scanner un partenaire"
              onPress={handleScanPartner}
              icon="scan"
              style={styles.scanButton}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="trending-up" size={24} color={Colors.status.success} />
                <Text style={styles.statPeriod}>CE MOIS</Text>
              </View>
              <Text style={styles.statValue}>47.8€</Text>
              <Text style={styles.statLabel}>Économisées</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="location" size={24} color={Colors.accent.orange} />
                <Text style={styles.statPeriod}>VISITES</Text>
              </View>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Partenaires</Text>
            </View>
          </View>
        </View>
      </View>
    </NavigationTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  headerGradient: {
    paddingBottom: Spacing.xl,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  greeting: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text.light,
    marginRight: Spacing.sm,
  },
  greetingEmoji: {
    fontSize: Typography.sizes.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.lg,
  },
  partnerModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.accent.orange,
    alignSelf: 'flex-end',
    gap: Spacing.xs,
  },
  partnerModeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent.orange,
  },
  familyText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  qrCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  qrTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  qrSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
  },
  qrGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  qrSquare: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
  },
  scanButton: {
    marginTop: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statPeriod: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.status.success,
  },
  statValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.status.success,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
