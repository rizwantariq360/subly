import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-extrabold text-success">
        Welcome to Nativewind! 🚀{" "}
      </Text>
      <Link href="/onboarding" className="mt-5 text-black bg-primary p-4">
        Onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="mt-5 text-black bg-primary p-4">
        Sign In
      </Link>
      <Link href="/(auth)/sign-up" className="mt-5 text-black bg-primary p-4">
        Sign Up
      </Link>

      <Link
        href={{
          pathname: "/(tabs)/subscriptions/[id]",
          params: { id: "google" },
        }}
        className="mt-5 text-black bg-primary p-4"
      >
        Google Param
      </Link>
    </View>
  );
}
