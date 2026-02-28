
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { apiGet } from '@/utils/api';

interface Exercise {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  reps?: string;
  sets?: string;
  duration?: string;
}

type FilterType = 'all' | 'home' | 'gym';
type FilterCategory = 'all' | 'upper' | 'lower' | 'conditioning';

export default function ProfileScreen() {
  console.log('ProfileScreen: Rendering exercise library');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');

  useEffect(() => {
    console.log('ProfileScreen: Loading exercise library');
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      console.log('[API] Requesting GET /api/exercises');
      const data = await apiGet<Exercise[]>('/api/exercises');
      setExercises(data);
      console.log('ProfileScreen: Loaded exercises', data.length);
    } catch (error) {
      console.error('ProfileScreen: Error loading exercises', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const typeMatch = filterType === 'all' || exercise.type === filterType;
    const categoryMatch = filterCategory === 'all' || exercise.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  const filteredCount = filteredExercises.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Exercise Library</Text>
          <Text style={styles.headerSubtitle}>Browse all available exercises for your workouts</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Type</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterType === 'all' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: all types');
                setFilterType('all');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === 'all' && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterType === 'home' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: home');
                setFilterType('home');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === 'home' && styles.filterChipTextActive,
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterType === 'gym' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: gym');
                setFilterType('gym');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === 'gym' && styles.filterChipTextActive,
                ]}
              >
                Gym
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterCategory === 'all' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: all categories');
                setFilterCategory('all');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === 'all' && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterCategory === 'upper' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: upper');
                setFilterCategory('upper');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === 'upper' && styles.filterChipTextActive,
                ]}
              >
                Upper
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterCategory === 'lower' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: lower');
                setFilterCategory('lower');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === 'lower' && styles.filterChipTextActive,
                ]}
              >
                Lower
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterCategory === 'conditioning' && styles.filterChipActive,
              ]}
              onPress={() => {
                console.log('User selected filter: conditioning');
                setFilterCategory('conditioning');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === 'conditioning' && styles.filterChipTextActive,
                ]}
              >
                Conditioning
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsText}>{filteredCount} exercises</Text>

        {/* Exercise List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          filteredExercises.map((exercise) => {
            const typeText = exercise.type === 'home' ? 'Home' : 'Gym';
            const categoryText = exercise.category === 'upper' ? 'Upper' : exercise.category === 'lower' ? 'Lower' : 'Conditioning';
            const detailText = exercise.sets && exercise.reps
              ? `${exercise.sets} × ${exercise.reps}`
              : exercise.duration || '';
            
            return (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseIcon}>
                    <IconSymbol
                      ios_icon_name="figure.strengthtraining.traditional"
                      android_material_icon_name="fitness-center"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseTags}>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{typeText}</Text>
                      </View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{categoryText}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                <Text style={styles.exerciseDetail}>{detailText}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  exerciseDetail: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
