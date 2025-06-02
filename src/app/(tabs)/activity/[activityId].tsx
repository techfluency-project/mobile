import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Activity from './page';

export default function SpecificActivityPage() {
  const params = useLocalSearchParams();
  const activityId = params.activityId;

  if (typeof activityId !== 'string') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Invalid activity ID</Text>
      </View>
    );
  }

  return <Activity mode="single" activityId={activityId} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
