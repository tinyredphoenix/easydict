/**
 * WordCard – the main result card shown after a word is searched.
 * Displays: ELI5 meaning, example sentence, Hindi translation, phonetic, speech button.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/Typography';
import type { WordData } from '@/services/wordService';

interface WordCardProps {
  data: WordData;
}

export default function WordCard({ data }: WordCardProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [data.word]);

  const handleSpeak = () => {
    Speech.speak(data.word, {
      language: 'en-US',
      rate: 0.85,
      pitch: 1.0,
    });
  };

  const styles = makeStyles(theme);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Word header */}
      <View style={styles.header}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{data.word}</Text>
          <TouchableOpacity
            onPress={handleSpeak}
            style={styles.speakBtn}
            accessibilityLabel="Pronounce word"
            accessibilityRole="button"
          >
            <Ionicons name="volume-medium" size={22} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          {data.partOfSpeech ? (
            <View style={styles.posTag}>
              <Text style={styles.posText}>{data.partOfSpeech}</Text>
            </View>
          ) : null}
          {data.phonetic ? (
            <Text style={styles.phonetic}>/{data.phonetic}/</Text>
          ) : null}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* ELI5 Meaning */}
      <Section icon="bulb-outline" label="Simple Meaning" iconColor={theme.accent} theme={theme}>
        <Text style={styles.bodyText}>{data.eli5}</Text>
      </Section>

      {/* Example Sentence */}
      <Section icon="chatbubble-ellipses-outline" label="Example" iconColor="#22C55E" theme={theme}>
        <Text style={[styles.bodyText, styles.italic]}>"{data.exampleSentence}"</Text>
      </Section>

      {/* Hindi Translation */}
      <Section icon="language-outline" label="Hindi" iconColor="#F59E0B" theme={theme}>
        <Text style={[styles.bodyText, styles.hindi]}>{data.hindiTranslation}</Text>
      </Section>

      {/* Cache badge */}
      {data.fromCache && (
        <View style={styles.cacheBadge}>
          <Ionicons name="flash" size={11} color={theme.textMuted} />
          <Text style={styles.cacheText}>Loaded instantly</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  iconColor: string;
  theme: ReturnType<typeof useTheme>;
  children: React.ReactNode;
}

function Section({ icon, label, iconColor, theme, children }: SectionProps) {
  const styles = makeStyles(theme);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconDot, { backgroundColor: iconColor + '22' }]}>
          <Ionicons name={icon} size={15} color={iconColor} />
        </View>
        <Text style={styles.sectionLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 24,
      marginHorizontal: 16,
      marginTop: 12,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    header: {
      marginBottom: 16,
    },
    wordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    word: {
      fontSize: Typography.size['3xl'],
      fontWeight: '700',
      color: theme.text,
      letterSpacing: Typography.letterSpacing.tight,
      flex: 1,
    },
    speakBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 10,
    },
    posTag: {
      backgroundColor: theme.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    posText: {
      fontSize: Typography.size.xs,
      fontWeight: '600',
      color: theme.accent,
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wider,
    },
    phonetic: {
      fontSize: Typography.size.base,
      color: theme.textMuted,
      fontStyle: 'italic',
    },
    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginBottom: 20,
    },
    section: {
      marginBottom: 18,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    iconDot: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: Typography.size.sm,
      fontWeight: '600',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: Typography.letterSpacing.wider,
    },
    bodyText: {
      fontSize: Typography.size.md,
      color: theme.text,
      lineHeight: Typography.size.md * Typography.lineHeight.relaxed,
    },
    italic: {
      fontStyle: 'italic',
      color: theme.textSecondary,
    },
    hindi: {
      fontSize: Typography.size.lg,
      fontWeight: '500',
      color: theme.text,
    },
    cacheBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    cacheText: {
      fontSize: Typography.size.xs,
      color: theme.textMuted,
    },
  });
}
