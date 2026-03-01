
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
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

type WorkoutType = 'home' | 'gym';
type WorkoutCategory = 'upper' | 'lower' | 'conditioning';
type WorkoutDuration = 30 | 45 | 60 | 90;
type CardioType = 'running' | 'cycling' | 'rowing';

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
  
  // Cardio modal state
  const [cardioModalVisible, setCardioModalVisible] = useState(false);
  const [selectedCardioType, setSelectedCardioType] = useState<CardioType>('running');
  const [cardioDistance, setCardioDistance] = useState('');
  const [cardioTime, setCardioTime] = useState('');

  const handleStartWorkout = () => {
    console.log('User tapped Start Workout button', {
      type: selectedType,
      category: selectedCategory,
      duration: selectedDuration,
    });
    router.push(`/workout?type=${selectedType}&category=${selectedCategory}&duration=${selectedDuration}`);
  };

  const handleCardioPress = () => {
    console.log('User tapped Cardio button');
    setCardioModalVisible(true);
  };

  const handleCardioSubmit = () => {
    const distance = parseFloat(cardioDistance);
    const time = parseFloat(cardioTime);
    
    if (!cardioDistance || !cardioTime || isNaN(distance) || isNaN(time) || distance <= 0 || time <= 0) {
      console.log('Invalid cardio input', { distance: cardioDistance, time: cardioTime });
      return;
    }
    
    console.log('User submitted cardio workout', {
      cardioType: selectedCardioType,
      distance,
      time,
    });
    
    // TODO: Backend Integration - POST /api/cardio with { cardioType, distance, time, completedAt } → { workout, reward }
    setCardioModalVisible(false);
    router.push(`/reward?message=${encodeURIComponent('Great cardio session! 🏃‍♂️💪')}`);
  };

  const handleSignOut = async () => {
    console.log('User tapped Sign Out');
    await signOut();
  };

  const typeText = selectedType === 'home' ? 'Home' : 'Gym';
  const categoryText = selectedCategory === 'upper' ? 'Upper Body' : selectedCategory === 'lower' ? 'Lower Body' : 'Conditioning';
  const durationText = `${selectedDuration} min`;
  const cardioTypeText = selectedCardioType === 'running' ? 'Running' : selectedCardioType === 'cycling' ? 'Cycling' : 'Rowing';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Header - Logo Only */}
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
          {user && (
            <View style={styles.welcomePill}>
              <Text style={styles.welcomeText}>👋 {user.name || user.email?.split('@')[0] || 'Athlete'}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Pattern Interrupt Box */}
        <View style={styles.patternInterruptCard}>
          <View style={styles.patternInterruptHeader}>
            <View style={styles.patternInterruptAccent} />
            <Text style={styles.patternInterruptTitle}>Interrupt the Pattern</Text>
          </View>
          <Text style={styles.patternInterruptSubtitle}>Feeling stuck? Here&apos;s how to break free:</Text>
          
          <View style={styles.patternStep}>
            <Text style={styles.patternStepNumber}>1.</Text>
            <View style={styles.patternStepContent}>
              <Text style={styles.patternStepBold}>Notice the thought:</Text>
              <Text style={styles.patternStepText}>&quot;I&apos;m not ready.&quot;</Text>
            </View>
          </View>

          <View style={styles.patternStep}>
            <Text style={styles.patternStepNumber}>2.</Text>
            <View style={styles.patternStepContent}>
              <Text style={styles.patternStepBold}>Name it:</Text>
              <Text style={styles.patternStepText}>&quot;That&apos;s just a pattern, not a fact.&quot;</Text>
            </View>
          </View>

          <View style={styles.patternStep}>
            <Text style={styles.patternStepNumber}>3.</Text>
            <View style={styles.patternStepContent}>
              <Text style={styles.patternStepBold}>Act anyway:</Text>
              <Text style={styles.patternStepText}>Choose your workout and start NOW.</Text>
            </View>
          </View>

          <Text style={styles.patternQuote}>&quot;Ready is an action, not a feeling. It&apos;s a choice you make, not a state you wait for.&quot;</Text>
        </View>

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
          <Text style={styles.sectionLabel}>CHOOSE YOUR WORKOUT</Text>
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

        {/* Cardio Option */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STEADY STATE CARDIO</Text>
          <Text style={styles.sectionTitle}>Or log a cardio session</Text>
          <TouchableOpacity
            style={styles.cardioButton}
            onPress={handleCardioPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
              borderRadius={20}
            />
            <View style={styles.cardioButtonContent}>
              <View style={styles.cardioIconBadge}>
                <IconSymbol
                  ios_icon_name="figure.run"
                  android_material_icon_name="directions-run"
                  size={26}
                  color="#FFFFFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardioButtonTitle}>Log Cardio Session</Text>
                <Text style={styles.cardioButtonSubtitle}>Running • Cycling • Rowing</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={22}
                color="rgba(255,255,255,0.8)"
              />
            </View>
          </TouchableOpacity>
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

      {/* Cardio Modal */}
      <Modal
        visible={cardioModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCardioModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Cardio Session</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('User closed cardio modal');
                  setCardioModalVisible(false);
                }}
                style={styles.modalCloseButton}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Cardio Type Selection */}
            <Text style={styles.modalSectionLabel}>ACTIVITY TYPE</Text>
            <View style={styles.cardioTypeRow}>
              {[
                { key: 'running', label: 'Running', icon: 'figure.run' as const, materialIcon: 'directions-run' as const },
                { key: 'cycling', label: 'Cycling', icon: 'bicycle' as const, materialIcon: 'directions-bike' as const },
                { key: 'rowing', label: 'Rowing', icon: 'figure.rowing' as const, materialIcon: 'rowing' as const },
              ].map(({ key, label, icon, materialIcon }) => {
                const isSelected = selectedCardioType === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.cardioTypeCard, isSelected && styles.cardioTypeCardSelected]}
                    onPress={() => {
                      console.log('User selected cardio type:', key);
                      setSelectedCardioType(key as CardioType);
                    }}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <LinearGradient colors={['#10B981', '#059669']} style={StyleSheet.absoluteFillObject} borderRadius={14} />
                    )}
                    <IconSymbol
                      ios_icon_name={icon}
                      android_material_icon_name={materialIcon}
                      size={28}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text style={[styles.cardioTypeText, isSelected && styles.cardioTypeTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Distance Input */}
            <Text style={styles.modalSectionLabel}>DISTANCE (KM)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={cardioDistance}
              onChangeText={setCardioDistance}
            />

            {/* Time Input */}
            <Text style={styles.modalSectionLabel}>TIME (MINUTES)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={cardioTime}
              onChangeText={setCardioTime}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleCardioSubmit}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
                borderRadius={16}
              />
              <Text style={styles.modalSubmitButtonText}>Complete Cardio Session</Text>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Hero - Logo Only
  heroCard: {
    marginHorizontal: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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

  // Pattern Interrupt Card
  patternInterruptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  patternInterruptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternInterruptAccent: {
    width: 5,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: 3,
    marginRight: 12,
  },
  patternInterruptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  patternInterruptSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  patternStep: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  patternStepNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 12,
    width: 24,
  },
  patternStepContent: {
    flex: 1,
  },
  patternStepBold: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  patternStepText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  patternQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    lineHeight: 20,
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

  // Cardio Button
  cardioButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardioButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
  },
  cardioIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardioButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
    marginBottom: 3,
  },
  cardioButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
  },
  cardioTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  cardioTypeCard: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  cardioTypeCardSelected: {
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardioTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  cardioTypeTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F7F7F9',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalSubmitButton: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
