import { AnimatedButton } from '@/components/animated-button';
import { AnimatedScreen } from '@/components/animated-screen';
import { FeatureIcon } from '@/components/feature-icon';
import { OnboardingContentCard } from '@/components/onboarding-content-card';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PaginationDots } from '@/components/pagination-dots';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Onboarding4Screen() {
  const handleSkip = () => {
    router.push('/login');
  };

  const handleNext = () => {
    router.push('/login');
  };

  return (
    <AnimatedScreen>
      <OnboardingScreen onSkip={handleSkip} onBack={() => router.back()} showBack={true}>
        <OnboardingContentCard
          icon={
            <FeatureIcon
              name="star"
              color="#FFD700"
              backgroundColor="rgba(255, 215, 0, 0.2)"
              animated={true}
            />
          }
          title="Rejoignez Maya"
          description="Des milliers de partenaires vous attendent pour maximiser vos économies"
          gradientColors={['#a8edea', '#fed6e3']}
        />
        
        <View style={styles.paginationContainer}>
          <PaginationDots totalPages={4} currentPage={3} />
          <AnimatedButton
            title="Commencer"
            onPress={handleNext}
            icon="arrow-forward"
            style={styles.nextButton}
          />
        </View>
      </OnboardingScreen>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nextButton: {
    marginTop: 24,
  },
});
