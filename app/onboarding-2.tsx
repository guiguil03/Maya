import { AnimatedButton } from '@/components/animated-button';
import { AnimatedScreen } from '@/components/animated-screen';
import { FeatureIcon } from '@/components/feature-icon';
import { OnboardingContentCard } from '@/components/onboarding-content-card';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PaginationDots } from '@/components/pagination-dots';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Onboarding2Screen() {
  const handleSkip = () => {
    router.push('/login');
  };

  const handleNext = () => {
    router.push('/onboarding-3');
  };

  return (
    <AnimatedScreen>
      <OnboardingScreen onSkip={handleSkip} onBack={() => router.back()} showBack={true}>
        <OnboardingContentCard
          icon={
            <FeatureIcon
              name="shield-checkmark"
              color="#00FF88"
              backgroundColor="rgba(0, 255, 136, 0.2)"
              animated={true}
            />
          }
          title="Sécurisé et simple"
          description="Votre QR code unique vous garantit des paiements sécurisés et rapides"
          gradientColors={['#4facfe', '#00f2fe']}
        />
        
        <View style={styles.paginationContainer}>
          <PaginationDots totalPages={4} currentPage={1} />
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
