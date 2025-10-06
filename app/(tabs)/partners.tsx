import { NavigationTransition } from '@/components/navigation-transition';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/design-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PartnersScreen() {
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [viewMode, setViewMode] = useState('Liste');

  const partners = [
    {
      id: 1,
      name: 'Café des Arts',
      rating: 4.8,
      description: 'Café cosy avec terrasse, spécialités artisanales',
      address: '15 rue de la Paix, Pari...',
      distance: '0.2 km',
      status: 'Ouvert',
      closingTime: '22h00',
      discount: '10% OFF',
      offer: 'Remise immédiate avec Maya',
      category: 'Café',
      image: '☕'
    },
    {
      id: 2,
      name: 'Bistro Le Marché',
      rating: 4.6,
      description: 'Cuisine française traditionnelle, produits frais',
      address: '8 place du Marché, Pa...',
      distance: '0.5 km',
      status: 'Ouvert',
      closingTime: '23h00',
      discount: '15% OFF',
      offer: 'Remise immédiate avec Maya',
      category: 'Restaurant',
      image: '🍽️'
    },
    {
      id: 3,
      name: 'Boutique Mode',
      rating: 4.4,
      description: 'Vêtements tendance pour toute la famille',
      address: '12 avenue des Champs...',
      distance: '0.8 km',
      status: 'Fermé',
      closingTime: '20h00',
      discount: '20% OFF',
      offer: 'Remise immédiate avec Maya',
      category: 'Shop',
      image: '👕'
    }
  ];

  const filters = ['Tous', 'Restaurant', 'Café', 'Shop'];

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
              <View>
                <Text style={styles.title}>Partenaires</Text>
                <Text style={styles.subtitle}>5 partenaires près de vous</Text>
              </View>
              <TouchableOpacity style={styles.partnerModeButton}>
                <Ionicons name="storefront" size={16} color={Colors.accent.orange} />
                <Text style={styles.partnerModeText}>Mode Partenaire</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un partenaire..."
              placeholderTextColor={Colors.text.muted}
            />
          </View>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'Liste' && styles.viewButtonActive]}
              onPress={() => setViewMode('Liste')}
            >
              <Text style={[styles.viewButtonText, viewMode === 'Liste' && styles.viewButtonTextActive]}>
                Liste
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'Carte' && styles.viewButtonActive]}
              onPress={() => setViewMode('Carte')}
            >
              <Ionicons name="location" size={16} color={viewMode === 'Carte' ? Colors.text.light : Colors.text.primary} />
              <Text style={[styles.viewButtonText, viewMode === 'Carte' && styles.viewButtonTextActive]}>
                Carte
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Ionicons
                  name={filter === 'Tous' ? 'star' : filter === 'Restaurant' ? 'restaurant' : filter === 'Café' ? 'cafe' : 'bag'}
                  size={16}
                  color={selectedFilter === filter ? Colors.text.light : Colors.text.primary}
                />
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.partnersList} showsVerticalScrollIndicator={false}>
            {partners.map((partner) => (
              <TouchableOpacity key={partner.id} style={styles.partnerCard}>
                <View style={styles.partnerImage}>
                  <Text style={styles.partnerImageText}>{partner.image}</Text>
                </View>
                
                <View style={styles.partnerInfo}>
                  <View style={styles.partnerHeader}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={Colors.accent.gold} />
                      <Text style={styles.rating}>{partner.rating}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.partnerDescription}>{partner.description}</Text>
                  
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={14} color={Colors.text.secondary} />
                    <Text style={styles.address}>{partner.address}</Text>
                    <Text style={styles.distance}>{partner.distance}</Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <TouchableOpacity style={[
                      styles.statusButton,
                      partner.status === 'Ouvert' ? styles.statusOpen : styles.statusClosed
                    ]}>
                      <Ionicons name="time" size={14} color={partner.status === 'Ouvert' ? Colors.text.light : Colors.text.primary} />
                      <Text style={[
                        styles.statusText,
                        partner.status === 'Ouvert' ? styles.statusTextOpen : styles.statusTextClosed
                      ]}>
                        {partner.status}
                      </Text>
                      <Text style={styles.closingTime}>{partner.closingTime}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.goButton}>
                      <Ionicons name="location" size={16} color={Colors.text.primary} />
                      <Text style={styles.goButtonText}>Y aller</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.offerContainer}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{partner.discount}</Text>
                    </View>
                    <Text style={styles.offerText}>{partner.offer}</Text>
                    <TouchableOpacity style={styles.useButton}>
                      <Text style={styles.useButtonText}>Utiliser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  partnerCard: {
    width: '48%',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  partnerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  partnerName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  partnerCategory: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  discountBadge: {
    backgroundColor: Colors.status.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  discountText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text.light,
  },
});
