import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';

export default function Index() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  return <Redirect href={user ? '/(tabs)' : '/(auth)/welcome'} />;
}
