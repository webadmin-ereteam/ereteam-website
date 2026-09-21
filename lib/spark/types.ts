export type SparkRecord = {
  id: string;
  objectType?: "Deal" | "Invoice" | "Order";
  name: string;
  date?: string;
  amount: number;
  owner?: string;
  company?: string;
  country?: string;
  url: string;
  carryover?: boolean;
  stage?: string;
  weightedAmount?: number;
  ageDays?: number;
  issues?: string[];
};

export type SparkRecordGroup = {
  key: string;
  label: string;
  description?: string;
  records: SparkRecord[];
};

export type SparkMonthPerformance = {
  month: number;
  label: string;
  invoices: SparkRecord[];
  orders: SparkRecord[];
  deals: SparkRecord[];
  weightedPipeline: number;
};

export type SparkStagePerformance = {
  id: string;
  label: string;
  probability: number;
  records: SparkRecord[];
  weightedPipeline: number;
  averageAgeDays: number;
};

export type SparkBreakdownEntry = {
  key: string;
  label: string;
  invoices: SparkRecord[];
  orders: SparkRecord[];
  deals: SparkRecord[];
  weightedPipeline: number;
};

export type SparkBreakdown = {
  key: "country" | "vendor" | "revenueType" | "domain";
  label: string;
  multiValue: boolean;
  entries: SparkBreakdownEntry[];
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
  yearWeightedPipeline: number;
  activeDeals: number;
  weeklyNewPipeline: number;
  weeklyNewDeals: SparkRecord[];
  weeklyWon: SparkRecord[];
  weeklyLost: SparkRecord[];
  currentMonthOpenDeals: SparkRecord[];
  monthInvoices: SparkRecord[];
  monthOrders: SparkRecord[];
  monthlyInvoiceTrend: Array<{ month: string; amount: number }>;
  monthlyPerformance: SparkMonthPerformance[];
  stageFunnel: SparkStagePerformance[];
  revenueBreakdowns: SparkBreakdown[];
  hygiene: SparkRecordGroup[];
  newBusiness: {
    invoices: SparkRecord[];
    orders: SparkRecord[];
    sameYearDeals: SparkRecord[];
    sameYearInvoices: SparkRecord[];
    sameYearOrders: SparkRecord[];
  };
};
