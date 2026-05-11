import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/lib/subscriptions";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";

import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) => {
      const searchableFields = [
        subscription.name,
        subscription.plan,
        subscription.category,
      ];
      return searchableFields.some((field) =>
        field?.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [searchQuery, subscriptions]);

  useEffect(() => {
    if (
      expandedSubId &&
      !filteredSubscriptions.some(
        (subscription) => subscription.id === expandedSubId,
      )
    ) {
      setExpandedSubId(null);
    }
  }, [expandedSubId, filteredSubscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedSubId((currentId) => (currentId === item.id ? null : item.id));
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-12">
      <Text className="text-3xl font-bold text-foreground">
        My Subscriptions
      </Text>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search subscriptions"
        placeholderTextColor="#8b8b8b"
        className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={{ paddingHorizontal: 16 }}
      />

      <FlatList
        className="mt-4"
        data={filteredSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        ListEmptyComponent={
          <Text className="home-empty-state">
            {searchQuery.trim()
              ? "No subscriptions found for your search."
              : "No subscriptions yet."}
          </Text>
        }
        extraData={{ expandedSubId, searchQuery }}
        contentContainerClassName="pb-14"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
