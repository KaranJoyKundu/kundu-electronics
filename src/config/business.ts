/**
 * Public-safe business configuration.
 * Replace null values only with information confirmed by the business owner.
 * Never place secrets, supplier prices, credentials, or private inventory data here.
 */
export const business = {
  name: "Kundu Electronics",
  locationLabel: "Khulna, Bangladesh",
  currency: {
    code: "BDT",
    symbol: "৳",
    locale: "en-BD",
  },
  contact: {
    publicPhone: null as string | null,
    publicEmail: null as string | null,
    publicAddress: null as string | null,
    openingHours: null as string | null,
  },
  payments: {
    bkash: {
      enabled: false,
      receivingNumber: null as string | null,
    },
    nagad: {
      enabled: false,
      receivingNumber: null as string | null,
    },
    verificationMode: "manual" as const,
  },
  delivery: {
    chargeBdt: null as number | null,
    policyConfigured: false,
  },
  returns: {
    policyConfigured: false,
  },
} as const;

export type BusinessConfig = typeof business;
