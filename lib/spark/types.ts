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
  "hubspot" | "budget",
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
  currentMonthOpenDeals: SparkRecord[];
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
};
