import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { AppHeader } from '../../src/components/AppHeader';
import { TransactionRow } from '../../src/components/TransactionRow';
import { colors, spacing } from '../../src/theme';
import type { Transaction } from '../../src/types';

type TypeFilter = 'all' | 'depot' | 'retrait';

const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

export default function TransactionsScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);
  const [pickerFor, setPickerFor] = useState<'start' | 'end' | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const start = dateStart ? new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), 0, 0, 0) : null;
    const end = dateEnd ? new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate(), 23, 59, 59) : null;

    return items.filter((tx) => {
      if (typeFilter !== 'all') {
        const wanted = typeFilter === 'depot' ? 'dépôt' : 'retrait';
        if (tx.type !== wanted) return false;
      }
      if (q) {
        const hay = `${tx.client_phone ?? ''} ${tx.reference ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (start || end) {
        const d = new Date(tx.created_at);
        if (start && d < start) return false;
        if (end && d > end) return false;
      }
      return true;
    });
  }, [items, search, typeFilter, dateStart, dateEnd]);

  const hasDateFilter = dateStart || dateEnd;

  return (
    <View style={styles.container}>
      <AppHeader title="Historique" />

      <View style={styles.grayArea}>
        {/* Recherche */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as object]}
            placeholder="Rechercher"
            placeholderTextColor="#9aa3b0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Filtres type */}
        <View style={styles.chipsRow}>
          {(['all', 'depot', 'retrait'] as TypeFilter[]).map((key) => (
            <Pressable
              key={key}
              style={[styles.chip, typeFilter === key && styles.chipActive]}
              onPress={() => setTypeFilter(key)}
            >
              <Text style={[styles.chipText, typeFilter === key && styles.chipTextActive]}>
                {key === 'all' ? 'Tous' : key === 'depot' ? 'Dépôt' : 'Retrait'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Période */}
        <View style={styles.dateRow}>
          <Pressable style={styles.dateBtn} onPress={() => setPickerFor('start')}>
            <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
            <Text style={styles.dateText}>{dateStart ? fmtDate(dateStart) : 'Date début'}</Text>
          </Pressable>
          <Pressable style={styles.dateBtn} onPress={() => setPickerFor('end')}>
            <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
            <Text style={styles.dateText}>{dateEnd ? fmtDate(dateEnd) : 'Date fin'}</Text>
          </Pressable>
          {hasDateFilter && (
            <Pressable onPress={() => { setDateStart(null); setDateEnd(null); }} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {error && <View style={{ marginBottom: spacing.sm }}><Alert message={error} /></View>}

        {loading ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: spacing.xl }} />
        ) : (
          <View style={styles.card}>
            <FlatList
              data={filtered}
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

      {pickerFor && (
        <DateTimePicker
          value={(pickerFor === 'start' ? dateStart : dateEnd) ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_e, d) => {
            setPickerFor(null);
            if (d) {
              if (pickerFor === 'start') setDateStart(d);
              else setDateEnd(d);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#d3d9e2' },
  grayArea: { flex: 1, backgroundColor: '#d3d9e2', padding: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  chipsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.white },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  dateText: { fontSize: 13, color: colors.text },
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
