/**
 * Public-safe business configuration.
 * Values here are intentionally customer-facing and may be rendered in HTML.
 * Never add purchase costs, supplier identities, private stock notes or credentials.
 */
export const business = {
  name: "Kundu Electronics",
  alternativeTradingName: "Kundu Brothers Electronics",
  tagline: "Affordable components. Practical solutions. Student-focused.",
  locationLabel: "Khulna, Bangladesh",
  consultationLabel: "Free consultation",
  currency: {
    code: "BDT",
    symbol: "৳",
    locale: "en-BD",
  },
  contact: {
    publicPhone: "+8801570263442",
    publicPhoneDisplay: "+880 1570 263442",
    whatsappUrl: "https://wa.me/8801570263442",
    publicEmail: "kjkundu2006@gmail.com",
    publicAddress: "Pocket Gate, KUET, Fulbarigate, Khulna, Bangladesh, 9202",
    facebookUrl: "https://www.facebook.com/KunduElectronicsBD",
    openingHours: null as string | null,
  },
  payments: {
    bkash: {
      enabled: false,
      receivingNumber: null as string | null,
      instructions: null as string | null,
    },
    nagad: {
      enabled: false,
      receivingNumber: null as string | null,
      instructions: null as string | null,
    },
    verificationMode: "manual" as const,
  },
  delivery: {
    chargeBdt: null as number | null,
    policyConfigured: false,
    areasConfigured: false,
  },
  returns: {
    policyConfigured: false,
  },
} as const;

export type BusinessConfig = typeof business;
