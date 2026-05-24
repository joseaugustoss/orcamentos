import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { RootStackParamList, QuoteItem, QuoteStatus } from "../types";
import { useQuotes } from "../contexts/QuotesContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { colors, spacing, radius, fontSize } from "../components/theme";
import {
  calcSubtotal,
  calcDiscount,
  calcTotal,
  formatCurrency,
} from "../utils/currency";
import { generateId } from "../utils/id";

type Props = NativeStackScreenProps<RootStackParamList, "CreateEdit">;

const STATUS_OPTIONS: QuoteStatus[] = [
  "Rascunho",
  "Enviado",
  "Aprovado",
  "Recusado",
];

export function CreateEditScreen({ navigation, route }: Props) {
  const { quoteId } = route.params ?? {};
  const { getQuote, createQuote, updateQuote } = useQuotes();

  const existingQuote = quoteId ? getQuote(quoteId) : undefined;
  const isEdit = !!existingQuote;

  const [title, setTitle] = useState(existingQuote?.title ?? "");
  const [client, setClient] = useState(existingQuote?.client ?? "");
  const [status, setStatus] = useState<QuoteStatus>(
    existingQuote?.status ?? "Rascunho",
  );
  const [items, setItems] = useState<QuoteItem[]>(existingQuote?.items ?? []);
  const [discountPct, setDiscountPct] = useState(
    String(existingQuote?.discountPct ?? ""),
  );
  const [errors, setErrors] = useState<{ title?: string; client?: string }>({});

  const [showService, setShowService] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcQty, setSvcQty] = useState(1);
  const [svcErrors, setSvcErrors] = useState<{ desc?: string; price?: string }>(
    {},
  );

  const subtotal = calcSubtotal(items);
  const discountValue = calcDiscount(subtotal, Number(discountPct) || 0);
  const total = calcTotal(subtotal, discountValue);

  function openAddService() {
    setEditingItem(null);
    setSvcDesc("");
    setSvcPrice("");
    setSvcQty(1);
    setSvcErrors({});
    setShowService(true);
  }

  function openEditService(item: QuoteItem) {
    setEditingItem(item);
    setSvcDesc(item.description);
    setSvcPrice(String(item.price));
    setSvcQty(item.qty);
    setSvcErrors({});
    setShowService(true);
  }

  function handleSaveService() {
    const errs: typeof svcErrors = {};
    if (!svcDesc.trim()) errs.desc = "Informe a descrição.";
    if (!svcPrice || Number(svcPrice) <= 0)
      errs.price = "Informe um preço válido.";
    if (Object.keys(errs).length) {
      setSvcErrors(errs);
      return;
    }

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                description: svcDesc.trim(),
                price: Number(svcPrice),
                qty: svcQty,
              }
            : i,
        ),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: generateId(),
          description: svcDesc.trim(),
          price: Number(svcPrice),
          qty: svcQty,
        },
      ]);
    }
    setShowService(false);
  }

  function handleDeleteService(id: string) {
    Alert.alert("Remover serviço", "Deseja remover este serviço?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setItems((prev) => prev.filter((i) => i.id !== id)),
      },
    ]);
  }

  function handleSave() {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = "Informe o título.";
    if (!client.trim()) errs.client = "Informe o cliente.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const data = {
      title: title.trim(),
      client: client.trim(),
      status,
      items,
      discountPct: Number(discountPct) || undefined,
    };

    if (isEdit) {
      updateQuote(quoteId!, data);
      navigation.goBack();
    } else {
      const q = createQuote(data);
      navigation.replace("Detail", { quoteId: q.id });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orçamento</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Informações gerais</Text>
          <Input
            label="Título"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setErrors((e) => ({ ...e, title: undefined }));
            }}
            error={errors.title}
            placeholder="Ex.: Site institucional"
          />
          <Input
            label="Cliente"
            value={client}
            onChangeText={(c) => {
              setClient(c);
              setErrors((e) => ({ ...e, client: undefined }));
            }}
            error={errors.client}
            placeholder="Ex.: João Silva"
          />

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusChip,
                  status === s && styles.statusChipActive,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.statusChipLabel,
                    status === s && styles.statusChipLabelActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Serviços inclusos</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.serviceItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceDesc}>{item.description}</Text>
                <Text style={styles.serviceMeta}>
                  {item.qty}x · {formatCurrency(item.price)} cada
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => openEditService(item)}
                hitSlop={8}
              >
                <Feather name="edit-2" size={16} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteService(item.id)}
                hitSlop={8}
              >
                <Feather name="trash-2" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addServiceBtn}
            onPress={openAddService}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={styles.addServiceLabel}>Adicionar serviço</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Investimento</Text>
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Desconto (%)</Text>
              <Input
                value={discountPct}
                onChangeText={setDiscountPct}
                keyboardType="numeric"
                placeholder="0"
                style={styles.discountInput}
              />
            </View>
            {discountValue > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto (−)</Text>
                <Text style={[styles.totalValue, { color: colors.danger }]}>
                  −{formatCurrency(discountValue)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.finalLabel}>Total</Text>
              <Text style={styles.finalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.formActions}>
            <Button
              label="Cancelar"
              variant="ghost"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            />
            <Button
              label="Salvar"
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showService} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowService(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>
                {editingItem ? "Editar serviço" : "Novo serviço"}
              </Text>

              <Input
                label="Descrição"
                value={svcDesc}
                onChangeText={setSvcDesc}
                error={svcErrors.desc}
                placeholder="Ex.: Design de identidade visual"
              />
              <Input
                label="Preço unitário (R$)"
                value={svcPrice}
                onChangeText={setSvcPrice}
                error={svcErrors.price}
                keyboardType="numeric"
                placeholder="0,00"
              />

              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>Quantidade</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setSvcQty((q) => Math.max(1, q - 1))}
                  >
                    <Feather name="minus" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{svcQty}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setSvcQty((q) => q + 1)}
                  >
                    <Feather name="plus" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Button label="Salvar serviço" onPress={handleSaveService} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  form: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statusChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  statusChipLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  statusChipLabelActive: { color: colors.primary, fontWeight: "700" },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceDesc: { fontSize: fontSize.md, color: colors.text, fontWeight: "600" },
  serviceMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  addServiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: "center",
  },
  addServiceLabel: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: "600",
  },
  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: fontSize.md, color: colors.textMuted },
  totalValue: { fontSize: fontSize.md, color: colors.text, fontWeight: "600" },
  discountInput: { width: 80, textAlign: "right", paddingVertical: spacing.xs },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  finalLabel: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  finalValue: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.primary,
  },
  formActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
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
  sheetTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: "600" },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    minWidth: 24,
    textAlign: "center",
  },
});
