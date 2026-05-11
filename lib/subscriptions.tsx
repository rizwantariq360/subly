import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

const STORAGE_KEY = "SUBSCRIPTIONS_STORE";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => Promise<void>;
  getSubscriptions: () => Subscription[];
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | undefined>(
  undefined,
);

async function loadStoredSubscriptions(): Promise<Subscription[] | null> {
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as Subscription[];
  } catch {
    return null;
  }
}

async function persistSubscriptions(subscriptions: Subscription[]) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch {
    // ignore persistence failures
  }
}

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  useEffect(() => {
    let active = true;

    (async () => {
      const storedSubscriptions = await loadStoredSubscriptions();
      if (active && storedSubscriptions) {
        setSubscriptions(storedSubscriptions);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const addSubscription = useCallback(async (subscription: Subscription) => {
    setSubscriptions((currentSubscriptions) => {
      const nextSubscriptions = [subscription, ...currentSubscriptions];
      persistSubscriptions(nextSubscriptions);
      return nextSubscriptions;
    });
  }, []);

  const getSubscriptions = useCallback(() => subscriptions, [subscriptions]);

  const value = useMemo(
    () => ({ subscriptions, addSubscription, getSubscriptions }),
    [subscriptions, addSubscription, getSubscriptions],
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error("useSubscriptions must be used within SubscriptionsProvider");
  }
  return context;
}
