
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { apiGet, authenticatedPost } from '@/utils/api';

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

export default function WorkoutScreen() {
  console.log('WorkoutScreen: Rendering workout screen');
  
  const params = useLocalSearchParams();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const workoutType = params.type as string;
  const workoutCategory = params.category as string;
  const workoutDuration = params.duration as string;

  useEffect(() => {
    console.log('WorkoutScreen: Fetching exercises for workout', {
      type: workoutType,
      category: workoutCategory,
      duration: workoutDuration,
    });
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      console.log(`[API] Requesting /api/exercises/${workoutType}/${workoutCategory}/${workoutDuration}`);
      const data = await apiGet<Exercise[]>(`/api/exercises/${workoutType}/${workoutCategory}/${workoutDuration}`);
      setExercises(data);
      console.log('WorkoutScreen: Loaded exercises', data.length);
    } catch (error) {
      console.error('WorkoutScreen: Error loading exercises', error);
      setErrorModal({ visible: true, message: 'Failed to load exercises. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleExerciseComplete = (exerciseId: string) => {
    console.log('User toggled exercise completion', exerciseId);
    setCompletedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleCompleteWorkout = async () => {
    console.log('User tapped Complete Workout button');
    
    if (completedExercises.size < exercises.length) {
      console.log('Not all exercises completed', {
        completed: completedExercises.size,
        total: exercises.length,
      });
      return;
    }

    try {
      setCompleting(true);
      const completedAt = new Date().toISOString();
      console.log('[API] Requesting POST /api/workouts', {
        type: workoutType,
        category: workoutCategory,
        duration: parseInt(workoutDuration, 10),
        completedAt,
      });
      
      const result = await authenticatedPost<{ workout: any; reward: { message: string } }>('/api/workouts', {
        type: workoutType,
        duration: parseInt(workoutDuration, 10),
        category: workoutCategory,
        completedAt,
      });
      
      console.log('WorkoutScreen: Workout completed, reward earned', result.reward?.message);
      
      // Navigate to reward screen with the reward message
      router.replace(`/reward?message=${encodeURIComponent(result.reward?.message || 'Great job! 💪')}`);
    } catch (error) {
      console.error('WorkoutScreen: Error completing workout', error);
      setErrorModal({ visible: true, message: 'Failed to save workout. Please try again.' });
    } finally {
      setCompleting(false);
    }
  };

  const typeText = workoutType === 'home' ? 'Home' : 'Gym';
  const categoryText = workoutCategory === 'upper' ? 'Upper Body' : workoutCategory === 'lower' ? 'Lower Body' : 'Conditioning';
  const durationText = `${workoutDuration} min`;
  const completedCount = completedExercises.size;
  const totalCount = exercises.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Your Workout',
          headerBackTitle: 'Back',
        }}
      />

      {/* Error Modal */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Oops!</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal({ visible: false, message: '' })}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your workout...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Workout Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.infoText}>{typeText}</Text>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="figure.strengthtraining.traditional"
                android_material_icon_name="fitness-center"
                size={20}
                color={colors.secondary}
              />
              <Text style={styles.infoText}>{categoryText}</Text>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="schedule"
                size={20}
                color={colors.accent}
              />
              <Text style={styles.infoText}>{durationText}</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedCount / totalCount) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{completedCount} of {totalCount} exercises completed</Text>
          </View>

          {/* Exercises */}
          <Text style={styles.sectionTitle}>Exercises</Text>
          {exercises.map((exercise, index) => {
            const isCompleted = completedExercises.has(exercise.id);
            const exerciseNumber = index + 1;
            const exerciseInfo = exercise.reps && exercise.sets
              ? `${exercise.sets} × ${exercise.reps}`
              : exercise.duration || '';
            
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  isCompleted && styles.exerciseCardCompleted,
                ]}
                onPress={() => toggleExerciseComplete(exercise.id)}
              >
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseLeft}>
                    <View
                      style={[
                        styles.exerciseNumber,
                        isCompleted && styles.exerciseNumberCompleted,
                      ]}
                    >
                      {isCompleted ? (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      ) : (
                        <Text style={styles.exerciseNumberText}>{exerciseNumber}</Text>
                      )}
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[
                          styles.exerciseName,
                          isCompleted && styles.exerciseNameCompleted,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseDetail}>{exerciseInfo}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isCompleted && styles.checkboxCompleted,
                    ]}
                  >
                    {isCompleted && (
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                </View>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              !allCompleted && styles.completeButtonDisabled,
            ]}
            onPress={handleCompleteWorkout}
            disabled={!allCompleted || completing}
          >
            {completing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.completeButtonText}>
                  {allCompleted ? 'Complete Workout' : 'Complete All Exercises First'}
                </Text>
                {allCompleted && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={24}
                    color="#FFFFFF"
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  exerciseCardCompleted: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberCompleted: {
    backgroundColor: colors.success,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  exerciseNameCompleted: {
    color: colors.success,
  },
  exerciseDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
