/**
 * History Screen – shows all recent searches with quick-tap to re-search
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/Typography';
import { getRecentSearches, clearRecentSearches } from '@/services/recentSearches';

export default function HistoryScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searches, setSearches] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentSearches().then(setSearches);
    }, [])
  );

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Remove all recent searches?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearRecentSearches();
            setSearches([]);
          },
        },
      ]
    );
  };

  const styles = makeStyles(theme, insets);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {searches.length > 0 && (
          <TouchableOpacity onPress={handleClear} accessibilityLabel="Clear history">
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {searches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🕰</Text>
          <Text style={styles.emptyTitle}>No searches yet</Text>
          <Text style={styles.emptyBody}>Words you look up will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={searches}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.row, index === 0 && styles.rowFirst]}
              onPress={() => router.push({ pathname: '/', params: { q: item } })}
              accessibilityRole="button"
              accessibilityLabel={`Search ${item}`}
            >
              <View style={styles.rowIcon}>
                <Ionicons name="time-outline" size={18} color={theme.accent} />
              </View>
              <Text style={styles.rowText}>{item}</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, insets: { top: number }) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: insets.top + 16,
      paddingBottom: 16,
    },
    title: {
      fontSize: Typography.size['2xl'],
      fontWeight: '800',
      color: theme.text,
      letterSpacing: Typography.letterSpacing.tight,
    },
    clearText: {
      fontSize: Typography.size.sm,
      color: theme.error,
      fontWeight: '600',
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 15,
      gap: 12,
    },
    rowFirst: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: {
      flex: 1,
      fontSize: Typography.size.base,
      color: theme.text,
      fontWeight: '500',
    },
    separator: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: 16,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingBottom: 80,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: Typography.size.xl,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    emptyBody: {
      fontSize: Typography.size.base,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
}
