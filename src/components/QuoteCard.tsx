import { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { QuoteDoc } from "../types";
import { calcSubtotal, calcDiscount, calcTotal, formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { StatusBadge } from "./StatusBadge";
import { colors, spacing, radius, fontSize } from "./theme";

interface QuoteCardProps {
  quote: QuoteDoc;
  onPress: () => void;
}

export function QuoteCard({ quote, onPress }: QuoteCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  }

  const subtotal = calcSubtotal(quote.items);
  const discount = calcDiscount(subtotal, quote.discountPct);
  const total = calcTotal(subtotal, discount);

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{quote.title}</Text>
          <StatusBadge status={quote.status} size="sm" />
        </View>

        <Text style={styles.client} numberOfLines={1}>{quote.client}</Text>

        <View style={styles.footer}>
          <Text style={styles.total}>{formatCurrency(total)}</Text>
          <Text style={styles.date}>{formatDate(quote.createdAt)}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  client: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  total: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.primary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
  },
});
