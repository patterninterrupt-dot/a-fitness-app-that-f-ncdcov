
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol.ios';
import { useRouter } from 'expo-router';

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
  console.log('HomeScreen (iOS): Rendering workout selection screen');
  
  const router = useRouter();
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

  const typeText = selectedType === 'home' ? 'Home' : 'Gym';
  const categoryText = selectedCategory === 'upper' ? 'Upper Body' : selectedCategory === 'lower' ? 'Lower Body' : 'Conditioning';
  const durationText = `${selectedDuration} min`;

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
          <Text style={styles.headerTitle}>Ready is an Action</Text>
          <Text style={styles.headerSubtitle}>Not a feeling. Choose your workout and start building consistency.</Text>
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

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Consistency over intensity. Show up, do the work, build the habit."
          </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 8,
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
  quoteCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
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
});
