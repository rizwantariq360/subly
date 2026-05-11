import { icons } from "@/constants/icons";
import { useAppTheme } from "@/hooks/use-app-theme";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export const CATEGORY_COLORS = {
  "AI & Automation": "#E6D4EA",
  Productivity: "#D4EDDA",
  "Developer & DevOps": "#ECCBAC",
  "Design & Creativity": "#E7C7F4",
  Entertainment: "#FFE9A9",
  "Music & Audio": "#F8D7DA",
  "Video & Streaming": "#FFD6A5",
  Education: "#CDE7BE",
  Business: "#D6EAF8",
  Finance: "#D5F5E3",
  "Health & Fitness": "#FADBD8",
  Gaming: "#D2B4DE",
  "Security & Privacy": "#AED6F1",
  "Cloud & Storage": "#D1ECF1",
  Communication: "#F9E79F",
  Marketing: "#F5CBA7",
  Analytics: "#A9DFBF",
  "Writing & Publishing": "#F5EEF8",
  Lifestyle: "#FDEDEC",
  Utilities: "#FCF3CF",
  Other: "#EAECEE",
} as const;

export const CATEGORIES = [
  "AI & Automation",
  "Productivity",
  "Education",
  "Business",
  "Gaming",
  "Developer & DevOps",
  "Finance",
  "Design & Creativity",
  "Entertainment",
  "Music & Audio",
  "Video & Streaming",
  "Health & Fitness",
  "Security & Privacy",
  "Cloud & Storage",
  "Communication",
  "Marketing",
  "Analytics",
  "Writing & Publishing",
  "Lifestyle",
  "Utilities",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];
type Frequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

interface FormData {
  name: string;
  price: string;
  frequency: Frequency;
  category: Category | null;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) => {
  const { colors } = useAppTheme();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "",
    frequency: "Monthly",
    category: null,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      frequency: "Monthly",
      category: null,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const parsePriceValue = (value: string) => {
    const normalized = value.trim();
    const validPricePattern = /^\d+(?:\.\d{1,2})?$/;
    if (!validPricePattern.test(normalized)) {
      return undefined;
    }

    const parsed = Number(normalized);
    return parsed > 0 ? parsed : undefined;
  };

  const isFormValid = () => {
    const nameValid = formData.name.trim().length > 0;
    const priceValid = parsePriceValue(formData.price) !== undefined;
    const categoryValid = formData.category !== null;
    return nameValid && priceValid && categoryValid;
  };

  const handleSubmit = () => {
    const priceValue = parsePriceValue(formData.price);
    if (!isFormValid() || priceValue === undefined) return;

    const now = dayjs();
    const renewalDate =
      formData.frequency === "Monthly"
        ? now.add(1, "month")
        : now.add(1, "year");

    const subscription: Subscription = {
      id: `subscription-${Date.now()}`,
      icon: icons.wallet,
      name: formData.name.trim(),
      category: formData.category!,
      status: "active",
      startDate: now.toISOString(),
      price: priceValue,
      currency: "USD",
      billing: formData.frequency,
      renewalDate: renewalDate.toISOString(),
      color: CATEGORY_COLORS[formData.category!],
    };

    onSubmit(subscription);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={handleClose}
    >
      <View className="modal-overlay">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <X size={20} color={colors.primary} />
              </Pressable>
            </View>

            <ScrollView
              className="modal-body"
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-6 pb-10">
                {/* Name Field */}
                <View className="gap-2">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className="auth-input"
                    value={formData.name}
                    placeholder="Enter subscription name"
                    placeholderTextColor="#8b8b8b"
                    onChangeText={(value) =>
                      setFormData((prev) => ({ ...prev, name: value }))
                    }
                    style={{ paddingHorizontal: 16 }}
                  />
                </View>

                {/* Price Field */}
                <View className="gap-2">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    className="auth-input"
                    value={formData.price}
                    placeholder="0.00"
                    placeholderTextColor="#8b8b8b"
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      setFormData((prev) => ({ ...prev, price: value }))
                    }
                    style={{ paddingHorizontal: 16 }}
                  />
                </View>

                {/* Frequency Field */}
                <View className="gap-2">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {(["Monthly", "Yearly"] as const).map((freq) => (
                      <Pressable
                        key={freq}
                        className={clsx(
                          "picker-option",
                          formData.frequency === freq && "picker-option-active",
                        )}
                        onPress={() =>
                          setFormData((prev) => ({ ...prev, frequency: freq }))
                        }
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            formData.frequency === freq &&
                              "picker-option-text-active",
                          )}
                        >
                          {freq}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Category Field */}
                <View className="gap-2">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORIES.map((category) => (
                      <Pressable
                        key={category}
                        className={clsx(
                          "category-chip",
                          formData.category === category &&
                            "category-chip-active",
                        )}
                        onPress={() =>
                          setFormData((prev) => ({ ...prev, category }))
                        }
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            formData.category === category &&
                              "category-chip-text-active",
                          )}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Submit Button */}
                <Pressable
                  className={clsx(
                    "auth-button",
                    !isFormValid() && "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={!isFormValid()}
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
