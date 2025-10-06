import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface OnboardingContentCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageSource?: any;
  gradientColors?: string[];
  delay?: number;
}

export function OnboardingContentCard({ 
  icon, 
  title, 
  description, 
  imageSource,
  gradientColors = ['#3B82F6', '#8B5CF6'],
  delay = 0
}: OnboardingContentCardProps) {
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Animation de l'icône
      iconScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withSpring(1, { damping: 15, stiffness: 100 })
      );
      
      // Animation du titre
      titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      
      // Animation de la description
      descriptionOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      
      // Animation de la carte
      cardScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 100 }));
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleOpacity.value === 1 ? 0 : 20 }],
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
    transform: [{ translateY: descriptionOpacity.value === 1 ? 0 : 20 }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.contentWrapper}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              {icon}
            </Animated.View>
            
            <Animated.Text style={[styles.title, titleAnimatedStyle]}>
              {title}
            </Animated.Text>
            
            <Animated.Text style={[styles.description, descriptionAnimatedStyle]}>
              {description}
            </Animated.Text>
            
            {imageSource && (
              <Animated.View style={[styles.imageContainer, descriptionAnimatedStyle]}>
                <Image source={imageSource} style={styles.image} resizeMode="cover" />
              </Animated.View>
            )}
          </View>
          
          <View style={styles.decorativeElements}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    minHeight: height * 0.65,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  contentWrapper: {
    padding: 40,
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
    fontWeight: '400',
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 220,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 100,
    left: -40,
  },
  circle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 200,
    right: 20,
  },
});
