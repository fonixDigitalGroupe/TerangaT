import { Alert, ScrollView, StyleSheet, Text, View, Pressable, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthContext';

// Define the theme colors specific to this screen to match the mockup
const theme = {
  primary: '#047970', // The green color from the image
  background: '#ffffff',
  textMain: '#2E3E5C', // Dark text color
  textSub: '#707070', // Subtle text color for version
  iconColor: '#047970', // Green icons for list items
  border: '#F4F5F7',
};

const bientot = () =>
  Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive prochainement.');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  
  // Use agent shop name if available, otherwise user name, otherwise fallback
  const displayName = user?.agent?.shop_name || user?.name || 'Fonix';
  const displayPhone = user?.phone ? `+221 ${user.phone}` : '+221 77 982 77 84';

  const confirmLogout = () =>
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);

  return (
    <View style={styles.container}>
      {/* Green Header Area */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="storefront-outline" size={32} color={theme.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profilePhone}>{displayPhone}</Text>
          </View>
        </View>
      </View>

      {/* White Content Area */}
      <View style={styles.contentContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.menuList}>
            <MenuItem 
              icon="qr-code-outline" 
              title="QR Codes" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="wallet-outline" 
              title="Déplafonner mon compte" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="storefront-outline" 
              title="Commerce" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="lock-closed-outline" 
              title="Changer mon code secret" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="globe-outline" 
              title="Langue" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="settings-outline" 
              title="Configuration" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="chatbubble-ellipses-outline" 
              title="Support & Feedbacks" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="document-text-outline" 
              title="Termes & Conditions" 
              onPress={bientot} 
            />
            <MenuItem 
              icon="log-out-outline" 
              title="Déconnexion" 
              onPress={confirmLogout} 
            />
          </View>

          {/* Footer Area */}
          <View style={styles.footer}>
            <Text style={styles.brandText}>
              <Text style={styles.brandTing}>t!ng </Text>
              <Text style={styles.brandBusiness}>business</Text>
            </Text>
            <Text style={styles.versionText}>Version : 1.2.12</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function MenuItem({ icon, title, onPress }: { icon: any, title: string, onPress: () => void }) {
  return (
    <Pressable 
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={24} color={theme.iconColor} />
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMain} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  header: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  profilePhone: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuList: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  menuItemPressed: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: theme.textMain,
    fontWeight: '600',
    marginLeft: 16,
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  brandText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  brandTing: {
    color: theme.primary,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  brandBusiness: {
    color: '#B0B5C1',
    fontWeight: '600',
    fontSize: 16,
  },
  versionText: {
    color: theme.textSub,
    fontSize: 14,
    fontWeight: '500',
  },
});
