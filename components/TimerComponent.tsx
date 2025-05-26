// components/TimerComponent.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { formatDuration } from '../utils/storage';

interface TimerComponentProps {
  isRunning: boolean;
  onTimeUpdate: (seconds: number) => void;
  resetTimer: boolean;
}

export const TimerComponent: React.FC<TimerComponentProps> = ({
  isRunning,
  onTimeUpdate,
  resetTimer
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          onTimeUpdate(newSeconds);
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, onTimeUpdate]);

  useEffect(() => {
    if (resetTimer) {
      setSeconds(0);
      onTimeUpdate(0);
    }
  }, [resetTimer, onTimeUpdate]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Timer:</Text>
      <Text style={styles.time}>{formatDuration(seconds)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  time: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});