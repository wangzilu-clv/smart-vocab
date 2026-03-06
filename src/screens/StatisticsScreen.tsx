import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LearningProgress, StudyRecord } from '../types';
import { getLearningProgress, getStudyRecords } from '../utils/storage';
import { StatCard } from '../components/StatCard';

const { width } = Dimensions.get('window');

// 简单的柱状图组件
const SimpleBarChart: React.FC<{ data: number[]; labels: string[] }> = ({
  data,
  labels,
}) => {
  const maxValue = Math.max(...data, 1);
  const barWidth = (width - 100) / data.length;

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.barsContainer}>
        {data.map((value, index) => (
          <View key={index} style={chartStyles.barWrapper}>
            <View
              style={[
                chartStyles.bar,
                {
                  height: `${(value / maxValue) * 100}%`,
                  width: barWidth - 10,
                },
              ]}
            />
            <Text style={chartStyles.barValue}>{value > 0 ? value : ''}</Text>
          </View>
        ))}
      </View>
      <View style={chartStyles.labelsContainer}>
        {labels.map((label, index) => (
          <Text key={index} style={[chartStyles.label, { width: barWidth }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 5,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#667eea',
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#667eea',
    marginTop: 2,
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});

export const StatisticsScreen: React.FC = () => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [records, setRecords] = useState<StudyRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const prog = await getLearningProgress();
    const recs = await getStudyRecords();
    setProgress(prog);
    setRecords(recs.slice(-7));
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getChartData = () => {
    const last7Days = getLast7Days();
    const data = last7Days.map((day) => {
      const record = records.find((r) => r.date === day);
      return record ? record.wordsLearned : 0;
    });
    const labels = last7Days.map((d) => d.slice(5));
    return { data, labels };
  };

  const getTotalStudyDays = () => records.length;

  const getAverageDaily = () => {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, r) => sum + r.wordsLearned, 0);
    return Math.round(total / records.length);
  };

  const getCompletionRate = () => {
    if (records.length === 0) return 0;
    const completedDays = records.filter(
      (r) => r.wordsLearned >= (progress?.dailyGoal || 10)
    ).length;
    return Math.round((completedDays / records.length) * 100);
  };

  const { data, labels } = getChartData();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>学习统计</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="学习天数"
              value={getTotalStudyDays()}
              icon="calendar"
              color="#2196f3"
            />
            <StatCard
              title="日均学习"
              value={getAverageDaily()}
              icon="trending-up"
              color="#4caf50"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="目标完成率"
              value={`${getCompletionRate()}%`}
              icon="checkbox"
              color="#ff9800"
            />
            <StatCard
              title="总学习时长"
              value={`${Math.round((progress?.studyTimeMinutes || 0) / 60)}h`}
              icon="time"
              color="#9c27b0"
            />
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={24} color="#667eea" />
            <Text style={styles.chartTitle}>近7天学习趋势</Text>
          </View>

          {records.length > 0 ? (
            <SimpleBarChart data={data} labels={labels} />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>暂无学习数据</Text>
            </View>
          )}
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>学习成就</Text>

          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View
                style={[
                  styles.achievementIcon,
                  (progress?.streakDays || 0) >= 7 && styles.achievementUnlocked,
                ]}
              >
                <Ionicons name="flame" size={24} color="#ff9800" />
              </View>
              <View>
                <Text style={styles.achievementName}>连续7天</Text>
                <Text style={styles.achievementDesc}>连续学习7天</Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[
                  styles.achievementIcon,
                  (progress?.learnedWords || 0) >= 100 &&
                    styles.achievementUnlocked,
                ]}
              >
                <Ionicons name="book" size={24} color="#4caf50" />
              </View>
              <View>
                <Text style={styles.achievementName}>词汇达人</Text>
                <Text style={styles.achievementDesc}>学习100个单词</Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View
                style={[
                  styles.achievementIcon,
                  (progress?.streakDays || 0) >= 30 &&
                    styles.achievementUnlocked,
                ]}
              >
                <Ionicons name="trophy" size={24} color="#9c27b0" />
              </View>
              <View>
                <Text style={styles.achievementName}>学习大师</Text>
                <Text style={styles.achievementDesc}>连续学习30天</Text>
              </View>
            </View>
          </View>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chartCard: {
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
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  achievementCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  achievementsList: {
    gap: 15,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementUnlocked: {
    backgroundColor: '#e3f2fd',
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementDesc: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
});
