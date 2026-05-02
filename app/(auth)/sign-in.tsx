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
  password: string;
  code: string;
}>;

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { setActive } = useClerk();

  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formErrors, setFormErrors] = useState<AuthFormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleFinalize = async () => {
    await setActive({
      session: signIn.createdSessionId!,
    });

    router.replace("/(tabs)");
  };

  const clearFieldError = (field: keyof AuthFormErrors) => {
    setFormErrors((current) => ({ ...current, [field]: undefined }));
    setGeneralError("");
  };

  const handleEmailChange = (value: string) => {
    setEmailAddress(value);
    clearFieldError("emailAddress");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearFieldError("password");
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    clearFieldError("code");
  };

  const handleSubmit = async () => {
    setGeneralError("");
    const fieldErrors: AuthFormErrors = {};
    const trimmedEmail = emailAddress.trim();

    if (!trimmedEmail) {
      fieldErrors.emailAddress = "Enter your email.";
    } else if (!emailPattern.test(trimmedEmail)) {
      fieldErrors.emailAddress = "Enter a valid email.";
    }

    if (!password.trim()) {
      fieldErrors.password = "Enter your password.";
    }

    setFormErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const { error } = await signIn.password({
      emailAddress: trimmedEmail,
      password,
    });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to sign in.",
      );
      return;
    }

    if (signIn.status === "complete") {
      await handleFinalize();
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        return;
      }

      setGeneralError("Your account needs verification. Please try again.");
      return;
    }

    setGeneralError(
      "Unable to complete sign in. Please check your email and password.",
    );
  };

  const handleVerify = async () => {
    setGeneralError("");

    if (!code.trim()) {
      setFormErrors({ code: "Enter your code." });
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to verify code.",
      );
      return;
    }

    if (signIn.status === "complete") {
      await handleFinalize();
      return;
    }

    setGeneralError("Verification is not complete. Please try again.");
  };

  const clientTrustFlow = signIn.status === "needs_client_trust";
  const isBusy = fetchStatus === "fetching";

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
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions.
              </Text>
            </View>

            <View className="auth-card">
              {clientTrustFlow ? (
                <View className="auth-form">
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
                    {(errors.fields.code || formErrors.code) && (
                      <Text className="auth-error">
                        {errors.fields.code?.message ?? formErrors.code}
                      </Text>
                    )}
                  </View>

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}

                  <Pressable
                    className={
                      "auth-button" +
                      (fetchStatus === "fetching"
                        ? " auth-button-disabled"
                        : "")
                    }
                    onPress={handleVerify}
                    disabled={fetchStatus === "fetching"}
                  >
                    {fetchStatus === "fetching" ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <Text className="auth-button-text">Verify code</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.mfa.sendEmailCode()}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.reset()}
                  >
                    <Text className="auth-secondary-button-text">
                      Start over
                    </Text>
                  </Pressable>
                </View>
              ) : (
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
                    {(errors.fields.identifier || formErrors.emailAddress) && (
                      <Text className="auth-error">
                        {errors.fields.identifier?.message ??
                          formErrors.emailAddress}
                      </Text>
                    )}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <View className="relative">
                      <TextInput
                        className="auth-input pr-12"
                        value={password}
                        placeholder="Enter your password"
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
                    {(errors.fields.password || formErrors.password) && (
                      <Text className="auth-error">
                        {errors.fields.password?.message ?? formErrors.password}
                      </Text>
                    )}
                  </View>

                  {generalError ? (
                    <Text className="auth-error">{generalError}</Text>
                  ) : null}

                  <Pressable
                    className={
                      "auth-button" +
                      (!emailAddress || !password || isBusy
                        ? " auth-button-disabled"
                        : "")
                    }
                    onPress={handleSubmit}
                    disabled={!emailAddress || !password || isBusy}
                  >
                    {fetchStatus === "fetching" ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <Text className="auth-button-text">Sign in</Text>
                    )}
                  </Pressable>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">
                      Forgot your password?
                    </Text>
                    <Link href="/forgot-password" className="auth-link">
                      Reset it here
                    </Link>
                  </View>
                </View>
              )}
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Subly?</Text>
              <Link href="/sign-up" className="auth-link">
                Create an account
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
