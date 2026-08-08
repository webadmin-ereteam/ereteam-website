export type SparkRecord = {
  id: string;
  name: string;
  date?: string;
  amount: number;
  owner?: string;
  company?: string;
  url: string;
  carryover?: boolean;
};

export type SparkSourceState = Record<
  "hubspot" | "budget" | "amplemarket",
  { ok: boolean; message?: string }
>;

export type SparkData = {
  generatedAt: string;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  target: number;
  ytdInvoice: number;
  monthInvoice: number;
  openOrders: number;
  monthExpected: number;
  pipeline: number;
  weightedForecast: number;
  activeDeals: number;
  weeklyNewPipeline: number;
  weeklyNewDeals: SparkRecord[];
  weeklyWon: SparkRecord[];
  weeklyLost: SparkRecord[];
  monthInvoices: SparkRecord[];
  monthOrders: SparkRecord[];
  monthlyInvoiceTrend: Array<{ month: string; amount: number }>;
  newBusiness: {
    invoices: SparkRecord[];
    orders: SparkRecord[];
    sameYearDeals: SparkRecord[];
    sameYearInvoices: SparkRecord[];
    sameYearOrders: SparkRecord[];
  };
  leadGeneration: {
    sent: number | null;
    bulk: number | null;
    duo: number | null;
    replies: number | null;
    positive: number | null;
    meetings: Array<{ person: string; company: string; bookedAt: string; owner?: string }>;
  };
};
