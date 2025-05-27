import { AuthGuard } from '@/src/components/Auth-Guard';
import BottomBar from '@/src/components/botton-bar';
import { Slot } from 'expo-router';

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Slot />
      <BottomBar />
    </AuthGuard>
  );
}
