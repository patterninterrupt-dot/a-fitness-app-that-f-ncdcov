
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function RewardScreen() {
  console.log('RewardScreen: Rendering reward screen');
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const [rewardMessage, setRewardMessage] = useState('');
  
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    console.log('RewardScreen: Loading reward data');
    // Use the reward message passed from the workout completion
    const message = params.message
      ? decodeURIComponent(params.message as string)
      : "You showed up! That's what matters! 💪";
    setRewardMessage(message);
    console.log('RewardScreen: Reward message set:', message);
    
    // Animate trophy
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    rotation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handleContinue = () => {
    console.log('User tapped Continue button');
    router.replace('/(tabs)/(home)/');
  };

  const handleViewHistory = () => {
    console.log('User tapped View History button');
    router.push('/history');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <LinearGradient
        colors={['#D91B7C', '#A0145A', '#6B0E3D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Trophy Animation */}
            <Animated.View style={[styles.trophyContainer, animatedStyle]}>
              <View style={styles.trophyBadge}>
                <IconSymbol
                  ios_icon_name="trophy.fill"
                  android_material_icon_name="emoji-events"
                  size={72}
                  color="#EAB308"
                />
              </View>
            </Animated.View>

            {/* Success Message */}
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>You showed up. That&apos;s what matters.</Text>

            {/* Reward Message */}
            <View style={styles.rewardCard}>
              <Text style={styles.rewardLabel}>YOUR REWARD</Text>
              <Text style={styles.rewardMessage}>{rewardMessage}</Text>
            </View>

            {/* Motivational Text */}
            <View style={styles.motivationCard}>
              <Text style={styles.motivationText}>
                Ready is not a feeling, it&apos;s an action. You took action today and that&apos;s a win.
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Continue Training</Text>
              <View style={styles.primaryButtonArrow}>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory} activeOpacity={0.8}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="history"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.secondaryButtonText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyContainer: {
    marginBottom: 28,
  },
  trophyBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '400',
  },
  rewardCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardMessage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
  },
  motivationCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  motivationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 23,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.1,
  },
  primaryButtonArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
