import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { QuoteDoc, FilterState, QuoteStatus, SortOrder } from "../types";
import {
  loadQuotes,
  saveQuotes,
  loadFilters,
  saveFilters,
} from "../storage/storage";
import { generateId } from "../utils/id";

interface QuotesContextType {
  quotes: QuoteDoc[];
  filteredQuotes: QuoteDoc[];
  filters: FilterState;
  isLoading: boolean;
  createQuote: (
    data: Omit<QuoteDoc, "id" | "createdAt" | "updatedAt">,
  ) => QuoteDoc;
  updateQuote: (id: string, data: Partial<QuoteDoc>) => void;
  deleteQuote: (id: string) => void;
  duplicateQuote: (id: string) => QuoteDoc;
  changeStatus: (id: string, status: QuoteStatus) => void;
  setFilters: (filters: FilterState) => void;
  getQuote: (id: string) => QuoteDoc | undefined;
}

const DEFAULT_FILTERS: FilterState = {
  statuses: [],
  sortOrder: "newest",
};

const sortFns: Record<SortOrder, (a: QuoteDoc, b: QuoteDoc) => number> = {
  newest: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  oldest: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
  highest: (a, b) => {
    const totalA = a.items.reduce((s, i) => s + i.qty * i.price, 0);
    const totalB = b.items.reduce((s, i) => s + i.qty * i.price, 0);
    return totalB - totalA;
  },
  lowest: (a, b) => {
    const totalA = a.items.reduce((s, i) => s + i.qty * i.price, 0);
    const totalB = b.items.reduce((s, i) => s + i.qty * i.price, 0);
    return totalA - totalB;
  },
};

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteDoc[]>([]);
  const [filtersState, setFiltersState] =
    useState<FilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const [storedQuotes, storedFilters] = await Promise.all([
        loadQuotes(),
        loadFilters(),
      ]);

      setQuotes(storedQuotes);
      if (storedFilters) setFiltersState(storedFilters);
      setIsLoading(false);
    }
    init();
  }, []);

  const persist = useCallback((next: QuoteDoc[]) => {
    setQuotes(next);
    saveQuotes(next);
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    if (filtersState.statuses.length > 0) {
      result = result.filter((q) => filtersState.statuses.includes(q.status));
    }

    result.sort(sortFns[filtersState.sortOrder]);
    return result;
  }, [quotes, filtersState]);

  const createQuote = useCallback(
    (data: Omit<QuoteDoc, "id" | "createdAt" | "updatedAt">): QuoteDoc => {
      const now = new Date().toISOString();
      const quote: QuoteDoc = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      persist([quote, ...quotes]);
      return quote;
    },
    [quotes, persist],
  );

  const updateQuote = useCallback(
    (id: string, data: Partial<QuoteDoc>) => {
      const now = new Date().toISOString();
      persist(
        quotes.map((q) =>
          q.id === id ? { ...q, ...data, updatedAt: now } : q,
        ),
      );
    },
    [quotes, persist],
  );

  const deleteQuote = useCallback(
    (id: string) => {
      persist(quotes.filter((q) => q.id !== id));
    },
    [quotes, persist],
  );

  const duplicateQuote = useCallback(
    (id: string): QuoteDoc => {
      const original = quotes.find((q) => q.id === id)!;
      const now = new Date().toISOString();
      const duplicate: QuoteDoc = {
        ...original,
        id: generateId(),
        title: `${original.title} (cópia)`,
        status: "Rascunho",
        items: original.items.map((item) => ({ ...item, id: generateId() })),
        createdAt: now,
        updatedAt: now,
      };
      persist([duplicate, ...quotes]);
      return duplicate;
    },
    [quotes, persist],
  );

  const changeStatus = useCallback(
    (id: string, status: QuoteStatus) => updateQuote(id, { status }),
    [updateQuote],
  );

  const setFilters = useCallback((filters: FilterState) => {
    setFiltersState(filters);
    saveFilters(filters);
  }, []);

  const getQuote = useCallback(
    (id: string) => quotes.find((q) => q.id === id),
    [quotes],
  );

  const value: QuotesContextType = {
    quotes,
    filteredQuotes,
    filters: filtersState,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
    duplicateQuote,
    changeStatus,
    setFilters,
    getQuote,
  };

  return (
    <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>
  );
}

export function useQuotes(): QuotesContextType {
  const ctx = useContext(QuotesContext);
  if (!ctx) {
    throw new Error("useQuotes() deve ser chamado dentro de <QuotesProvider>");
  }
  return ctx;
}
