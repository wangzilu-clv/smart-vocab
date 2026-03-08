import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { RootStackParamList, UserPreferences } from '../types';
import {
  getUserPreferences,
  saveUserPreferences,
  clearAllData,
  getMistakeWords,
} from '../utils/storage';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [appVersion, setAppVersion] = useState('2.0.0');

  useEffect(() => {
    loadPreferences();
    loadMistakeCount();
    // Get version from app.json via expo-constants
    const version = Constants.expoConfig?.version || Constants.manifest?.version || '2.0.0';
    setAppVersion(version);
  }, []);

  const loadPreferences = async () => {
    const prefs = await getUserPreferences();
    setPreferences(prefs);
  };

  const loadMistakeCount = async () => {
    const mistakeWords = await getMistakeWords();
    setMistakeCount(Object.keys(mistakeWords).length);
  };

  const handleUpdatePreferences = async (updates: Partial<UserPreferences>) => {
    if (preferences) {
      const updated = { ...preferences, ...updates };
      setPreferences(updated);
      await saveUserPreferences(updated);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '清除所有数据',
      '这将删除所有学习进度和记录，确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('已清除', '所有数据已重置');
            loadPreferences();
            loadMistakeCount();
          },
        },
      ]
    );
  };

  const handleNavigateToMistakeBook = () => {
    navigation.navigate('MistakeBook');
  };

  if (!preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>加载中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#667eea" />
          </View>
          <Text style={styles.username}>学习者</Text>
          <Text style={styles.subtitle}>坚持学习，每天进步</Text>
        </View>

        {/* Mistake Book Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习工具</Text>

          <TouchableOpacity
            style={styles.toolItem}
            onPress={handleNavigateToMistakeBook}
          >
            <View style={styles.toolInfo}>
              <Ionicons name="bookmark" size={22} color="#f44336" />
              <Text style={styles.toolLabel}>错词本</Text>
            </View>
            <View style={styles.toolRight}>
              {mistakeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{mistakeCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习设置</Text>

          {/* Daily Goal */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="flag" size={22} color="#667eea" />
              <Text style={styles.settingLabel}>每日目标</Text>
            </View>
            <View style={styles.goalOptions}>
              {[5, 10, 15, 20].map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalButton,
                    preferences.dailyGoal === goal && styles.goalButtonActive,
                  ]}
                  onPress={() => handleUpdatePreferences({ dailyGoal: goal })}
                >
                  <Text
                    style={[
                      styles.goalButtonText,
                      preferences.dailyGoal === goal &&
                        styles.goalButtonTextActive,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="barbell" size={22} color="#667eea" />
              <Text style={styles.settingLabel}>难度偏好</Text>
            </View>
            <View style={styles.goalOptions}>
              {['easy', 'mixed', 'medium', 'hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.goalButton,
                    preferences.difficulty === diff && styles.goalButtonActive,
                  ]}
                  onPress={() =>
                    handleUpdatePreferences({
                      difficulty: diff as UserPreferences['difficulty'],
                    })
                  }
                >
                  <Text
                    style={[
                      styles.goalButtonText,
                      preferences.difficulty === diff &&
                        styles.goalButtonTextActive,
                    ]}
                  >
                    {diff === 'easy'
                      ? '简单'
                      : diff === 'mixed'
                      ? '混合'
                      : diff === 'medium'
                      ? '中等'
                      : '困难'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="folder" size={22} color="#667eea" />
              <Text style={styles.settingLabel}>学习分类</Text>
            </View>
          </View>
          <View style={styles.categoriesContainer}>
            {['daily', 'academic', 'business', 'travel', 'technology'].map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    preferences.preferredCategories.includes(cat) &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    const cats = preferences.preferredCategories.includes(cat)
                      ? preferences.preferredCategories.filter((c) => c !== cat)
                      : [...preferences.preferredCategories, cat];
                    handleUpdatePreferences({ preferredCategories: cats });
                  }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      preferences.preferredCategories.includes(cat) &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {cat === 'daily'
                      ? '日常'
                      : cat === 'academic'
                      ? '学术'
                      : cat === 'business'
                      ? '商务'
                      : cat === 'travel'
                      ? '旅游'
                      : '科技'}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Notifications */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color="#667eea" />
              <Text style={styles.settingLabel}>学习提醒</Text>
            </View>
            <Switch
              value={preferences.notificationEnabled}
              onValueChange={(value) =>
                handleUpdatePreferences({ notificationEnabled: value })
              }
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={preferences.notificationEnabled ? '#667eea' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>

          <View style={styles.aboutItem}>
            <Ionicons name="information-circle" size={22} color="#666" />
            <Text style={styles.aboutText}>版本 {appVersion}</Text>
          </View>

          <TouchableOpacity style={styles.aboutItem}>
            <Ionicons name="star" size={22} color="#666" />
            <Text style={styles.aboutText}>评分应用</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem}>
            <Ionicons name="share" size={22} color="#666" />
            <Text style={styles.aboutText}>分享给朋友</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aboutItem, styles.dangerItem]}
            onPress={handleClearData}
          >
            <Ionicons name="trash" size={22} color="#f44336" />
            <Text style={styles.dangerText}>清除所有数据</Text>
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
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  toolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolLabel: {
    fontSize: 16,
    color: '#333',
  },
  toolRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  goalOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  goalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  goalButtonActive: {
    backgroundColor: '#667eea',
  },
  goalButtonText: {
    color: '#666',
    fontSize: 14,
  },
  goalButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -5,
    marginBottom: 15,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#333',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    fontSize: 16,
    color: '#f44336',
  },
});
