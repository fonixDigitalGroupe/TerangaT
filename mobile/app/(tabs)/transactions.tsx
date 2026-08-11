import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { AppHeader } from '../../src/components/AppHeader';
import { TransactionRow } from '../../src/components/TransactionRow';
import { colors, spacing } from '../../src/theme';
import type { Transaction } from '../../src/types';

export default function TransactionsScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <View style={styles.container}>
      <AppHeader title="Historique" />

      <View style={styles.grayArea}>
        {error && <View style={{ marginBottom: spacing.sm }}><Alert message={error} /></View>}

        {loading ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: spacing.xl }} />
        ) : (
          <View style={styles.card}>
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
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#d3d9e2' },
  grayArea: { flex: 1, backgroundColor: '#d3d9e2', padding: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
