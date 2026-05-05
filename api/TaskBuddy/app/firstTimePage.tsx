// app/onboarding.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './context/Theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboarding() {
  const { colors, updateUsername } = useTheme();
  const router = useRouter();
  
  const [nameInput, setNameInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('Studies');

  const goals = [
    { label: 'Studies', icon: 'book-outline' },
    { label: 'Workout', icon: 'fitness-outline' },
    { label: 'Work', icon: 'briefcase-outline' },
    { label: 'Project', icon: 'code-slash-outline' },
  ];

  const handleFinish = async () => {
    if (nameInput.trim().length < 2) return;
    
    // Save both to AsyncStorage
    await updateUsername(nameInput.trim());
    await AsyncStorage.setItem('user_goal', selectedGoal);
    
    // Move to Home Screen
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          
          <View style={styles.headerSection}>
            <Text style={[styles.welcome, { color: colors.primary }]}>Hello!</Text>
            <Text style={[styles.title, { color: colors.text }]}>Let's set up your TaskBuddy</Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>WHAT SHOULD WE CALL YOU?</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Your Name"
              placeholderTextColor={colors.subText}
              value={nameInput}
              onChangeText={setNameInput}
            />
          </View>

          {/* Goal Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.subText }]}>WHAT'S YOUR MAIN FOCUS?</Text>
            <View style={styles.goalGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.label}
                  style={[
                    styles.goalCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedGoal === goal.label && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedGoal(goal.label)}
                >
                  <Ionicons 
                    name={goal.icon as any} 
                    size={28} 
                    color={selectedGoal === goal.label ? colors.primary : colors.subText} 
                  />
                  <Text style={[styles.goalText, { color: colors.text }]}>{goal.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }, nameInput.length < 2 && { opacity: 0.5 }]}
            onPress={handleFinish}
            disabled={nameInput.length < 2}
          >
            <Text style={styles.startBtnText}>Start My Journey</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  headerSection: { marginBottom: 40 },
  welcome: { fontSize: 20, fontWeight: '700', marginBottom: 5 },
  title: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  inputGroup: { marginBottom: 35 },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 15, letterSpacing: 1 },
  input: { padding: 18, borderRadius: 16, fontSize: 18, borderWidth: 1 },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  goalCard: { width: '48%', padding: 20, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  goalText: { marginTop: 10, fontWeight: '600', fontSize: 15 },
  startBtn: { flexDirection: 'row', padding: 20, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 10 },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' }
});