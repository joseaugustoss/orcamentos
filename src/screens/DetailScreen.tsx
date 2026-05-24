import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { RootStackParamList } from "../types";
import { useQuotes } from "../contexts/QuotesContext";
import { StatusBadge } from "../components/StatusBadge";
import { colors, spacing, radius, fontSize } from "../components/theme";
import {
  calcSubtotal,
  calcDiscount,
  calcTotal,
  formatCurrency,
} from "../utils/currency";
import { formatDate } from "../utils/date";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export function DetailScreen({ navigation, route }: Props) {
  const { quoteId } = route.params;
  const { getQuote, deleteQuote, duplicateQuote } = useQuotes();
  const quote = getQuote(quoteId);

  if (!quote) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Orçamento não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const doc = quote;

  const subtotal = calcSubtotal(doc.items);
  const discountValue = calcDiscount(subtotal, doc.discountPct);
  const total = calcTotal(subtotal, discountValue);

  function handleDelete() {
    Alert.alert(
      "Remover orçamento",
      `Deseja remover "${doc.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            deleteQuote(doc.id);
            navigation.popToTop();
          },
        },
      ],
    );
  }

  function handleDuplicate() {
    const copy = duplicateQuote(doc.id);
    navigation.replace("Detail", { quoteId: copy.id });
  }

  async function handleShare() {
    const itemLines = doc.items
      .map((i) => `  • ${i.description} — ${i.qty}x ${formatCurrency(i.price)}`)
      .join("\n");

    const discountLine = doc.discountPct
      ? `Desconto (${doc.discountPct}%): −${formatCurrency(discountValue)}\n`
      : "";

    const message =
      `Orçamento: ${doc.title}\n` +
      `Cliente: ${doc.client}\n` +
      `Status: ${doc.status}\n\n` +
      `Serviços:\n${itemLines || "  Nenhum serviço"}\n\n` +
      `Subtotal: ${formatCurrency(subtotal)}\n` +
      discountLine +
      `Total: ${formatCurrency(total)}`;

    await Share.share({ message });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>
            #{doc.id.slice(0, 8).toUpperCase()}
          </Text>
          <StatusBadge status={doc.status} size="sm" />
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.iconWrapper}>
            <Feather name="file-text" size={24} color={colors.primary} />
          </View>
          <Text style={styles.infoTitle}>{doc.title}</Text>
          <Text style={styles.infoClient}>{doc.client}</Text>
          <View style={styles.dates}>
            <Text style={styles.dateText}>
              Criado em {formatDate(doc.createdAt)}
            </Text>
            <Text style={styles.dateDot}>·</Text>
            <Text style={styles.dateText}>
              Atualizado em {formatDate(doc.updatedAt)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Serviços inclusos</Text>
        {doc.items.length === 0 ? (
          <Text style={styles.emptyItems}>Nenhum serviço adicionado.</Text>
        ) : (
          doc.items.map((item) => (
            <View key={item.id} style={styles.serviceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceDesc}>{item.description}</Text>
                <Text style={styles.serviceMeta}>
                  {item.qty}x · {formatCurrency(item.price)} cada
                </Text>
              </View>
              <Text style={styles.serviceTotal}>
                {formatCurrency(item.qty * item.price)}
              </Text>
            </View>
          ))
        )}

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text
              style={[
                styles.totalValue,
                discountValue > 0 && styles.subtotalStrike,
              ]}
            >
              {formatCurrency(subtotal)}
            </Text>
          </View>

          {doc.discountPct ? (
            <View style={styles.totalRow}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {doc.discountPct}% off
                </Text>
              </View>
              <Text style={[styles.totalValue, { color: colors.danger }]}>
                −{formatCurrency(discountValue)}
              </Text>
            </View>
          ) : null}

          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.finalLabel}>Investimento total</Text>
            <Text style={styles.finalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={20} color={colors.danger} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDuplicate}>
          <Feather name="copy" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("CreateEdit", { quoteId: doc.id })}
        >
          <Feather name="edit-2" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Feather name="share" size={20} color="#fff" />
          <Text style={styles.shareBtnLabel}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: spacing.md },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: fontSize.md, color: colors.textMuted },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerCenter: { alignItems: "center", gap: spacing.xs },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1,
  },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 80 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  infoClient: { fontSize: fontSize.md, color: colors.textMuted },
  dates: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dateText: { fontSize: fontSize.xs, color: colors.textMuted },
  dateDot: { fontSize: fontSize.xs, color: colors.textMuted },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  emptyItems: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  serviceDesc: { fontSize: fontSize.md, color: colors.text, fontWeight: "600" },
  serviceMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  serviceTotal: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: fontSize.md, color: colors.textMuted },
  totalValue: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  subtotalStrike: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  discountBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  discountBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.danger,
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  finalLabel: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  finalValue: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.primary,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  shareBtnLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: fontSize.md,
  },
});
