import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import images from "@/constants/images";
import { spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { Plus } from "lucide-react-native";
import { styled } from "nativewind";
import { useState } from "react";

import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Home = () => {
  const { colors } = useAppTheme();
  const { user } = useUser();
  const posthog = usePostHog();
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubId !== item.id;
    setExpandedSubId((currentId) => (currentId === item.id ? null : item.id));
    if (isExpanding) {
      posthog.capture("subscription_card_expanded", {
        subscription_id: item.id,
        subscription_name: item.name,
      });
    }
  };

  const handleAddPress = () => {
    posthog.capture("subscription_add_tapped");
  };

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";
  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-12">
      <View>
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image
                    source={
                      user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                    }
                    className="home-avatar"
                  />
                  <Text className="home-user-name">{displayName}</Text>
                </View>
                <TouchableOpacity className="home-add-icon" onPress={handleAddPress}>
                  <Plus size={spacing[5]} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                  </Text>
                </View>
              </View>
              <View className="mb-2.5">
                <ListHeading title="Upcoming" />
                <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard data={item} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text className="home-empty-state">
                      No Upcoming renewals yet.
                    </Text>
                  }
                />
              </View>
              <ListHeading title="All Subscription" />
            </>
          )}
          data={HOME_SUBSCRIPTIONS}
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
            <Text className="home-empty-state">No Subscriptions yet.</Text>
          }
          extraData={expandedSubId}
          contentContainerClassName="pb-14"
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;
