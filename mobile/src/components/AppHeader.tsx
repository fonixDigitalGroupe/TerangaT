import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';

const MENU_ITEMS: { icon: string; title: string; route: string }[] = [
  { icon: 'qr-code-outline', title: 'QR Codes', route: '/settings/qr-codes' },
  { icon: 'storefront-outline', title: 'Commerce', route: '/settings/commerce' },
  { icon: 'lock-closed-outline', title: 'Changer mon code secret', route: '/settings/change-pin' },
  { icon: 'settings-outline', title: 'Configuration', route: '/settings/configuration' },
  { icon: 'chatbubble-ellipses-outline', title: 'Support & Feedbacks', route: '/settings/support' },
  { icon: 'document-text-outline', title: 'Termes & Conditions', route: '/settings/terms' },
];

/** En-tête commun (hamburger + titre/logo centré + cloche) avec menu latéral. */
export function AppHeader({ title, brand }: { title?: string; brand?: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + spacing.sm }]}>
        <Pressable hitSlop={8} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.white} />
        </Pressable>
        {brand ? (
          <View style={styles.brandWrap}>
            <View>
              <Text style={styles.brandScript}>Téranga</Text>
              <Text style={styles.brandSub}>OPÉRATION</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.headerTitle}>{title}</Text>
        )}
        <Pressable style={styles.roundBtn} hitSlop={6}>
          <Ionicons name="notifications" size={20} color={colors.white} />
        </Pressable>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawerPanel, { paddingTop: Math.max(insets.top, 12) + spacing.md }]}>
            <Text style={styles.drawerTitle}>Paramètres</Text>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.title}
                style={styles.drawerItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push(item.route as never);
                }}
              >
                <Ionicons name={item.icon as never} size={20} color={colors.text} />
                <Text style={styles.drawerItemText}>{item.title}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.drawerItem}
              onPress={() => {
                setMenuVisible(false);
                void logout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.drawerItemText, { color: colors.danger }]}>Déconnexion</Text>
            </Pressable>
          </View>
          <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#1A84D8',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    marginHorizontal: spacing.sm,
  },
  brandWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandScript: {
    color: colors.white,
    fontSize: 28,
    fontFamily: 'KaushanScript_400Regular',
    lineHeight: 32,
  },
  brandSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: -3,
    alignSelf: 'flex-start',
    marginLeft: -2,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerPanel: {
    width: '78%',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  drawerTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerItemText: { fontSize: 15, fontWeight: '500', color: colors.text },
});
