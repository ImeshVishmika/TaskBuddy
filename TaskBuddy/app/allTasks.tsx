import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from './context/Theme'; // <--- 1. Import Theme Hook

// --- CONFIGURATION ---
const API_URL = Platform.OS === 'android'
  ? 'http://192.168.212.166:8080/api/tasks'
  : 'http://localhost:8080/api/tasks';

interface Priority {
  id: number;
  name: string;
  colorCode: string;
}

interface Status {
  id: number;
  name: string;
}

interface Task {
  id:number;
  title: string;
  type: string;
  status: Status;
  priority?: Priority;
  scheduleType: string;
  createdAt: string;
}

export default function AllTasks() {
  const router = useRouter();
  const { colors, theme } = useTheme(); // <--- 2. Get Colors

  // --- STATE ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // Default

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All'); // <--- NEW

  // --- FETCH DATA ---
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.reverse());
      }
    } catch (error) {
      console.error('Network Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  // --- DELETE FUNCTION ---
  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Task",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setTasks(prev => prev.filter(t => t.id !== id));
              await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            } catch (error) {
              Alert.alert("Error", "Could not delete task");
              fetchTasks();
            }
          }
        }
      ]
    );
  };

  // --- FILTER LOGIC ---
  const filteredTasks = tasks.filter(task => {

    const statusMatch = statusFilter === 'All' || task.status.name === statusFilter;
    const categoryMatch = categoryFilter === 'All' || task.type === categoryFilter;
    const priorityMatch = priorityFilter === 'All' || task.priority?.name === priorityFilter;

    return statusMatch && categoryMatch && priorityMatch;
  });

  const uniqueCategories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.type));
    return ['All', ...Array.from(cats)];
  }, [tasks]);

  // --- RENDER ITEM ---
  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} // Dynamic Card
      onPress={() => router.push({ pathname: '/taskDetails', params: { taskId: item.id } })}
      activeOpacity={0.7}
    >
      <View style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: item.priority?.name === 'High' ? colors.danger : item.priority?.name === 'Medium' ? '#FF9500' : colors.primary
      }} />
      <View style={styles.cardHeader}>
        <Text style={[
          styles.cardTitle,
          { color: colors.text }, // Dynamic Text
          item.status.name === 'Completed' && styles.completedTitle
        ]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[
          styles.statusBadge,
          item.status.name === 'Completed' ? styles.statusDone : styles.statusPending,
          { backgroundColor: item.status.name === 'Completed' ? '#1C1C1E' : '#FFF4CE' } // Optional Dark Mode tweak for badges
        ]}>
          <Text style={[
            styles.statusText,
            item.status.name === 'Completed' ? styles.statusTextDone : styles.statusTextPending
          ]}>
            {item.status.name}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.tagContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.typeTag, { color: colors.subText }]}>{item.type}</Text>
        </View>

        <View style={styles.metaContainer}>
          <Text style={[styles.dateText, { color: colors.subText }]}>{item.scheduleType}</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>All Tasks</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* 1. STATUS TABS */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              statusFilter === tab
                ? { backgroundColor: colors.text } // Active Tab matches Text Color (Black/White)
                : { backgroundColor: colors.background }
            ]}
            onPress={() => setStatusFilter(tab as any)}
          >
            <Text style={[
              styles.tabText,
              statusFilter === tab
                ? { color: colors.card } // Text becomes card color (inverse)
                : { color: colors.subText }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.categoryContainer, { backgroundColor: colors.background, paddingTop: 16 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {['All', 'High', 'Medium', 'Low'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.categoryChip,
                priorityFilter === p
                  ? { backgroundColor: colors.card, borderColor: p === 'High' ? colors.danger : p === 'Medium' ? '#FF9500' : colors.primary }
                  : { backgroundColor: colors.card, borderColor: 'transparent' }
              ]}
              onPress={() => setPriorityFilter(p)}
            >
              <Text style={[
                styles.categoryText,
                priorityFilter === p
                  ? { color: p === 'High' ? colors.danger : p === 'Medium' ? '#FF9500' : colors.primary }
                  : { color: colors.subText }
              ]}>
                {p} Priority
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      {/* 2. CATEGORY CHIPS */}
      <View style={[styles.categoryContainer, { backgroundColor: colors.background, paddingBottom: 8 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {uniqueCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                categoryFilter === cat
                  ? { backgroundColor: colors.card, borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: 'transparent' }
              ]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[
                styles.categoryText,
                categoryFilter === cat
                  ? { color: colors.primary }
                  : { color: colors.subText }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. PRIORITY CHIPS */}

      {/* LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.subText }]}>No tasks found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// --- STYLES (Layout Only - Colors handled in Component) ---
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  backButton: { padding: 4 },

  // Status Tabs
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4
  },
  tabText: { fontSize: 13, fontWeight: '600' },

  // Category Chips
  categoryContainer: {
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: { fontSize: 13, fontWeight: '600' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },

  // Card Styles
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  completedTitle: { color: '#8E8E93', textDecorationLine: 'line-through' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPending: { backgroundColor: '#FFF4CE' },
  statusDone: { backgroundColor: '#E1F9E7' },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statusTextPending: { color: '#F5A623' },
  statusTextDone: { color: '#34C759' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagContainer: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeTag: { fontSize: 12, fontWeight: '600' },

  metaContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateText: { fontSize: 12 },
  deleteBtn: { padding: 4 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
});