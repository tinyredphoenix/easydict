/**
 * SearchBar – premium animated search input with voice button
 */

import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/Typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (word: string) => void;
  onVoice: () => void;
  isListening: boolean;
  isLoading: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  onVoice,
  isListening,
  isLoading,
}: SearchBarProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // Pulse animation for mic when listening
  React.useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const styles = makeStyles(theme, focused);

  return (
    <View style={styles.container}>
      {/* Search icon */}
      <Ionicons
        name="search"
        size={20}
        color={focused ? theme.accent : theme.textMuted}
        style={styles.searchIcon}
      />

      {/* Text input */}
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => onSearch(value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search any word..."
        placeholderTextColor={theme.textMuted}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        accessibilityLabel="Word search input"
        accessibilityHint="Type a word to look up its meaning"
      />

      {/* Clear button */}
      {value.length > 0 && !isLoading && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            inputRef.current?.focus();
          }}
          style={styles.clearBtn}
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      )}

      {/* Voice button with pulse ring */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={onVoice}
          style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
          accessibilityLabel={isListening ? 'Stop listening' : 'Search by voice'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={20}
            color={isListening ? '#FFFFFF' : theme.accent}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, focused: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      marginHorizontal: 16,
      borderWidth: 1.5,
      borderColor: focused ? theme.accent : theme.border,
      ...Platform.select({
        ios: {
          shadowColor: focused ? theme.accent : theme.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: focused ? 0.18 : 0.07,
          shadowRadius: 12,
        },
        android: {
          elevation: focused ? 6 : 2,
        },
      }),
    },
    searchIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: Typography.size.md,
      color: theme.text,
      padding: 0,
    },
    clearBtn: {
      padding: 4,
      marginRight: 4,
    },
    voiceBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    voiceBtnActive: {
      backgroundColor: theme.accent,
    },
  });
}
