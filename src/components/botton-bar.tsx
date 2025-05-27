import { usePathname, useRouter } from 'expo-router';
import { BookOpen, Home, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Define the routes and icons
  const tabs = [
    { name: 'Home', icon: Home, route: '/home' },
    { name: 'Profile', icon: User, route: '/profile' },
    { name: 'Flashcards', icon: BookOpen, route: '/flashcards' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(({ name, icon: Icon, route }) => {
        const isActive = pathname === route;
        return (
          <TouchableOpacity
            key={route}
            style={styles.tab}
            onPress={() => router.push(route)}
            activeOpacity={0.7}
          >
            <Icon color={isActive ? '#6200ee' : '#222'} size={24} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#222',
    marginTop: 2,
  },
  activeLabel: {
    color: '#6200ee',
    fontWeight: '600',
  },
});
