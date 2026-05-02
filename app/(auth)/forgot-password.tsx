import { useClerk, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
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
const emailPattern = /^\S+@\S+\.\S+$/;

type AuthFormErrors = Partial<{
  emailAddress: string;
  code: string;
  password: string;
  confirmPassword: string;
}>;

const ForgotPassword = () => {
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<AuthFormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stage, setStage] = useState<"email" | "code" | "password">("email");

  const isBusy = fetchStatus === "fetching";

  const handleEmailChange = (value: string) => {
    setEmailAddress(value);
    setFormErrors((current) => ({ ...current, emailAddress: undefined }));
    setGeneralError("");
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setFormErrors((current) => ({ ...current, code: undefined }));
    setGeneralError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFormErrors((current) => ({ ...current, password: undefined }));
    setGeneralError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setFormErrors((current) => ({ ...current, confirmPassword: undefined }));
    setGeneralError("");
  };

  const requestReset = async () => {
    setGeneralError("");
    const trimmedEmail = emailAddress.trim();
    const fieldErrors: AuthFormErrors = {};

    if (!trimmedEmail) {
      fieldErrors.emailAddress = "Enter your email.";
    } else if (!emailPattern.test(trimmedEmail)) {
      fieldErrors.emailAddress = "Enter a valid email.";
    }

    setFormErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const { error } = await signIn.create({ identifier: trimmedEmail });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to start password reset.",
      );
      return;
    }

    const { error: prepareError } =
      await signIn.resetPasswordEmailCode.sendCode();

    if (prepareError) {
      setGeneralError(
        prepareError.longMessage ??
          prepareError.message ??
          "Unable to send reset code.",
      );
      return;
    }

    setStage("code");
  };

  const verifyResetCode = async () => {
    setGeneralError("");
    if (!code.trim()) {
      setFormErrors({ code: "Enter your verification code." });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: code.trim(),
    });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to verify code.",
      );
      return;
    }

    if (signIn.status !== "needs_new_password") {
      setGeneralError(
        "The reset code was accepted, but the flow did not continue.",
      );
      return;
    }

    setStage("password");
  };

  const submitNewPassword = async () => {
    setGeneralError("");
    const fieldErrors: AuthFormErrors = {};

    if (!password.trim()) {
      fieldErrors.password = "Enter your new password.";
    } else if (password.length < 8) {
      fieldErrors.password = "Use at least 8 characters.";
    }

    if (!confirmPassword.trim()) {
      fieldErrors.confirmPassword = "Confirm your new password.";
    } else if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords must match.";
    }

    setFormErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
    });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to update your password.",
      );
      return;
    }

    if (signIn.status === "complete") {
      await setActive({
        session: signIn.createdSessionId!,
      });

      router.replace("/(tabs)");
      return;
    }

    setGeneralError("Password was updated but sign in could not be completed.");
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Subly</Text>
                  <Text className="auth-wordmark-sub">smart billing</Text>
                </View>
              </View>
              <Text className="auth-title">Reset your password</Text>
              <Text className="auth-subtitle">
                Enter your email to receive a reset code, then set a new
                password.
              </Text>
            </View>

            <View className="auth-card">
              {stage === "email" && (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className="auth-input"
                      value={emailAddress}
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="Enter your email"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={handleEmailChange}
                      keyboardType="email-address"
                      style={{ paddingHorizontal: 16 }}
                    />
                    {formErrors.emailAddress ? (
                      <Text className="auth-error">
                        {formErrors.emailAddress}
                      </Text>
                    ) : null}
                  </View>

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}

                  <Pressable
                    className={
                      "auth-button" +
                      (!emailAddress || isBusy ? " auth-button-disabled" : "")
                    }
                    onPress={requestReset}
                    disabled={!emailAddress || isBusy}
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <Text className="auth-button-text">Send reset link</Text>
                    )}
                  </Pressable>
                </View>
              )}

              {stage === "code" && (
                <View className="auth-form">
                  <Text className="auth-helper">
                    A verification code was sent to your email.
                  </Text>

                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter the code"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={handleCodeChange}
                      keyboardType="numeric"
                      style={{ paddingHorizontal: 16 }}
                    />
                    {formErrors.code ? (
                      <Text className="auth-error">{formErrors.code}</Text>
                    ) : null}
                  </View>

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}

                  <Pressable
                    className={
                      "auth-button" +
                      (!code || isBusy ? " auth-button-disabled" : "")
                    }
                    onPress={verifyResetCode}
                    disabled={!code || isBusy}
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <Text className="auth-button-text">Verify code</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={requestReset}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              )}

              {stage === "password" && (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">New password</Text>
                    <View className="relative">
                      <TextInput
                        className="auth-input pr-12"
                        value={password}
                        placeholder="Enter new password"
                        placeholderTextColor="#8b8b8b"
                        secureTextEntry={!showPassword}
                        onChangeText={handlePasswordChange}
                        style={{ paddingHorizontal: 16 }}
                      />
                      <Pressable
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#8b8b8b"
                        />
                      </Pressable>
                    </View>
                    {formErrors.password ? (
                      <Text className="auth-error">{formErrors.password}</Text>
                    ) : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Confirm password</Text>
                    <View className="relative">
                      <TextInput
                        className="auth-input pr-12"
                        value={confirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor="#8b8b8b"
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        style={{ paddingHorizontal: 16 }}
                      />
                      <Pressable
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#8b8b8b"
                        />
                      </Pressable>
                    </View>
                    {formErrors.confirmPassword ? (
                      <Text className="auth-error">
                        {formErrors.confirmPassword}
                      </Text>
                    ) : null}
                  </View>

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}

                  <Pressable
                    className={
                      "auth-button" +
                      (!password || !confirmPassword || isBusy
                        ? " auth-button-disabled"
                        : "")
                    }
                    onPress={submitNewPassword}
                    disabled={!password || !confirmPassword || isBusy}
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <Text className="auth-button-text">Set new password</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Remembered it?</Text>
              <Link href="/sign-in" className="auth-link">
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
