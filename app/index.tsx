import { AnimatedButton } from '@/components/animated-button';
import { AnimatedScreen } from '@/components/animated-screen';
import { FeatureIcon } from '@/components/feature-icon';
import { OnboardingContentCard } from '@/components/onboarding-content-card';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PaginationDots } from '@/components/pagination-dots';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Index() {
  const handleSkip = () => {
    router.push('/login');
  };

  const handleNext = () => {
    router.push('/onboarding-2');
  };

  return (
    <AnimatedScreen>
      <OnboardingScreen onSkip={handleSkip}>
        <OnboardingContentCard
          icon={
            <FeatureIcon
              name="flash"
              color="#FFD700"
              backgroundColor="rgba(255, 215, 0, 0.2)"
              animated={true}
            />
          }
          title="10% de remise immédiate"
          description="Économisez sur tous vos achats chez nos partenaires avec un simple scan"
          gradientColors={['#667eea', '#764ba2']}
        />
        
        <View style={styles.paginationContainer}>
          <PaginationDots totalPages={4} currentPage={0} />
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
