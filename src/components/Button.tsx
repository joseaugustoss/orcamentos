import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, radius, fontSize } from "./theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
}

const sizeStyles = {
  sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
} satisfies Record<NonNullable<ButtonProps["size"]>, ViewStyle>;

const variantStyles = {
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.danger },
} satisfies Record<NonNullable<ButtonProps["variant"]>, ViewStyle>;

const labelVariantStyles = {
  primary: { color: colors.surface },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.surface },
} satisfies Record<NonNullable<ButtonProps["variant"]>, TextStyle>;

const labelSizeStyles = {
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.md },
  lg: { fontSize: fontSize.lg },
} satisfies Record<NonNullable<ButtonProps["size"]>, TextStyle>;

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  leftIcon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? colors.surface
              : colors.primary
          }
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.label,
              labelVariantStyles[variant],
              labelSizeStyles[size],
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
  },
  label: { fontWeight: "600" },
  disabled: { opacity: 0.45 },
});
