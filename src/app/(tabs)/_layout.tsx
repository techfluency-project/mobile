import { AuthGuard } from '@/src/components/Auth-Guard';
import BottomBar from '@/src/components/botton-bar';
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  return (
    <AuthGuard>
      <View style={styles.container}>
        <Slot />
      </View>
      <BottomBar />
    </AuthGuard>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 60, // ✅ Adds space for BottomBar
  },
});
