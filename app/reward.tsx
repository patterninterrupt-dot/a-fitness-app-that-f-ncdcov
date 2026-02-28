
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
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
      
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Trophy Animation */}
          <Animated.View style={[styles.trophyContainer, animatedStyle]}>
            <IconSymbol
              ios_icon_name="trophy.fill"
              android_material_icon_name="emoji-events"
              size={120}
              color={colors.accent}
            />
          </Animated.View>

          {/* Success Message */}
          <Text style={styles.title}>Workout Complete!</Text>
          <Text style={styles.subtitle}>You showed up. That&apos;s what matters.</Text>

          {/* Reward Message */}
          <View style={styles.rewardCard}>
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
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewHistory}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="history"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.secondaryButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
  },
  rewardMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  motivationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
