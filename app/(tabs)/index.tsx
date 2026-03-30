/**
 * Search Screen – the main screen of EasyDict
 *
 * Features:
 * - Premium search bar with voice input
 * - AI + Firebase word lookup
 * - Recent search history
 * - System dark/light adaptive
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ExpoSpeechRecognition from 'expo-speech-recognition';

import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/Typography';
import SearchBar from '@/components/SearchBar';
import WordCard from '@/components/WordCard';
import LoadingCard from '@/components/LoadingCard';
import { lookupWord, type WordData } from '@/services/wordService';
import { addRecentSearch, getRecentSearches } from '@/services/recentSearches';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

export default function SearchScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Load recent on mount
  React.useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    if (!GEMINI_KEY) {
      setError('Gemini API key missing. Please add it to your .env file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWordData(null);

    try {
      const data = await lookupWord(trimmed, GEMINI_KEY);
      setWordData(data);
      await addRecentSearch(trimmed);
      const updated = await getRecentSearches();
      setRecentSearches(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Voice Search ──────────────────────────────────────────────────────────
  const handleVoice = useCallback(async () => {
    if (isListening) {
      await ExpoSpeechRecognition.ExpoSpeechRecognitionModule.abort();
      setIsListening(false);
      return;
    }

    const { status } = await ExpoSpeechRecognition.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone needed', 'Please allow microphone access to use voice search.');
      return;
    }

    setIsListening(true);

    ExpoSpeechRecognition.ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      maxAlternatives: 1,
    });

    ExpoSpeechRecognition.ExpoSpeechRecognitionModule.addListener('result', (event) => {
      const recognized = event.results?.[0]?.transcript ?? '';
      if (recognized) {
        setQuery(recognized);
        handleSearch(recognized);
      }
      setIsListening(false);
    });

    ExpoSpeechRecognition.ExpoSpeechRecognitionModule.addListener('end', () => {
      setIsListening(false);
    });

    ExpoSpeechRecognition.ExpoSpeechRecognitionModule.addListener('error', () => {
      setIsListening(false);
    });
  }, [isListening, handleSearch]);

  const styles = makeStyles(theme, insets);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>EasyDict</Text>
            <Text style={styles.tagline}>Words made simple.</Text>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSearch={handleSearch}
            onVoice={handleVoice}
            isListening={isListening}
            isLoading={isLoading}
          />

          {/* Voice listening hint */}
          {isListening && (
            <Text style={styles.listeningHint}>🎙 Listening… speak the word clearly</Text>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color={theme.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading skeleton */}
          {isLoading && <LoadingCard />}

          {/* Result */}
          {!isLoading && wordData && <WordCard data={wordData} />}

          {/* Recent Searches */}
          {!isLoading && !wordData && recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <View style={styles.chipRow}>
                {recentSearches.slice(0, 10).map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={styles.chip}
                    onPress={() => {
                      setQuery(w);
                      handleSearch(w);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${w}`}
                  >
                    <Ionicons name="time-outline" size={13} color={theme.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.chipText}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Empty state */}
          {!isLoading && !wordData && recentSearches.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyTitle}>Look up any word</Text>
              <Text style={styles.emptyBody}>
                Type or speak any English word to get a super-simple explanation, an example sentence, and its Hindi translation.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: ReturnType<typeof useTheme>, insets: { top: number }) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      paddingTop: insets.top + 16,
      paddingBottom: 80,
    },
    header: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    appName: {
      fontSize: Typography.size['2xl'],
      fontWeight: '800',
      color: theme.accent,
      letterSpacing: Typography.letterSpacing.tight,
    },
    tagline: {
      fontSize: Typography.size.base,
      color: theme.textMuted,
      marginTop: 2,
    },
    listeningHint: {
      textAlign: 'center',
      color: theme.accent,
      fontSize: Typography.size.sm,
      marginTop: 10,
      fontStyle: 'italic',
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.error + '18',
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 16,
      marginTop: 12,
      gap: 10,
    },
    errorText: {
      flex: 1,
      fontSize: Typography.size.sm,
      color: theme.error,
      lineHeight: 20,
    },
    recentSection: {
      marginTop: 28,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: Typography.size.sm,
      fontWeight: '600',
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wider,
      marginBottom: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    chipText: {
      fontSize: Typography.size.sm,
      color: theme.text,
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 60,
    },
    emptyEmoji: {
      fontSize: 56,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: Typography.size.xl,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyBody: {
      fontSize: Typography.size.base,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.size.base * Typography.lineHeight.relaxed,
    },
  });
}
