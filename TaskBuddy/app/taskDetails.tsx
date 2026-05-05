import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from './context/Theme'; // Ensure this path is correct

// API URL - Adjust for Android vs iOS
const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.212.166:8080/api/tasks' 
  : 'http://localhost:8080/api/tasks';

export default function TaskDetails() {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();
  const { colors, theme } = useTheme(); // <--- 1. Use Theme Hook

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Load Task Data ---
  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allTasks = await response.json();
      
      const targetId = Array.isArray(taskId) ? taskId[0] : taskId;
      const foundTask = allTasks.find((t: any) => String(t.id) === String(targetId));
      
      if (foundTask) {
        setTask(foundTask);
      } else {
        Alert.alert("Error", "Task not found");
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load task details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle Subtask ---
  const toggleSubTask = async (index: number) => {
    if (!task) return;
    const updatedTask = { ...task };
    updatedTask.subTasks[index].isCompleted = !updatedTask.subTasks[index].isCompleted;
    setTask(updatedTask);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update subtask - HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to save subtask update", error);
      Alert.alert("Error", "Failed to update subtask. Please try again.");
      // Revert the change
      fetchTaskDetails();
    }
  };

  // --- Toggle Main Status ---
  const toggleMainStatus = async () => {
    if (!task) return;
    setSaving(true);

    const newStatus = task.status.name === 'Completed' ? 'Pending' : 'Completed';
    const updatedTask = { ...task, status: { ...task.status, name: newStatus } };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });

      if (response.ok) {
        setTask(updatedTask);
        Alert.alert("Updated", `Task marked as ${newStatus}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    if (!task?.subTasks || task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter((s: any) => s.isCompleted).length;
    return completed / task.subTasks.length;
  };

  // Helper for Priority Colors
  const getPriorityColor = (pName: string) => {
    const name = pName?.trim();
    if (name === 'High') return '#FF3B30';
    if (name === 'Medium') return '#FF9500';
    if (name === 'Low') return '#007AFF';
    return colors.subText;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!task) return null;

  const progress = calculateProgress();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Details</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Title & Badge */}
        <View style={styles.titleSection}>
          <View style={[styles.badge, task.status.name === 'Completed' ? styles.badgeDone : styles.badgePending]}>
            <Text style={[styles.badgeText, task.status.name === 'Completed' ? styles.textDone : styles.textPending]}>
              {task.status.name}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          
          <View style={styles.metaRow}>
             <Ionicons name="calendar-outline" size={14} color={colors.subText} />
             <Text style={[styles.date, { color: colors.subText }]}>{task.scheduleType} • {task.type}</Text>
          </View>

          {/* Priority Indicator */}
          <View style={styles.priorityRow}>
            <Ionicons name="flag" size={14} color={getPriorityColor(task.priority?.name)} />
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority?.name) }]}>
              {task.priority?.name || 'No'} Priority
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {task.subTasks && task.subTasks.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.subText }]}>Progress</Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
        )}

        {/* Description */}
        {task.description ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>{task.description}</Text>
          </View>
        ) : null}

        {/* Subtasks List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Checklist</Text>
          {task.subTasks && task.subTasks.length > 0 ? (
            task.subTasks.map((sub: any, index: number) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.subtaskRow, { borderColor: colors.border }]} 
                onPress={() => toggleSubTask(index)}
                activeOpacity={0.6}
              >
                <Ionicons 
                  name={sub.isCompleted ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={sub.isCompleted ? colors.success : colors.subText} 
                />
                <Text style={[
                  styles.subtaskText, 
                  { color: colors.text },
                  sub.isCompleted && [styles.subtaskTextDone, { color: colors.subText }]
                ]}>
                  {sub.title}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.subText }]}>No subtasks added.</Text>
          )}
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.mainButton, 
            task.status.name === 'Completed' 
              ? [styles.buttonOutline, { borderColor: colors.primary }] 
              : [styles.buttonFilled, { backgroundColor: colors.primary }]
          ]}
          onPress={toggleMainStatus}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={task.status.name === 'Completed' ? colors.primary : "#FFF"} />
          ) : (
            <Text style={[
              styles.buttonText, 
              task.status.name === 'Completed' ? { color: colors.primary } : { color: "#FFF" }
            ]}>
              {task.status.name === 'Completed' ? "Mark as Pending" : "Complete Task"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  backButton: { padding: 4 },
  editButton: { padding: 4 },
  editText: { fontSize: 16, fontWeight: '500' },
  content: { padding: 24 },
  titleSection: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  date: { fontSize: 14, fontWeight: '500', marginLeft: 6 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  priorityText: { fontSize: 14, fontWeight: '700', marginLeft: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  badgePending: { backgroundColor: '#FFF4CE' },
  badgeDone: { backgroundColor: '#E1F9E7' },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  textPending: { color: '#F5A623' },
  textDone: { color: '#34C759' },
  progressSection: { marginBottom: 30 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressPercent: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  descriptionText: { fontSize: 16, lineHeight: 24 },
  emptyText: { fontStyle: 'italic' },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  subtaskText: { fontSize: 16, marginLeft: 12 },
  subtaskTextDone: { textDecorationLine: 'line-through' },
  footer: { padding: 24, borderTopWidth: 1 },
  mainButton: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  buttonFilled: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});