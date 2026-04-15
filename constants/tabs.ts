import { Activity, House, Settings, Wallet } from "lucide-react-native";

export const tabs: AppTab[] = [
  { name: "index", title: "Home", icon: House },
  { name: "subscriptions", title: "Subscriptions", icon: Wallet },
  { name: "insights", title: "Insights", icon: Activity },
  { name: "settings", title: "Settings", icon: Settings },
];
