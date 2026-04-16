import { icons } from "./icons";

export const HOME_USER = {
  name: "Rizwan Tariq",
};

export const HOME_BALANCE = {
  amount: 18450.75,
  nextRenewalDate: "2026-05-01T09:00:00.000Z",
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
  {
    id: "spotify",
    icon: icons.spotify,
    name: "Spotify",
    price: 2.99,
    currency: "USD",
    daysLeft: 1,
  },
  {
    id: "notion",
    icon: icons.notion,
    name: "Notion",
    price: 8.0,
    currency: "USD",
    daysLeft: 3,
  },
  {
    id: "figma",
    icon: icons.figma,
    name: "Figma",
    price: 12.0,
    currency: "USD",
    daysLeft: 5,
  },
];

export const HOME_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "adobe-creative-cloud",
    icon: icons.adobe,
    name: "Adobe Creative Cloud",
    plan: "Individual Plan",
    category: "Design",
    paymentMethod: "Visa ending in 4421",
    status: "active",
    startDate: "2025-04-10T10:00:00.000Z",
    price: 59.99,
    currency: "USD",
    billing: "Monthly",
    renewalDate: "2026-05-10T10:00:00.000Z",
    color: "#FFE9A9",
  },
  {
    id: "github-pro",
    icon: icons.github,
    name: "GitHub Pro",
    plan: "Developer Plan",
    category: "Developer Tools",
    paymentMethod: "Mastercard ending in 9832",
    status: "active",
    startDate: "2024-12-01T10:00:00.000Z",
    price: 9.99,
    currency: "USD",
    billing: "Monthly",
    renewalDate: "2026-05-01T10:00:00.000Z",
    color: "#ECCBAC",
  },
  {
    id: "chatgpt-plus",
    icon: icons.claude, // kept as requested
    name: "ChatGPT Plus",
    plan: "Plus",
    category: "AI Tools",
    paymentMethod: "Sadapay ending in 1123",
    status: "active",
    startDate: "2025-07-15T10:00:00.000Z",
    price: 20.0,
    currency: "USD",
    billing: "Monthly",
    renewalDate: "2026-05-15T10:00:00.000Z",
    color: "#E6D4EA", // soft green (AI / OpenAI vibe)
  },
  {
    id: "canva-pro",
    icon: icons.canva,
    name: "Canva Pro",
    plan: "Yearly",
    category: "Design",
    paymentMethod: "Visa ending in 7784",
    status: "cancelled",
    startDate: "2024-05-01T10:00:00.000Z",
    price: 109.99,
    currency: "USD",
    billing: "Yearly",
    renewalDate: "2026-05-01T10:00:00.000Z",
    color: "#E7C7F4", // soft teal (Canva feel)
  },
];
