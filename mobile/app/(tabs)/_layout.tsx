import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Transférer',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bank-transfer" size={(size ?? 24) + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Paramètre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={(size ?? 24) - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
