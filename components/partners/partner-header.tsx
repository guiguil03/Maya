import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface PartnerHeaderProps {
  firstName?: string;
  lastName?: string;
  onLogout?: () => void;
}

export function PartnerHeader({ firstName, lastName, onLogout }: PartnerHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {firstName || 'Partenaire'} {lastName || ''}
          </Text>
          <Text style={styles.headerSubtitle}>Tableau de bord partenaire</Text>
        </View>
        {onLogout && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.text.light} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  } as ViewStyle,
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  headerTextContainer: {
    flex: 1,
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
  logoutButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});

