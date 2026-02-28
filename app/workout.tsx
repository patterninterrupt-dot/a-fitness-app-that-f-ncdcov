
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
import { WebView } from 'react-native-webview';
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
  reps?: string | null;
  sets?: string | null;
  duration?: string | null;
  videoUrl?: string | null;
  estimatedMinutes?: number;
}

interface WorkoutResponse {
  exercises: Exercise[];
  totalEstimatedMinutes: number;
  rounds?: number;
}

function getEmbedUrl(videoUrl: string): string {
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?playsinline=1&rel=0&autoplay=1`;
  }
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return videoUrl;
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default function WorkoutScreen() {
  console.log('WorkoutScreen: Rendering workout screen');
  
  const params = useLocalSearchParams();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalEstimatedMinutes, setTotalEstimatedMinutes] = useState<number>(0);
  const [rounds, setRounds] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [videoModal, setVideoModal] = useState<{ visible: boolean; exercise: Exercise | null }>({ visible: false, exercise: null });

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
      const raw = await apiGet<WorkoutResponse | Exercise[]>(`/api/exercises/${workoutType}/${workoutCategory}/${workoutDuration}`);

      // Handle both new format { exercises, totalEstimatedMinutes, rounds }
      // and legacy format (plain array) for backward compatibility
      let exerciseList: Exercise[];
      let totalMinutes: number;
      let roundsCount: number | undefined;

      if (Array.isArray(raw)) {
        // Legacy format: plain array of exercises
        console.log('WorkoutScreen: Received legacy array format, adapting to new format');
        exerciseList = raw as Exercise[];
        // Estimate total time based on workout type and duration param
        totalMinutes = parseInt(workoutDuration, 10);
        roundsCount = undefined;
      } else {
        // New format: { exercises, totalEstimatedMinutes, rounds }
        const data = raw as WorkoutResponse;
        exerciseList = data.exercises;
        totalMinutes = data.totalEstimatedMinutes;
        roundsCount = data.rounds;
      }

      setExercises(exerciseList);
      setTotalEstimatedMinutes(totalMinutes);
      setRounds(roundsCount);
      console.log('WorkoutScreen: Loaded exercises', {
        count: exerciseList.length,
        totalMinutes,
        rounds: roundsCount,
      });
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

      {/* Video Modal */}
      <Modal
        visible={videoModal.visible}
        animationType="slide"
        onRequestClose={() => setVideoModal({ visible: false, exercise: null })}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000', paddingTop: Platform.OS === 'android' ? 48 : 0 }}>
          <View style={styles.videoModalHeader}>
            <Text style={styles.videoModalTitle} numberOfLines={1}>
              {videoModal.exercise?.name || ''}
            </Text>
            <TouchableOpacity
              onPress={() => {
                console.log('User closed video modal');
                setVideoModal({ visible: false, exercise: null });
              }}
              style={styles.videoModalClose}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          {videoModal.exercise?.videoUrl && (
            isDirectVideoUrl(videoModal.exercise.videoUrl) ? (
              <WebView
                source={{
                  html: `<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
                    <video src="${videoModal.exercise.videoUrl}" controls autoplay playsinline style="width:100%;max-height:100vh;" />
                  </body></html>`,
                }}
                style={{ flex: 1, backgroundColor: '#000' }}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                allowsFullscreenVideo
              />
            ) : (
              <WebView
                source={{
                  html: `<!DOCTYPE html><html><body style="margin:0;background:#000;position:relative;height:100vh;">
                    <iframe src="${getEmbedUrl(videoModal.exercise.videoUrl)}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
                  </body></html>`,
                }}
                style={{ flex: 1, backgroundColor: '#000' }}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                allowsFullscreenVideo
              />
            )
          )}
        </SafeAreaView>
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

          {/* Timing Info */}
          {totalEstimatedMinutes > 0 && (
            <View style={styles.timingCard}>
              <Text style={styles.timingTitle}>Workout Duration</Text>
              <Text style={styles.timingValue}>~{totalEstimatedMinutes} minutes</Text>
              {rounds && rounds > 1 && (
                <Text style={styles.timingRounds}>Complete {rounds} rounds of the circuit</Text>
              )}
            </View>
          )}

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
            const hasVideo = !!exercise.videoUrl;
            const estimatedTime = exercise.estimatedMinutes
              ? `~${exercise.estimatedMinutes} min`
              : '';
            
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
                      {exerciseInfo ? <Text style={styles.exerciseDetail}>{exerciseInfo}</Text> : null}
                      {estimatedTime ? <Text style={styles.exerciseTime}>{estimatedTime}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.exerciseActions}>
                    {hasVideo && (
                      <TouchableOpacity
                        style={styles.videoButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          console.log('User tapped Watch Video for exercise:', exercise.name);
                          setVideoModal({ visible: true, exercise });
                        }}
                      >
                        <IconSymbol
                          ios_icon_name="play.circle.fill"
                          android_material_icon_name="play-circle-filled"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.videoButtonText}>Watch</Text>
                      </TouchableOpacity>
                    )}
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
  timingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  timingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  timingRounds: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
  exerciseTime: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
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
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  videoButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
  },
  videoModalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
  },
  videoModalClose: {
    padding: 4,
  },
});
