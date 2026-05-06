import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router";

import "@/global.css";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useEffect, useRef } from "react";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function RootLayoutContent() {
  const { isLoaded: authLoaded } = useAuth();
  const [fontsLoaded] = useFonts({
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (authLoaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoaded]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded || !authLoaded) {
    return null;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
        <PostHogProvider
          client={posthog}
          autocapture={{
            captureScreens: false,
            captureTouches: true,
            propsToCapture: ["testID"],
          }}
        >
          <RootLayoutContent />
        </PostHogProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
