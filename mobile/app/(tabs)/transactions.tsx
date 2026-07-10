import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { TransactionRow } from '../../src/components/TransactionRow';
import { colors, font, spacing } from '../../src/theme';
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>Historique</Text>
      {error && <View style={{ paddingHorizontal: spacing.md }}><Alert message={error} /></View>}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: font.xl, fontWeight: '800', color: colors.text, padding: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  divider: { height: 1, backgroundColor: colors.border },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
