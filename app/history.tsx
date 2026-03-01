
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
import { LinearGradient } from 'expo-linear-gradient';
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
                <View style={[styles.statIconBadge, { backgroundColor: '#FFF0F7' }]}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={26}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.statValue}>{totalWorkoutsText}</Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBadge, { backgroundColor: '#FFF7ED' }]}>
                  <IconSymbol
                    ios_icon_name="flame.fill"
                    android_material_icon_name="local-fire-department"
                    size={26}
                    color="#F97316"
                  />
                </View>
                <Text style={styles.statValue}>{currentStreakText}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBadge, { backgroundColor: '#FFFBEB' }]}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={26}
                    color="#EAB308"
                  />
                </View>
                <Text style={styles.statValue}>{longestStreakText}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={26}
                    color={colors.success}
                  />
                </View>
                <Text style={styles.statValue}>{totalHoursText}h</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
            </View>
          )}

          {/* Motivational Message */}
          <LinearGradient
            colors={['#1A1A1A', '#2D2D2D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.motivationCard}
          >
            <Text style={styles.motivationText}>
              Every workout is a step forward. Keep showing up!
            </Text>
          </LinearGradient>

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
          <LinearGradient
            colors={['#D91B7C', '#A0145A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rewardsCountCard}
          >
            <IconSymbol
              ios_icon_name="trophy.fill"
              android_material_icon_name="emoji-events"
              size={44}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.rewardsCountNumber}>{rewards.length}</Text>
            <Text style={styles.rewardsCountLabel}>Rewards Earned</Text>
          </LinearGradient>

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
    backgroundColor: '#F7F7F9',
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
    gap: 12,
  },
  loadingText: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  motivationCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  motivationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  workoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  workoutDetailSeparator: {
    fontSize: 13,
    color: '#D0D0D0',
  },
  workoutDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 13,
  },
  tabActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  rewardsCountNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: -2,
  },
  rewardsCountLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trophyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardMessage: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
  },
  rewardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rewardDetailSeparator: {
    fontSize: 13,
    color: '#D0D0D0',
  },
});
