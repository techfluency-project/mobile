import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getToken, saveToken } from '../services/token-service';
import { colors } from '../styles/colors';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        router.replace('/home'); 
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${Constants.expoConfig?.extra?.API_BASE_URL}/api/User/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');

      const token = data.acessToken || data.token;
      if (!token) throw new Error('Token not found in response');

      await saveToken(token);

      Alert.alert('Success', 'Logged in successfully');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Techfluency</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => router.push('/register')}>
        Don't have an account?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.secondary },
  logo: { fontSize: 24, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 20 },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: colors.buttonText, fontWeight: 'bold' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 20 },
});

export default Login;
