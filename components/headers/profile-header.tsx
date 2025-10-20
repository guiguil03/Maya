import { BorderRadius, Colors, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface ProfileHeaderProps {
  title: string;
  subtitle: string;
  userEmail?: string;
  onSettingsPress?: () => void;
  onNotificationPress?: () => void;
  style?: any;
}

export function ProfileHeader({
  title,
  subtitle,
  userEmail,
  onSettingsPress,
  onNotificationPress,
  style
}: ProfileHeaderProps) {
  return (
    <LinearGradient
      colors={['#4F46E5', '#3730A3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {/* Header principal */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
          <Ionicons name="settings" size={16} color={Colors.text.light} />
        </TouchableOpacity>
        
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        
        <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Ionicons name="notifications" size={16} color={Colors.text.light} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Informations utilisateur */}
      {userEmail && (
        <View style={styles.userInfoContainer}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={Colors.text.light} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userEmail.split('@')[0]}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={14} color={Colors.text.light} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  } as ViewStyle,
  settingsButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  } as ViewStyle,
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    textAlign: 'center',
  } as TextStyle,
  notificationButton: {
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
  userInfoContainer: {
    alignItems: 'center',
  } as ViewStyle,
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  } as ViewStyle,
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  } as ViewStyle,
  userDetails: {
    flex: 1,
  } as ViewStyle,
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 2,
  } as TextStyle,
  userEmail: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  } as TextStyle,
  editButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});
