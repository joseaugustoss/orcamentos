export type QuoteStatus = "Rascunho" | "Enviado" | "Aprovado" | "Recusado";

export type SortOrder = "newest" | "oldest" | "highest" | "lowest";

export interface QuoteItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

export interface QuoteDoc {
  id: string;
  title: string;
  client: string;
  items: QuoteItem[];
  discountPct?: number;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  statuses: QuoteStatus[];
  sortOrder: SortOrder;
}

export type RootStackParamList = {
  Listing: undefined;
  CreateEdit: { quoteId?: string };
  Detail: { quoteId: string };
};
