import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>SubscriptionsDetails: {id}</Text>
    </View>
  );
};

export default SubscriptionsDetails;
