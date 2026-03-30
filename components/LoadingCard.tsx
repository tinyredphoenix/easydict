/**
 * LoadingCard – shown while AI fetches word data
 * Premium shimmer-style skeleton animation
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function LoadingCard() {
  const theme = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  const styles = makeStyles(theme);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={[styles.bar, { width: '45%', height: 36, marginBottom: 12 }]} />
      <View style={[styles.bar, { width: '25%', height: 18, marginBottom: 24 }]} />
      <View style={[styles.bar, { width: '100%', height: 14, marginBottom: 8 }]} />
      <View style={[styles.bar, { width: '90%', height: 14, marginBottom: 8 }]} />
      <View style={[styles.bar, { width: '70%', height: 14, marginBottom: 24 }]} />
      <View style={[styles.bar, { width: '100%', height: 14, marginBottom: 8 }]} />
      <View style={[styles.bar, { width: '60%', height: 14, marginBottom: 24 }]} />
      <View style={[styles.bar, { width: '40%', height: 22 }]} />
    </Animated.View>
  );
}

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
          shadowOpacity: 0.08,
          shadowRadius: 24,
        },
        android: { elevation: 4 },
      }),
    },
    bar: {
      backgroundColor: theme.divider,
      borderRadius: 8,
    },
  });
}
