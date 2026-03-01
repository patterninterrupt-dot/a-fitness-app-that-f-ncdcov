
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

type WorkoutType = 'home' | 'gym';
type WorkoutCategory = 'upper' | 'lower' | 'conditioning';
type WorkoutDuration = 30 | 45 | 60 | 90;

// Helper to resolve image sources (handles both local require() and remote URLs)
function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function HomeScreen() {
  console.log('HomeScreen: Rendering workout selection screen');
  
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [selectedType, setSelectedType] = useState<WorkoutType>('home');
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>('upper');
  const [selectedDuration, setSelectedDuration] = useState<WorkoutDuration>(45);

  const handleStartWorkout = () => {
    console.log('User tapped Start Workout button', {
      type: selectedType,
      category: selectedCategory,
      duration: selectedDuration,
    });
    router.push(`/workout?type=${selectedType}&category=${selectedCategory}&duration=${selectedDuration}`);
  };

  const handleSignOut = async () => {
    console.log('User tapped Sign Out');
    await signOut();
  };

  const typeText = selectedType === 'home' ? 'Home' : 'Gym';
  const categoryText = selectedCategory === 'upper' ? 'Upper Body' : selectedCategory === 'lower' ? 'Lower Body' : 'Conditioning';
  const durationText = `${selectedDuration} min`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Header */}
        <LinearGradient
          colors={['#D91B7C', '#A0145A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <Image
              source={resolveImageSource(require('@/assets/images/73c0c96e-8497-4bac-8c89-5decec12a3cf.jpeg'))}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <IconSymbol
                ios_icon_name="rectangle.portrait.and.arrow.right"
                android_material_icon_name="logout"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroTitle}>Ready is an Action</Text>
          <Text style={styles.heroSubtitle}>Not a feeling. Choose your workout and start building consistency.</Text>
          {user && (
            <View style={styles.welcomePill}>
              <Text style={styles.welcomeText}>👋 {user.name || user.email?.split('@')[0] || 'Athlete'}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              console.log('User tapped History button');
              router.push('/history');
            }}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="history"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              console.log('User tapped Rewards button');
              router.push('/history?tab=rewards');
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
              <IconSymbol
                ios_icon_name="trophy.fill"
                android_material_icon_name="emoji-events"
                size={22}
                color={colors.accent}
              />
            </View>
            <Text style={styles.quickActionText}>Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Workout Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <Text style={styles.sectionTitle}>Where are you training?</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionCard, selectedType === 'home' && styles.optionCardSelected]}
              onPress={() => {
                console.log('User selected Home workout type');
                setSelectedType('home');
              }}
              activeOpacity={0.8}
            >
              {selectedType === 'home' && (
                <LinearGradient colors={['#D91B7C', '#A0145A']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
              )}
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={34}
                color={selectedType === 'home' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.optionText, selectedType === 'home' && styles.optionTextSelected]}>Home</Text>
              <Text style={[styles.optionSubtext, selectedType === 'home' && styles.optionSubtextSelected]}>Bodyweight circuits</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, selectedType === 'gym' && styles.optionCardSelected]}
              onPress={() => {
                console.log('User selected Gym workout type');
                setSelectedType('gym');
              }}
              activeOpacity={0.8}
            >
              {selectedType === 'gym' && (
                <LinearGradient colors={['#D91B7C', '#A0145A']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
              )}
              <IconSymbol
                ios_icon_name="dumbbell.fill"
                android_material_icon_name="fitness-center"
                size={34}
                color={selectedType === 'gym' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.optionText, selectedType === 'gym' && styles.optionTextSelected]}>Gym</Text>
              <Text style={[styles.optionSubtext, selectedType === 'gym' && styles.optionSubtextSelected]}>Equipment & weights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FOCUS AREA</Text>
          <Text style={styles.sectionTitle}>What are you training?</Text>
          <View style={styles.categoryRow}>
            {[
              { key: 'upper', label: 'Upper Body', icon: 'figure.arms.open' as const, materialIcon: 'accessibility' as const },
              { key: 'lower', label: 'Lower Body', icon: 'figure.walk' as const, materialIcon: 'directions-walk' as const },
              { key: 'conditioning', label: 'Conditioning', icon: 'bolt.fill' as const, materialIcon: 'bolt' as const },
            ].map(({ key, label, icon, materialIcon }) => {
              const isSelected = selectedCategory === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => {
                    console.log('User selected category:', key);
                    setSelectedCategory(key as WorkoutCategory);
                  }}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <LinearGradient colors={['#D91B7C', '#A0145A']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
                  )}
                  <IconSymbol
                    ios_icon_name={icon}
                    android_material_icon_name={materialIcon}
                    size={22}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DURATION</Text>
          <Text style={styles.sectionTitle}>How long do you have?</Text>
          <View style={styles.durationRow}>
            {[30, 45, 60, 90].map((duration) => {
              const isSelected = selectedDuration === duration;
              return (
                <TouchableOpacity
                  key={duration}
                  style={[styles.durationCard, isSelected && styles.durationCardSelected]}
                  onPress={() => {
                    console.log('User selected duration:', duration);
                    setSelectedDuration(duration as WorkoutDuration);
                  }}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <LinearGradient colors={['#D91B7C', '#A0145A']} style={StyleSheet.absoluteFillObject} borderRadius={14} />
                  )}
                  <Text style={[styles.durationNumber, isSelected && styles.durationNumberSelected]}>{duration}</Text>
                  <Text style={[styles.durationUnit, isSelected && styles.durationUnitSelected]}>min</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pattern Interrupt Section */}
        <View style={styles.patternInterruptCard}>
          <View style={styles.patternInterruptHeader}>
            <View style={styles.patternIconBadge}>
              <IconSymbol
                ios_icon_name="brain.head.profile"
                android_material_icon_name="psychology"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patternInterruptTitle}>Interrupt the Pattern</Text>
              <Text style={styles.patternInterruptSubtitle}>Break the thinking that keeps you stuck</Text>
            </View>
          </View>
          <View style={styles.patternDivider} />
          <View style={styles.patternInterruptSteps}>
            {[
              { n: '1', text: 'Notice the thought: "I\'m not ready" or "I\'ll start tomorrow"' },
              { n: '2', text: 'Name it: "That\'s just a pattern, not a fact"' },
              { n: '3', text: 'Act anyway: Choose your workout and start NOW' },
            ].map(({ n, text }) => (
              <View key={n} style={styles.patternStep}>
                <View style={styles.patternStepNumber}>
                  <Text style={styles.patternStepNumberText}>{n}</Text>
                </View>
                <Text style={styles.patternStepText}>{text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.patternInterruptQuote}>
            <Text style={styles.patternInterruptQuoteText}>
              "Ready is an action, not a feeling. You don't wait to feel ready — you act, and readiness follows."
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButtonWrapper} onPress={handleStartWorkout} activeOpacity={0.9}>
          <LinearGradient
            colors={['#D91B7C', '#A0145A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <View style={styles.startButtonContent}>
              <View>
                <Text style={styles.startButtonLabel}>YOUR WORKOUT</Text>
                <Text style={styles.startButtonMain}>{typeText} · {categoryText} · {durationText}</Text>
              </View>
              <View style={styles.startButtonArrow}>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={22}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },

  // Hero
  heroCard: {
    marginHorizontal: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    marginBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 60,
  },
  signOutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 16,
  },
  welcomePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 28,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Option Cards (Home/Gym)
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
    letterSpacing: 0.1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  optionSubtextSelected: {
    color: 'rgba(255,255,255,0.75)',
  },

  // Category Cards
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardSelected: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },

  // Duration Cards
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  durationCardSelected: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  durationNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  durationNumberSelected: {
    color: '#FFFFFF',
  },
  durationUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  durationUnitSelected: {
    color: 'rgba(255,255,255,0.8)',
  },

  // Pattern Interrupt
  patternInterruptCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  patternInterruptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  patternIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF0F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternInterruptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  patternInterruptSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  patternDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  patternInterruptSteps: {
    gap: 14,
    marginBottom: 20,
  },
  patternStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  patternStepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  patternStepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  patternStepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  patternInterruptQuote: {
    backgroundColor: '#FFF0F7',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  patternInterruptQuoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.secondary,
    lineHeight: 20,
  },

  // Start Button
  startButtonWrapper: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButton: {
    padding: 22,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startButtonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  startButtonMain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  startButtonArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
