import { useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";

import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>SubscriptionsDetails: {id}</Text>
    </SafeAreaView>
  );
};

export default SubscriptionsDetails;
