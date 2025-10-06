import { AnimatedButton } from '@/components/animated-button';
import { AnimatedScreen } from '@/components/animated-screen';
import { FeatureIcon } from '@/components/feature-icon';
import { OnboardingContentCard } from '@/components/onboarding-content-card';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PaginationDots } from '@/components/pagination-dots';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Onboarding3Screen() {
  const handleSkip = () => {
    router.push('/login');
  };

  const handleNext = () => {
    router.push('/onboarding-4');
  };

  return (
    <AnimatedScreen>
      <OnboardingScreen onSkip={handleSkip} onBack={() => router.back()} showBack={true}>
        <OnboardingContentCard
          icon={
            <FeatureIcon
              name="gift"
              color="#FF6B6B"
              backgroundColor="rgba(255, 107, 107, 0.2)"
              animated={true}
            />
          }
          title="Offres exclusives"
          description="Accédez à des promotions spéciales réservées aux membres Maya"
          gradientColors={['#fa709a', '#fee140']}
        />
        
        <View style={styles.paginationContainer}>
          <PaginationDots totalPages={4} currentPage={2} />
          <AnimatedButton
            title="Suivant"
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
