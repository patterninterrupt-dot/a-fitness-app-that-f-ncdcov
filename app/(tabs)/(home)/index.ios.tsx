
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol.ios';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
  console.log('HomeScreen (iOS): Rendering workout selection screen');
  
  const router = useRouter();
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

  const typeText = selectedType === 'home' ? 'Home' : 'Gym';
  const categoryText = selectedCategory === 'upper' ? 'Upper Body' : selectedCategory === 'lower' ? 'Lower Body' : 'Conditioning';
  const durationText = `${selectedDuration} min`;
  const cardioTypeText = selectedCardioType === 'running' ? 'Running' : selectedCardioType === 'cycling' ? 'Cycling' : 'Rowing';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Logo and Header */}
        <View style={styles.logoContainer}>
          <Image
            source={resolveImageSource(require('@/assets/images/73c0c96e-8497-4bac-8c89-5decec12a3cf.jpeg'))}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sometimes we just have to start, then everything else will follow. So, choose your workout below and soon, with a little consistency, you will have created a new habit!</Text>
        </View>

        {/* Workout Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Location</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedType === 'home' && styles.optionCardSelected,
              ]}
              onPress={() => {
                console.log('User selected Home workout type');
                setSelectedType('home');
              }}
            >
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={32}
                color={selectedType === 'home' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedType === 'home' && styles.optionTextSelected,
                ]}
              >
                Home
              </Text>
              <Text style={styles.optionSubtext}>Bodyweight circuits</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedType === 'gym' && styles.optionCardSelected,
              ]}
              onPress={() => {
                console.log('User selected Gym workout type');
                setSelectedType('gym');
              }}
            >
              <IconSymbol
                ios_icon_name="dumbbell.fill"
                android_material_icon_name="fitness-center"
                size={32}
                color={selectedType === 'gym' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedType === 'gym' && styles.optionTextSelected,
                ]}
              >
                Gym
              </Text>
              <Text style={styles.optionSubtext}>Equipment & weights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Area</Text>
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'upper' && styles.categoryCardSelected,
              ]}
              onPress={() => {
                console.log('User selected Upper Body category');
                setSelectedCategory('upper');
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === 'upper' && styles.categoryTextSelected,
                ]}
              >
                Upper Body
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'lower' && styles.categoryCardSelected,
              ]}
              onPress={() => {
                console.log('User selected Lower Body category');
                setSelectedCategory('lower');
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === 'lower' && styles.categoryTextSelected,
                ]}
              >
                Lower Body
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === 'conditioning' && styles.categoryCardSelected,
              ]}
              onPress={() => {
                console.log('User selected Conditioning category');
                setSelectedCategory('conditioning');
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === 'conditioning' && styles.categoryTextSelected,
                ]}
              >
                Conditioning
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cardio Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steady State Cardio</Text>
          <TouchableOpacity
            style={styles.cardioButton}
            onPress={handleCardioPress}
          >
            <View style={styles.cardioIconBadge}>
              <IconSymbol
                ios_icon_name="figure.run"
                android_material_icon_name="directions-run"
                size={28}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardioButtonTitle}>Log Cardio Session</Text>
              <Text style={styles.cardioButtonSubtitle}>Running • Cycling • Rowing</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationRow}>
            {[30, 45, 60, 90].map((duration) => {
              const isSelected = selectedDuration === duration;
              const durationLabel = `${duration} min`;
              return (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationCard,
                    isSelected && styles.durationCardSelected,
                  ]}
                  onPress={() => {
                    console.log('User selected duration:', duration);
                    setSelectedDuration(duration as WorkoutDuration);
                  }}
                >
                  <Text
                    style={[
                      styles.durationText,
                      isSelected && styles.durationTextSelected,
                    ]}
                  >
                    {durationLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>Start Workout</Text>
          <IconSymbol
            ios_icon_name="arrow.right"
            android_material_icon_name="arrow-forward"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Workout</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue}>{typeText}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Focus:</Text>
            <Text style={styles.summaryValue}>{categoryText}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{durationText}</Text>
          </View>
        </View>
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
            <Text style={styles.modalSectionLabel}>Activity Type</Text>
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
                  >
                    <IconSymbol
                      ios_icon_name={icon}
                      android_material_icon_name={materialIcon}
                      size={28}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.cardioTypeText, isSelected && styles.cardioTypeTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Distance Input */}
            <Text style={styles.modalSectionLabel}>Distance (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5.0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={cardioDistance}
              onChangeText={setCardioDistance}
            />

            {/* Time Input */}
            <Text style={styles.modalSectionLabel}>Time (minutes)</Text>
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
            >
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  logo: {
    width: 200,
    height: 120,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.secondary,
    lineHeight: 25,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  optionSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: colors.primary,
  },
  cardioButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardioIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardioButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  cardioButtonSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  durationCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: '#F5F5F5',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  durationTextSelected: {
    color: colors.secondary,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
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
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardioTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  cardioTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  cardioTypeTextSelected: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalSubmitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
