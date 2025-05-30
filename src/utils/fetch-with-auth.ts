// src/utils/fetch-with-auth.ts
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { deleteToken, getToken } from '../services/token-service';

const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL; 

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();

  const headers = new Headers({
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers || {})),
  });

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await deleteToken();
    router.replace('/login');
  }

  return response;
}
