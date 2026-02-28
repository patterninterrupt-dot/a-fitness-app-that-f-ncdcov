
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
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { authenticatedGet } from '@/utils/api';

interface Workout {
  id: string;
  type: string;
  duration: number;
  category: string;
  completedAt: string;
}

interface Stats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
}

interface Reward {
  id: string;
  message: string;
  earnedAt: string;
  workout: {
    type: string;
    duration: number;
    category: string;
  };
}

type ActiveTab = 'history' | 'rewards';

export default function HistoryScreen() {
  console.log('HistoryScreen: Rendering history screen');
  
  const params = useLocalSearchParams();
  const initialTab: ActiveTab = params.tab === 'rewards' ? 'rewards' : 'history';
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  useEffect(() => {
    console.log('HistoryScreen: Loading workout history and rewards');
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      console.log('[API] Requesting GET /api/workouts, GET /api/stats, GET /api/rewards');
      
      const [workoutsData, statsData, rewardsData] = await Promise.all([
        authenticatedGet<Workout[]>('/api/workouts'),
        authenticatedGet<Stats>('/api/stats'),
        authenticatedGet<Reward[]>('/api/rewards'),
      ]);
      
      setWorkouts(workoutsData);
      setStats(statsData);
      setRewards(rewardsData);
      console.log('HistoryScreen: Loaded history', {
        workouts: workoutsData.length,
        stats: statsData,
        rewards: rewardsData.length,
      });
    } catch (error) {
      console.error('HistoryScreen: Error loading history', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) {
      const formattedDate = 'Today';
      return formattedDate;
    }
    if (diffDays === 1) {
      const formattedDate = 'Yesterday';
      return formattedDate;
    }
    const formattedDate = `${diffDays} days ago`;
    return formattedDate;
  };

  const totalWorkoutsText = stats ? stats.totalWorkouts.toString() : '0';
  const currentStreakText = stats ? stats.currentStreak.toString() : '0';
  const longestStreakText = stats ? stats.longestStreak.toString() : '0';
  const totalHoursText = stats ? Math.floor(stats.totalMinutes / 60).toString() : '0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: activeTab === 'history' ? 'Workout History' : 'My Rewards',
          headerBackTitle: 'Back',
        }}
      />
      
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <IconSymbol
            ios_icon_name="clock.fill"
            android_material_icon_name="history"
            size={18}
            color={activeTab === 'history' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
          onPress={() => setActiveTab('rewards')}
        >
          <IconSymbol
            ios_icon_name="trophy.fill"
            android_material_icon_name="emoji-events"
            size={18}
            color={activeTab === 'rewards' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}>
            Rewards
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : activeTab === 'history' ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Stats Grid */}
          {stats && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.statValue}>{totalWorkoutsText}</Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="flame.fill"
                  android_material_icon_name="local-fire-department"
                  size={32}
                  color={colors.secondary}
                />
                <Text style={styles.statValue}>{currentStreakText}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={32}
                  color={colors.accent}
                />
                <Text style={styles.statValue}>{longestStreakText}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>

              <View style={styles.statCard}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="schedule"
                  size={32}
                  color={colors.success}
                />
                <Text style={styles.statValue}>{totalHoursText}h</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
            </View>
          )}

          {/* Motivational Message */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              Every workout is a step forward. Keep showing up!
            </Text>
          </View>

          {/* Workout History */}
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="figure.strengthtraining.traditional"
                android_material_icon_name="fitness-center"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>Complete your first workout to start tracking!</Text>
            </View>
          ) : (
            workouts.map((workout) => {
              const typeText = workout.type === 'home' ? 'Home' : 'Gym';
              const categoryText = workout.category === 'upper' ? 'Upper Body' : workout.category === 'lower' ? 'Lower Body' : 'Conditioning';
              const durationText = `${workout.duration} min`;
              const dateText = formatDate(workout.completedAt);
              
              return (
                <View key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutIcon}>
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutTitle}>{categoryText}</Text>
                      <View style={styles.workoutDetails}>
                        <Text style={styles.workoutDetail}>{typeText}</Text>
                        <Text style={styles.workoutDetailSeparator}>•</Text>
                        <Text style={styles.workoutDetail}>{durationText}</Text>
                      </View>
                    </View>
                    <Text style={styles.workoutDate}>{dateText}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Rewards Count */}
          <View style={styles.rewardsCountCard}>
            <IconSymbol
              ios_icon_name="trophy.fill"
              android_material_icon_name="emoji-events"
              size={40}
              color={colors.accent}
            />
            <Text style={styles.rewardsCountNumber}>{rewards.length}</Text>
            <Text style={styles.rewardsCountLabel}>Rewards Earned</Text>
          </View>

          {/* Rewards List */}
          {rewards.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="trophy"
                android_material_icon_name="emoji-events"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>No rewards yet</Text>
              <Text style={styles.emptySubtext}>Complete your first workout to earn a reward!</Text>
            </View>
          ) : (
            rewards.map((reward) => {
              const typeText = reward.workout.type === 'home' ? 'Home' : 'Gym';
              const categoryText = reward.workout.category === 'upper' ? 'Upper Body' : reward.workout.category === 'lower' ? 'Lower Body' : 'Conditioning';
              const durationText = `${reward.workout.duration} min`;
              const dateText = formatDate(reward.earnedAt);

              return (
                <View key={reward.id} style={styles.rewardCard}>
                  <View style={styles.rewardHeader}>
                    <View style={styles.trophyIcon}>
                      <IconSymbol
                        ios_icon_name="trophy.fill"
                        android_material_icon_name="emoji-events"
                        size={22}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardMessage}>{reward.message}</Text>
                      <View style={styles.rewardDetails}>
                        <Text style={styles.rewardDetail}>{typeText}</Text>
                        <Text style={styles.rewardDetailSeparator}>•</Text>
                        <Text style={styles.rewardDetail}>{categoryText}</Text>
                        <Text style={styles.rewardDetailSeparator}>•</Text>
                        <Text style={styles.rewardDetail}>{durationText}</Text>
                      </View>
                    </View>
                    <Text style={styles.workoutDate}>{dateText}</Text>
                  </View>
                </View>
              );
            })
          )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workoutDetailSeparator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workoutDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  rewardsCountCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardsCountNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  rewardsCountLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  rewardCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  rewardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardDetail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rewardDetailSeparator: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
