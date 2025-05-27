// services/token-service.ts
import { Platform } from 'react-native';
import SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
