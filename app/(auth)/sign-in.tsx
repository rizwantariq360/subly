import { Link } from "expo-router";
import { styled } from "nativewind";

import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>SignIn</Text>
      <Link href="/(tabs)" className="mt-5 text-black bg-primary p-4">
        Tabs
      </Link>
    </SafeAreaView>
  );
};

export default SignIn;
