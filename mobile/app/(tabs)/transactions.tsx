import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { Alert } from '../../src/components/ui';
import { TransactionRow, formatF } from '../../src/components/TransactionRow';
import { colors, font, spacing } from '../../src/theme';
import type { Transaction } from '../../src/types';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [items, setItems] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balance = user?.agent?.wallet?.balance ?? 0;

  const fetchPage = useCallback(async (targetPage: number, replace: boolean) => {
    try {
      setError(null);
      const res = await transactionsApi.list(targetPage);
      setLastPage(res.meta.last_page);
      setPage(res.meta.current_page);
      setItems((prev) => (replace ? res.data : [...prev, ...res.data]));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPage(1, true);
    }, [fetchPage])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPage(1, true);
  };

  const onEndReached = () => {
    if (!loadingMore && !loading && page < lastPage) {
      setLoadingMore(true);
      fetchPage(page + 1, false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* En-tête : avatar · solde · stats */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="person-outline" size={20} color={colors.textMuted} />
        </View>
        <Text style={styles.balance}>{formatF(balance)}</Text>
        <View style={styles.headerIcon}>
          <Ionicons name="trending-up" size={20} color={colors.textMuted} />
        </View>
      </View>

      {error && <View style={{ paddingHorizontal: spacing.lg }}><Alert message={error} /></View>}

      {loading ? (
        <ActivityIndicator color={colors.blue} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <TransactionRow tx={item} />}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<Text style={styles.empty}>Aucune transaction.</Text>}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.blue} style={{ margin: spacing.md }} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: { fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: 0.3 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  divider: { height: 1, backgroundColor: colors.border },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
