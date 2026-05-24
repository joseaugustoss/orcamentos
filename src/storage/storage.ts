import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuoteDoc, FilterState } from "@/types";

const QUOTES_KEY = "@orcamentos:quotes";
const FILTER_KEY = "@orcamentos:filters";

export async function loadQuotes(): Promise<QuoteDoc[]> {
  try {
    const json = await AsyncStorage.getItem(QUOTES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    throw new Error("QUOTE_KEY " + error);
  }
}

export async function saveQuotes(quotes: QuoteDoc[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
  } catch {}
}

export async function loadFilters(): Promise<FilterState | null> {
  try {
    const json = await AsyncStorage.getItem(FILTER_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveFilters(filters: FilterState): Promise<void> {
  try {
    await AsyncStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  } catch {}
}
