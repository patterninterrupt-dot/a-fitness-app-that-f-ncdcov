
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  SafeAreaView,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";

type Mode = "signin" | "signup";

// Helper to resolve image sources (handles both local require() and remote URLs)
function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function AuthScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, loading: authLoading } =
    useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const showModal = (title: string, message: string) => {
    setModal({ visible: true, title, message });
  };

  const hideModal = () => {
    setModal({ visible: false, title: '', message: '' });
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleEmailAuth = async () => {
    if (!email || !password) {
      showModal("Missing Fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        router.replace("/");
      } else {
        await signUpWithEmail(email, password, name);
        router.replace("/");
      }
    } catch (error: any) {
      showModal("Authentication Failed", error.message || "Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "apple") {
        await signInWithApple();
      }
      router.replace("/");
    } catch (error: any) {
      if (error.message !== "Authentication cancelled") {
        showModal("Sign In Failed", error.message || "Social authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const brandLogo = require('@/assets/images/73c0c96e-8497-4bac-8c89-5decec12a3cf.jpeg');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Error/Info Modal */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <Text style={styles.modalMessage}>{modal.message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Hero Gradient Header */}
          <LinearGradient
            colors={['#D91B7C', '#A0145A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Image 
              source={resolveImageSource(brandLogo)} 
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.heroSubtitle}>
              Ready is not a feeling, it&apos;s an action. You just took the first step by downloading this app, now take the next one and sign in below 👇
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            {/* Auth Card */}
            <View style={styles.card}>
              {/* Mode Toggle */}
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === "signin" && styles.modeButtonActive]}
                  onPress={() => setMode("signin")}
                  activeOpacity={0.8}
                >
                  {mode === "signin" && (
                    <LinearGradient
                      colors={['#D91B7C', '#A0145A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                      borderRadius={12}
                    />
                  )}
                  <Text style={[styles.modeButtonText, mode === "signin" && styles.modeButtonTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeButton, mode === "signup" && styles.modeButtonActive]}
                  onPress={() => setMode("signup")}
                  activeOpacity={0.8}
                >
                  {mode === "signup" && (
                    <LinearGradient
                      colors={['#D91B7C', '#A0145A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                      borderRadius={12}
                    />
                  )}
                  <Text style={[styles.modeButtonText, mode === "signup" && styles.modeButtonTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === "signup" && (
                <TextInput
                  style={styles.input}
                  placeholder="Your name (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.primaryButtonWrapper, loading && styles.buttonDisabled]}
                onPress={handleEmailAuth}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#D91B7C', '#A0145A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth("google")}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.socialButtonText}>🌐  Continue with Google</Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialAuth("apple")}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                     Continue with Apple
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.footerText}>
              By continuing, you agree to build consistency over intensity.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F7F7F9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  heroLogo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: "center",
    lineHeight: 24,
    fontWeight: '500',
  },
  content: {
    padding: 24,
    paddingTop: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    overflow: 'hidden',
  },
  modeButtonActive: {},
  modeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: colors.text,
  },
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButton: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  socialButton: {
    height: 54,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  socialButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
  },
  appleButton: {
    backgroundColor: "#0A0A0A",
    borderColor: "#0A0A0A",
  },
  appleButtonText: {
    color: "#fff",
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 36,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
