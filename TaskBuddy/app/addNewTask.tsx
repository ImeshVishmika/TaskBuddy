import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/Theme'; // Ensure this path is correct

// API URL
const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.212.166:8080/api/tasks' 
  : 'http://localhost:8080/api/tasks';

export default function AddTask() {
  const router = useRouter();
  const { colors, theme } = useTheme(); // <--- 1. Use Theme Hook

  // --- State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('Today');
  const [priority, setPriority] = useState('Medium'); 

  const [categories, setCategories] = useState(['Study', 'Workout', 'Project', 'Other']);
  const [type, setType] = useState('Study');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');

  const [subTasks, setSubTasks] = useState<{ title: string; isCompleted: boolean }[]>([]);
  const [currentSubTask, setCurrentSubTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Functions ---
  const handleAddCategory = () => {
    if (newCategoryText.trim().length === 0) {
      setIsAddingCategory(false);
      return;
    }
    setCategories([...categories, newCategoryText.trim()]);
    setType(newCategoryText.trim());
    setNewCategoryText('');
    setIsAddingCategory(false);
  };

  const addSubTask = () => {
    if (currentSubTask.trim().length === 0) return;
    setSubTasks([...subTasks, { title: currentSubTask, isCompleted: false }]);
    setCurrentSubTask('');
  };

  const removeSubTask = (index: number) => {
    const updated = [...subTasks];
    updated.splice(index, 1);
    setSubTasks(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    setIsSubmitting(true);
    const newTask = {
      title,
      description,
      priorityId: priority === 'High' ? 1 : priority === 'Medium' ? 2 : 3,
      type,
      scheduleType: schedule,
      statusId: 1, 
      createdAt: new Date().toISOString(),
      subTasks
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        Alert.alert("Success", "Task saved!");
        router.back();
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>Task Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Complete Project"
              placeholderTextColor={colors.subText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>Category</Text>
            <View style={styles.chipContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { backgroundColor: colors.border }, type === cat && { backgroundColor: colors.primary }]}
                  onPress={() => setType(cat)}
                >
                  <Text style={[styles.chipText, { color: colors.text }, type === cat && { color: '#FFF' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}

              {isAddingCategory ? (
                <View style={[styles.chip, styles.newCatInputContainer, { borderColor: colors.primary, backgroundColor: colors.card }]}>
                  <TextInput
                    style={[styles.newCatInput, { color: colors.text }]}
                    placeholder="Name..."
                    placeholderTextColor={colors.subText}
                    autoFocus
                    value={newCategoryText}
                    onChangeText={setNewCategoryText}
                    onSubmitEditing={handleAddCategory}
                    onBlur={handleAddCategory}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.chip, styles.addCatButton, { backgroundColor: colors.statusBadge }]}
                  onPress={() => setIsAddingCategory(true)}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>Schedule</Text>
            <View style={styles.chipContainer}>
              {['Today', 'Tomorrow', 'Recurring'].map((sch) => (
                <TouchableOpacity
                  key={sch}
                  style={[styles.chip, { backgroundColor: colors.border }, schedule === sch && { backgroundColor: colors.primary }]}
                  onPress={() => setSchedule(sch)}
                >
                  <Text style={[styles.chipText, { color: colors.text }, schedule === sch && { color: '#FFF' }]}>{sch}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>Priority</Text>
            <View style={styles.chipContainer}>
              {['High', 'Medium', 'Low'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.border },
                    priority === p && { backgroundColor: p === 'High' ? '#FF3B30' : p === 'Medium' ? '#FF9500' : '#007AFF' }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.chipText, { color: colors.text }, priority === p && { color: '#FFF' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subtasks */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>Subtasks ({subTasks.length})</Text>
            {subTasks.map((sub, index) => (
              <View key={index} style={[styles.subtaskItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="checkbox-outline" size={20} color={colors.subText} />
                <Text style={[styles.subtaskText, { color: colors.text }]}>{sub.title}</Text>
                <TouchableOpacity onPress={() => removeSubTask(index)}>
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addSubtaskContainer}>
              <TextInput
                style={[styles.subtaskInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Add a step..."
                placeholderTextColor={colors.subText}
                value={currentSubTask}
                onChangeText={setCurrentSubTask}
                onSubmitEditing={addSubTask}
              />
              <TouchableOpacity onPress={addSubTask} style={[styles.addButton, { backgroundColor: colors.statusBadge }]}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Notes..."
              placeholderTextColor={colors.subText}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }, isSubmitting && { backgroundColor: colors.subText }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Create Task</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  backButton: { padding: 8 },
  content: { padding: 24, paddingBottom: 100 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontWeight: '500' },
  addCatButton: { width: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 0 },
  newCatInputContainer: { paddingVertical: 0, paddingHorizontal: 10, borderWidth: 1, minWidth: 100 },
  newCatInput: { fontSize: 14, height: 36 },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  subtaskText: { flex: 1, marginLeft: 10, fontSize: 15 },
  addSubtaskContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  subtaskInput: { flex: 1, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, marginRight: 8 },
  addButton: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 24, borderTopWidth: 1 },
  saveButton: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});