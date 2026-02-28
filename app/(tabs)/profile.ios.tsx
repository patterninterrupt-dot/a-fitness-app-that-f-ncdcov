
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol.ios';
import { apiGet } from '@/utils/api';

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
}

type FilterType = 'all' | 'home' | 'gym';
type FilterCategory = 'all' | 'upper' | 'lower' | 'conditioning';

function getEmbedUrl(videoUrl: string): string {
  // YouTube
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?playsinline=1&rel=0`;
  }
  // Vimeo
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Direct video URL - wrap in simple HTML
  return videoUrl;
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function VideoPlayer({ videoUrl, exerciseName, onClose }: { videoUrl: string; exerciseName: string; onClose: () => void }) {
  const embedUrl = getEmbedUrl(videoUrl);
  const isDirect = isDirectVideoUrl(videoUrl);

  const htmlContent = isDirect
    ? `<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
        <video src="${videoUrl}" controls autoplay playsinline style="width:100%;max-height:100vh;" />
      </body></html>`
    : `<!DOCTYPE html><html><body style="margin:0;background:#000;">
        <iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
      </body></html>`;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'bottom']}>
        <View style={videoStyles.videoHeader}>
          <Text style={videoStyles.videoTitle} numberOfLines={1}>{exerciseName}</Text>
          <TouchableOpacity onPress={onClose} style={videoStyles.closeButton}>
            <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: '#000' }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          allowsFullscreenVideo
        />
      </SafeAreaView>
    </Modal>
  );
}

const videoStyles = StyleSheet.create({
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
});

export default function ProfileScreen() {
  console.log('ProfileScreen (iOS): Rendering exercise library');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [videoModal, setVideoModal] = useState<{ visible: boolean; exercise: Exercise | null }>({ visible: false, exercise: null });

  useEffect(() => {
    console.log('ProfileScreen (iOS): Loading exercise library');
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      console.log('[API] Requesting GET /api/exercises');
      const data = await apiGet<Exercise[]>('/api/exercises');
      setExercises(data);
      console.log('ProfileScreen (iOS): Loaded exercises', data.length);
    } catch (error) {
      console.error('ProfileScreen (iOS): Error loading exercises', error);
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {videoModal.visible && videoModal.exercise?.videoUrl && (
        <VideoPlayer
          videoUrl={videoModal.exercise.videoUrl}
          exerciseName={videoModal.exercise.name}
          onClose={() => setVideoModal({ visible: false, exercise: null })}
        />
      )}
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
            const hasVideo = !!exercise.videoUrl;
            
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
                  {hasVideo && (
                    <TouchableOpacity
                      style={styles.videoButton}
                      onPress={() => {
                        console.log('User tapped Watch Video for exercise:', exercise.name);
                        setVideoModal({ visible: true, exercise });
                      }}
                    >
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle-filled"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.videoButtonText}>Watch</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                {detailText ? <Text style={styles.exerciseDetail}>{detailText}</Text> : null}
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
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  videoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
