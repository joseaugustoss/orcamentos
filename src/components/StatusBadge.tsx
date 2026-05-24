import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { QuoteStatus } from "../types";
import { colors, spacing, radius, fontSize } from "./theme";

const STATUS_CONFIG: Record<
  QuoteStatus,
  { dot: string; text: string; bg: string }
> = {
  Rascunho: {
    dot: colors.statusDraft,
    text: colors.statusDraft,
    bg: "#F3F4F6",
  },
  Enviado: { dot: colors.statusSent, text: colors.statusSent, bg: "#EFF6FF" },
  Aprovado: {
    dot: colors.statusApproved,
    text: colors.statusApproved,
    bg: "#ECFDF5",
  },
  Recusado: {
    dot: colors.statusRejected,
    text: colors.statusRejected,
    bg: "#FEF2F2",
  },
};

interface StatusBadgeProps {
  status: QuoteStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: cfg.bg },
        size === "sm" ? styles.sm : styles.md,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text
        style={[
          styles.label,
          { color: cfg.text },
          size === "sm" && styles.labelSm,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderRadius: radius.full,
  },
  md: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs },
  sm: { paddingHorizontal: spacing.sm, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: radius.full },
  label: { fontWeight: "600", fontSize: fontSize.sm },
  labelSm: { fontSize: fontSize.xs },
});
