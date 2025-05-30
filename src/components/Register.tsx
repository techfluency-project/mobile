import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { saveToken } from '../services/token-service';
import { colors } from '../styles/colors';

function validatePassword(password: string, confirmPassword: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/[!@#$%^&*(),.?\":{}|<>_\-\\/~`+=\[\];']/g.test(password)) {
    errors.push("Password must contain at least one special character.");
  }
  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  return errors;
}

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    const validationErrors = validatePassword(password, repeatPassword);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // 1. Register the user
      const registerResponse = await fetch(`${Constants.expoConfig?.extra?.API_BASE_URL}/api/user/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) throw new Error(registerData.message || 'Registration failed');

      // 2. Automatically login the user
      const loginResponse = await fetch(`${Constants.expoConfig?.extra?.API_BASE_URL}/api/user/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginData.message || 'Login failed after registration');

      await saveToken(loginData.token); // Save token to AsyncStorage
      router.replace('/(tabs)/home');   // Go to home screen
    } catch (error) {
      setErrors([(error as Error).message]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Techfluency</Text>

      {errors.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          {errors.map((err, idx) => (
            <Text key={idx} style={{ color: 'red', fontSize: 12 }}>{err}</Text>
          ))}
        </View>
      )}

      <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Repeat Password" value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => router.push('/login')}>
        Already have an account?
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


export default Register;
