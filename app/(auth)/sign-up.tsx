import { useClerk, useSignUp } from "@clerk/expo";
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

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFinalize = async () => {
    await setActive({
      session: signUp.createdSessionId,
    });

    router.replace("/(tabs)");
  };

  const handleSubmit = async () => {
    setGeneralError("");
    const fieldErrors: Record<string, string> = {};

    if (!emailAddress.trim()) {
      fieldErrors.emailAddress = "Enter your email.";
    }

    if (!password.trim()) {
      fieldErrors.password = "Enter your password.";
    } else if (password.length < 8) {
      fieldErrors.password = "Use at least 8 characters.";
    }

    if (!confirmPassword.trim()) {
      fieldErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords must match.";
    }

    setFormErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to create your account.",
      );
      return;
    }

    if (signUp.status === "missing_requirements") {
      await signUp.verifications.sendEmailCode();
      return;
    }

    if (signUp.status === "complete" && signUp.createdSessionId) {
      await handleFinalize();
      return;
    }

    setGeneralError("Unable to continue. Please try again.");
  };

  const handleVerify = async () => {
    setGeneralError("");

    if (!code.trim()) {
      setFormErrors({ code: "Enter the verification code." });
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to verify your email.",
      );
      return;
    }

    if (signUp.status === "complete" && signUp.createdSessionId) {
      await handleFinalize();
      return;
    }

    setGeneralError("Verification could not be completed. Please try again.");
  };

  const isVerifyingEmail =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address");

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
              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Get started managing subscriptions in one secure place.
              </Text>
            </View>

            <View className="auth-card">
              {isVerifyingEmail ? (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter the code"
                      placeholderTextColor="#8b8b8b"
                      onChangeText={setCode}
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
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
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
                      onChangeText={setEmailAddress}
                      keyboardType="email-address"
                      style={{ paddingHorizontal: 16 }}
                    />
                    {(errors.fields.emailAddress ||
                      formErrors.emailAddress) && (
                      <Text className="auth-error">
                        {errors.fields.emailAddress?.message ??
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
                        onChangeText={setPassword}
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

                  <View className="auth-field">
                    <Text className="auth-label">Confirm password</Text>
                    <View className="relative">
                      <TextInput
                        className="auth-input pr-12"
                        value={confirmPassword}
                        placeholder="Confirm your password"
                        placeholderTextColor="#8b8b8b"
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={setConfirmPassword}
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
                      (!emailAddress ||
                      !password ||
                      !confirmPassword ||
                      fetchStatus === "fetching"
                        ? " auth-button-disabled"
                        : "")
                    }
                    onPress={handleSubmit}
                    disabled={
                      !emailAddress.trim() ||
                      !password.trim() ||
                      !confirmPassword.trim() ||
                      fetchStatus === "fetching"
                    }
                  >
                    {fetchStatus === "fetching" ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <Text className="auth-button-text">Create account</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/sign-in" className="auth-link">
                Sign in
              </Link>
            </View>
            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
