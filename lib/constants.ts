export const QUOTE_STATUS = {
  draft: "draft",
  sent: "sent",
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];
