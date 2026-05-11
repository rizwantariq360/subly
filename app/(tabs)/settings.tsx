import { useAppTheme } from "@/hooks/use-app-theme";
import { useClerk, useUser } from "@clerk/expo";
import { clsx } from "clsx";
import * as ImagePicker from "expo-image-picker";
import { LogOut } from "lucide-react-native";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const MIN_PASSWORD_LENGTH = 8;
const sectionCardClassName =
  "mt-5 rounded-3xl border border-border bg-card p-5";
const sectionButtonClassName = "mt-5 items-center rounded-2xl bg-accent py-3";
const sectionButtonDisabledClassName = "bg-accent/45";

const splitFullName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
};

const getInitials = (fullName: string, email: string) => {
  const source = fullName.trim() || email.trim();
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      errors?: { longMessage?: string; message?: string }[];
      message?: string;
    };

    const apiMessage =
      maybeError.errors?.[0]?.longMessage ?? maybeError.errors?.[0]?.message;
    if (apiMessage) {
      return apiMessage;
    }

    if (maybeError.message) {
      return maybeError.message;
    }
  }

  return fallback;
};

const Settings = () => {
  const { colors } = useAppTheme();
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const posthog = usePostHog();

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(
      user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" "),
    );
  }, [user]);

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "";
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";
  const initials = useMemo(
    () => getInitials(displayName, userEmail),
    [displayName, userEmail],
  );

  const canSaveName = fullName.trim().length > 0 && !isSavingName && isLoaded;
  const canSavePassword =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= MIN_PASSWORD_LENGTH &&
    !isSavingPassword &&
    isLoaded;

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSaveName = async () => {
    setNameError("");
    setNameSuccess("");

    if (!user) {
      setNameError("User profile is not ready yet.");
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setNameError("Name cannot be empty.");
      return;
    }

    const { firstName, lastName } = splitFullName(trimmedName);

    try {
      setIsSavingName(true);
      await user.update({ firstName, lastName: lastName || null });
      setNameSuccess("Name updated successfully.");
    } catch (error) {
      setNameError(getErrorMessage(error, "Unable to update your name."));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdateAvatar = async () => {
    setAvatarError("");
    setAvatarSuccess("");

    if (!user) {
      setAvatarError("User profile is not ready yet.");
      return;
    }

    try {
      setIsSavingAvatar(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setAvatarError("Please allow photo library access to update avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || `avatar-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || "image/jpeg";

      await user.setProfileImage({
        file: {
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        } as unknown as File,
      });

      setAvatarSuccess("Avatar updated successfully.");
    } catch (error) {
      setAvatarError(getErrorMessage(error, "Unable to update avatar."));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!user) {
      setPasswordError("User profile is not ready yet.");
      return;
    }

    if (!currentPassword.trim()) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (newPassword.trim().length < MIN_PASSWORD_LENGTH) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    try {
      setIsSavingPassword(true);
      await user.updatePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        signOutOfOtherSessions: false,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess("Password changed successfully.");
    } catch (error) {
      setPasswordError(getErrorMessage(error, "Unable to update password."));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 64 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content">
            <View className="mb-5 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-3xl font-sans-bold text-primary">
                  Settings
                </Text>
                <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
                  Manage your profile and account security.
                </Text>
              </View>
              <Pressable
                className={clsx(
                  "h-12 w-12 items-center justify-center rounded-full border border-border bg-card",
                  (isSigningOut || !isLoaded) && "opacity-50",
                )}
                onPress={handleSignOut}
                disabled={isSigningOut || !isLoaded}
              >
                {isSigningOut ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <LogOut size={20} color={colors.primary} />
                )}
              </Pressable>
            </View>

            <View className="auth-card profile-card">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-24 w-24 rounded-full"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <Text className="text-2xl font-sans-bold text-primary">
                    {initials}
                  </Text>
                </View>
              )}
              <View className="profile-details">
                <Text className="text-xl font-sans-bold text-primary">
                  {displayName}
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {userEmail || "No email available"}
                </Text>
              </View>
            </View>

            <View className={sectionCardClassName}>
              <Text className="text-xl font-sans-bold text-primary">
                Update Name
              </Text>
              <View className="mt-4 auth-field">
                <Text className="auth-label">Full Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    nameError && "auth-input-error",
                  )}
                  value={fullName}
                  onChangeText={(value) => {
                    setFullName(value);
                    setNameError("");
                    setNameSuccess("");
                  }}
                  editable={!isSavingName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8b8b8b"
                  style={{ paddingHorizontal: 16 }}
                />
                {nameError ? (
                  <Text className="auth-error">{nameError}</Text>
                ) : null}
                {nameSuccess ? (
                  <Text className="text-sm font-sans-medium text-success">
                    {nameSuccess}
                  </Text>
                ) : null}
              </View>

              <Pressable
                className={clsx(
                  sectionButtonClassName,
                  !canSaveName && sectionButtonDisabledClassName,
                )}
                onPress={handleSaveName}
                disabled={!canSaveName}
              >
                {isSavingName ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text className="auth-button-text">Save Name</Text>
                )}
              </Pressable>
            </View>

            <View className={sectionCardClassName}>
              <Text className="text-xl font-sans-bold text-primary">
                Update Avatar
              </Text>
              <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
                Upload a new profile photo.
              </Text>
              {avatarError ? (
                <Text className="mt-4 auth-error">{avatarError}</Text>
              ) : null}
              {avatarSuccess ? (
                <Text className="mt-4 text-sm font-sans-medium text-success">
                  {avatarSuccess}
                </Text>
              ) : null}
              <Pressable
                className={clsx(
                  sectionButtonClassName,
                  (isSavingAvatar || !isLoaded) &&
                    sectionButtonDisabledClassName,
                )}
                onPress={handleUpdateAvatar}
                disabled={isSavingAvatar || !isLoaded}
              >
                {isSavingAvatar ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text className="auth-button-text">Choose Image</Text>
                )}
              </Pressable>
            </View>

            <View className={sectionCardClassName}>
              <Text className="text-xl font-sans-bold text-primary">
                Change Password
              </Text>
              <View className="mt-4 auth-field">
                <Text className="auth-label">Current Password</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    passwordError && "auth-input-error",
                  )}
                  value={currentPassword}
                  onChangeText={(value) => {
                    setCurrentPassword(value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  secureTextEntry
                  editable={!isSavingPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#8b8b8b"
                  style={{ paddingHorizontal: 16 }}
                />
              </View>
              <View className="mt-4 auth-field">
                <Text className="auth-label">New Password</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    passwordError && "auth-input-error",
                  )}
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  secureTextEntry
                  editable={!isSavingPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#8b8b8b"
                  style={{ paddingHorizontal: 16 }}
                />
              </View>

              {passwordError ? (
                <Text className="mt-2 auth-error">{passwordError}</Text>
              ) : null}
              {passwordSuccess ? (
                <Text className="mt-2 text-sm font-sans-medium text-success">
                  {passwordSuccess}
                </Text>
              ) : null}

              <Pressable
                className={clsx(
                  sectionButtonClassName,
                  !canSavePassword && sectionButtonDisabledClassName,
                )}
                onPress={handleChangePassword}
                disabled={!canSavePassword}
              >
                {isSavingPassword ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text className="auth-button-text">Save Password</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Settings;
