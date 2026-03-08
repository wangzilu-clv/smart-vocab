import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { LearningProgress } from '../types';
import { getLearningProgress } from '../utils/storage';
import { recommendationEngine } from '../utils/recommendation';
import { StatCard } from '../components/StatCard';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [recommendCount, setRecommendCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const prog = await getLearningProgress();
    setProgress(prog);

    const reviewWords = await recommendationEngine.getReviewWords();
    setReviewCount(reviewWords.length);

    const recommendations = await recommendationEngine.getRecommendations(10);
    setRecommendCount(recommendations.length);
  }, []);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const isGoalCompleted = (progress?.todayLearned || 0) >= (progress?.dailyGoal || 10);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>SmartVocab</Text>
          <Text style={styles.headerSubtitle}>智能背单词</Text>
          
          {progress && (
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={24} color="#ff9800" />
              <Text style={styles.streakText}>
                {progress.streakDays} 天连续学习
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="已学单词"
              value={progress?.learnedWords || 0}
              icon="book"
              color="#4caf50"
            />
            <StatCard
              title="今日目标"
              value={`${progress?.todayLearned || 0}/${progress?.dailyGoal || 10}`}
              icon="today"
              color="#2196f3"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="待复习"
              value={reviewCount}
              icon="refresh"
              color="#ff9800"
            />
            <StatCard
              title="新词推荐"
              value={recommendCount}
              icon="bulb"
              color="#9c27b0"
            />
          </View>
        </View>

        {/* Daily Goal Status */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Ionicons
              name={isGoalCompleted ? 'checkmark-circle' : 'time'}
              size={28}
              color={isGoalCompleted ? '#4caf50' : '#ff9800'}
            />
            <Text style={styles.goalTitle}>
              {isGoalCompleted ? '今日目标已完成！' : '继续加油，完成今日目标'}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    ((progress?.todayLearned || 0) / (progress?.dailyGoal || 10)) * 100
                  )}%`,
                  backgroundColor: isGoalCompleted ? '#4caf50' : '#667eea',
                },
              ]}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {reviewCount > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => navigation.navigate('Study', { mode: 'review' })}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>开始复习</Text>
                <Text style={styles.actionSubtitle}>{reviewCount} 个单词待复习</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.learnButton]}
            onPress={() => navigation.navigate('Study', { mode: 'learn' })}
          >
            <Ionicons name="school" size={24} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>学习新词</Text>
              <Text style={styles.actionSubtitle}>智能推荐新单词</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  streakText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  goalCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  reviewButton: {
    backgroundColor: '#ff9800',
  },
  learnButton: {
    backgroundColor: '#667eea',
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
