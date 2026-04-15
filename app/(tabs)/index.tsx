import { styled } from "nativewind";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Home = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-6xl font-sans-extrabold text-primary">Home</Text>
      <Text className="text-6xl font-extrabold text-primary">Home</Text>
    </SafeAreaView>
  );
};

export default Home;
