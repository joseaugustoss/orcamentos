import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import {
  RootStackParamList,
  QuoteStatus,
  SortOrder,
  FilterState,
} from "../types";
import { useQuotes } from "../contexts/QuotesContext";
import { QuoteCard } from "../components/QuoteCard";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import { colors, spacing, radius, fontSize } from "../components/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Listing">;

const STATUS_OPTIONS: QuoteStatus[] = [
  "Rascunho",
  "Enviado",
  "Aprovado",
  "Recusado",
];
const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: "Mais recente", value: "newest" },
  { label: "Mais antigo", value: "oldest" },
  { label: "Maior valor", value: "highest" },
  { label: "Menor valor", value: "lowest" },
];

export function ListingScreen({ navigation }: Props) {
  const {
    filteredQuotes,
    filters,
    isLoading,
    setFilters,
  } = useQuotes();

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [localFilter, setLocalFilter] = useState<FilterState>(filters);

  const displayed = search.trim()
    ? filteredQuotes.filter(
        (q) =>
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.client.toLowerCase().includes(search.toLowerCase()),
      )
    : filteredQuotes;

  const draftCount = filteredQuotes.filter(
    (q) => q.status === "Rascunho",
  ).length;

  function openFilter() {
    setLocalFilter(filters);
    setShowFilter(true);
  }

  function applyFilter() {
    setFilters(localFilter);
    setShowFilter(false);
  }

  function toggleStatus(status: QuoteStatus) {
    setLocalFilter((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasActiveFilter =
    filters.statuses.length > 0 || filters.sortOrder !== "newest";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orçamentos</Text>
          {draftCount > 0 && (
            <Text style={styles.subtitle}>
              Você tem {draftCount} {draftCount === 1 ? "item" : "itens"} em rascunho
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate("CreateEdit", {})}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.newBtnLabel}>Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título ou cliente..."
            placeholderTextColor={colors.textDisabled}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilter && styles.filterBtnActive]}
          onPress={openFilter}
        >
          <Feather
            name="sliders"
            size={18}
            color={hasActiveFilter ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={search ? "Nenhum resultado" : "Nenhum orçamento"}
            description={
              search
                ? "Tente outro nome ou cliente."
                : 'Toque em "Novo" para começar.'
            }
          />
        }
        renderItem={({ item }) => (
          <QuoteCard
            quote={item}
            onPress={() => navigation.navigate("Detail", { quoteId: item.id })}
          />
        )}
      />

      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowFilter(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filtrar e ordenar</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)} hitSlop={8}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetSection}>Status</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((s) => {
                const active = localFilter.statuses.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleStatus(s)}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        active && styles.chipLabelActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sheetSection}>Ordenar por</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((opt) => {
                const active = localFilter.sortOrder === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() =>
                      setLocalFilter((prev) => ({
                        ...prev,
                        sortOrder: opt.value,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        active && styles.chipLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sheetActions}>
              <Button
                label="Resetar filtros"
                variant="ghost"
                onPress={() =>
                  setLocalFilter({ statuses: [], sortOrder: "newest" })
                }
                style={{ flex: 1 }}
              />
              <Button
                label="Aplicar"
                onPress={applyFilter}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  newBtnLabel: { color: "#fff", fontWeight: "700", fontSize: fontSize.md },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.text,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  sheetSection: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  chipLabelActive: { color: colors.primary, fontWeight: "700" },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
