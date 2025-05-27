// src/utils/fetch-with-auth.ts
import { router } from 'expo-router';
import { deleteToken, getToken } from '../services/token-service';

const API_BASE = 'https://ec04-2804-14d-5492-84df-00-f9f3.ngrok-free.app';

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();

  // Build headers with Content-Type, Authorization, and ngrok skip header
  const headers = new Headers({
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Spread any additional headers passed in options
    ...(options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers || {})),
  });

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token is invalid/expired, remove it and redirect to login
    await deleteToken();
    router.replace('/login'); // Use replace to prevent back navigation
  }

  return response;
}
