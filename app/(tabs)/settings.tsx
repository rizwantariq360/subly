import { useClerk } from "@clerk/expo";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const posthog = usePostHog();

  const handleSignOut = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="mb-5">
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
        <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
          Manage your account and access.
        </Text>
      </View>

      <Pressable className="auth-button" onPress={handleSignOut}>
        <Text className="auth-button-text">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
