import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export type PartnerTab = 'overview' | 'history' | 'subscription' | 'stats' | 'stores';

interface PartnerBottomNavProps {
  selectedTab: PartnerTab;
  onTabChange: (tab: PartnerTab) => void;
}

export function PartnerBottomNav({ selectedTab, onTabChange }: PartnerBottomNavProps) {
  const tabs: { key: PartnerTab; label: string; icon: { active: string; inactive: string } }[] = [
    { key: 'overview', label: 'Home', icon: { active: 'grid', inactive: 'grid-outline' } },
    { key: 'history', label: 'Historique', icon: { active: 'time', inactive: 'time-outline' } },
    { key: 'stats', label: 'Statistiques', icon: { active: 'stats-chart', inactive: 'stats-chart-outline' } },
    { key: 'subscription', label: 'Abonnement', icon: { active: 'card', inactive: 'card-outline' } },
    { key: 'stores', label: 'Magasins', icon: { active: 'storefront', inactive: 'storefront-outline' } },
  ];

  return (
    <View style={styles.bottomNavBarContainer}>
      <View style={styles.bottomNavBar}>
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.bottomNavItem, isActive && styles.bottomNavItemActive]}
              onPress={() => onTabChange(tab.key)}
            >
              <Ionicons
                name={isActive ? (tab.icon.active as any) : (tab.icon.inactive as any)}
                size={24}
                color={isActive ? '#8B2F3F' : 'rgba(255, 255, 255, 0.5)'}
              />
              <Text
                style={[
                  styles.bottomNavText,
                  isActive && styles.bottomNavTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 12,
    paddingTop: 12,
    height: 70,
  } as ViewStyle,
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  } as ViewStyle,
  bottomNavItemActive: {
    // Style pour l'item actif si nécessaire
  } as ViewStyle,
  bottomNavText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  } as TextStyle,
  bottomNavTextActive: {
    color: '#8B2F3F',
    fontWeight: '600',
  } as TextStyle,
});

