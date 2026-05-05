import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/Theme'; // <--- IMPORT THIS

// API URL
import { Platform } from 'react-native';
const API_URL = Platform.OS === 'android' ? 'http://192.168.114.166:8080/api/tasks' : 'http://localhost:8080/api/tasks';

interface Status {
  id: number;
  name: string;
}

interface Task {
  // ... other fields
  status: Status; // Now an object!
}

interface Task {
  id: number;
  title: string;
  type: string;
  status: Status;
  scheduleType: string;
}

export default function Index() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme(); // <--- USE THEME
  
  const [username, setUsername] = useState('Developer');
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const storedName = await AsyncStorage.getItem('user_name');
      if (storedName) setUsername(storedName);

      const response = await fetch(`${API_URL}?_t=${Date.now()}`);
      if (response.ok) {
        const allTasks: Task[] = await response.json();
        const pendingTasks = allTasks.filter(t => t.status.name !== 'Completed');
        setRecentTasks(pendingTasks.reverse().slice(0, 3));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  // --- Dynamic Styles ---
  const dynamicStyles = {
    container: { flex: 1, backgroundColor: colors.background },
    text: { color: colors.text },
    subText: { color: colors.subText },
    card: { backgroundColor: colors.card, borderColor: colors.border },
    sectionTitle: { color: colors.text },
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[styles.card, dynamicStyles.card]}
      onPress={() => router.push({ pathname: '/taskDetails', params: { taskId: item.id } })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, dynamicStyles.text]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.name }</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={[styles.tagContainer, { backgroundColor: colors.border }]}>
          <Text style={[styles.typeTag, { color: colors.text }]}>{item.type}</Text>
        </View>
        <Text style={dynamicStyles.subText}>{item.scheduleType}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={dynamicStyles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingText, dynamicStyles.subText]}>Greetings,</Text>
          <Text style={[styles.usernameText, dynamicStyles.text]}>{username}</Text>
        </View>
        
        {/* Dark Mode Toggle */}
        <TouchableOpacity 
          onPress={toggleTheme} 
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons 
            name={theme === 'light' ? 'moon' : 'sunny'} 
            size={22} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryBtn]} 
          onPress={() => router.push('/addNewTask')}
        >
          <Text style={styles.primaryBtnText}>⚔️ Deploy Mission</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]} 
          onPress={() => router.push('/allTasks')}
        >
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>📜 All Edicts </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, dynamicStyles.text]}>{recentTasks.length}</Text>
          <Text style={styles.statLabel}>🎯 Current Objectives</Text>
        </View>
      </View>

      {/* List */}
      <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Today's Conquests</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={recentTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, dynamicStyles.subText]}>No pending tasks.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Fixed Styles (Structure)
const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  greetingText: { fontSize: 16, marginBottom: 4, fontWeight: '500' },
  usernameText: { fontSize: 26, fontWeight: '800' },
  themeBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  actionContainer: { flexDirection: 'row', paddingHorizontal: 24, justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { flex: 0.48, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.1, shadowRadius: 5 },
  primaryBtn: { backgroundColor: '#007AFF' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  statsContainer: { paddingHorizontal: 24, marginBottom: 24 },
  statCard: { padding: 16, borderRadius: 16, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },

  listContainer: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 30, paddingHorizontal: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  listContent: { paddingBottom: 40 },
  
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagContainer: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeTag: { fontSize: 12, fontWeight: '600' },
  statusBadge: { backgroundColor: '#FFF4CE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#F5A623', textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});