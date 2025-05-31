import Badge from "@/src/components/badge";
import { deleteToken } from "@/src/services/token-service";
import { UserProgress } from "@/src/types/user-progress";
import { fetchWithAuth } from "@/src/utils/fetch-with-auth";
import { router } from "expo-router";
import {
  LogOut,
  Settings,
  User,
  Wifi,
  WifiHigh,
  WifiLow,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UserData {
  username: string;
  email: string;
  name: string;
  phone: string;
  [key: string]: any;
}

const Profile = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProgress = async () => {
    try {
      const res = await fetchWithAuth("/api/UserProgress");
      const data = await res.json();
      setUserProgress(data);
    } catch (error) {
      console.error("Failed to fetch user progress", error);
    }
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/User/my-profile");
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async () => {
    if (!userData) return;
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/User/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        setIsEditing(false);
        setShowEditModal(false);
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      deleteToken();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return "Beginner";
      case 1:
        return "Intermediate";
      case 2:
        return "Advanced";
      default:
        return "Unknown";
    }
  };

  const getLevelIcon = (level: number) => {
    const iconProps = {
      size: 40,
      color: "#2563eb",
      style: { transform: [{ rotate: "-45deg" }] },
    };
    switch (level) {
      case 0:
        return <WifiLow {...iconProps} />;
      case 1:
        return <WifiHigh {...iconProps} />;
      case 2:
        return <Wifi {...iconProps} />;
      default:
        return <WifiLow {...iconProps} />;
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.userIconWrapper}>
            <User size={40} color="white" />
          </View>
          <View>
            <Text style={styles.username}>
              {userProgress?.username ?? "..."}
            </Text>
            <Text style={styles.userHandle}>
              @{userProgress?.username ?? "..."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsCard}>
            <View style={styles.levelRow}>
              {userProgress && getLevelIcon(userProgress.level)}
              <Text style={styles.levelLabel}>
                {userProgress
                  ? getLevelLabel(userProgress.level)
                  : "Loading..."}
              </Text>
            </View>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>
                {userProgress?.totalXP ?? "..."}
              </Text>
              <Text style={styles.xpLabel}>Total XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesContainer}>
            {userProgress?.badges?.length ? (
              userProgress.badges.map((badge, index) => (
                <Badge key={index} id={badge.id} progress={badge.progress} />
              ))
            ) : (
              <Text style={styles.noBadgesText}>
                Looks like you don't have any badges yet.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View>
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => {
                setShowEditModal(true);
                fetchUserData();
              }}
            >
              <View style={styles.configButtonContent}>
                <View style={styles.configIconWrapper}>
                  <Settings size={40} color="#2563eb" />
                </View>
                <Text style={styles.configButtonText}>Edit Profile</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={styles.configButtonContent}>
                <View
                  style={[
                    styles.configIconWrapper,
                    { backgroundColor: "#fee2e2" },
                  ]}
                >
                  <LogOut size={40} color="#b91c1c" />
                </View>
                <Text style={[styles.configButtonText, { color: "#b91c1c" }]}>
                  Log out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Loading Spinner */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowEditModal(false);
          setIsEditing(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <ScrollView>
              {userData &&
                ["username", "email", "name", "phone"].map((field) => (
                  <View key={field} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Text>
                    <TextInput
                      style={[styles.input, !isEditing && styles.inputDisabled]}
                      editable={isEditing}
                      value={userData[field]}
                      onChangeText={(text) =>
                        setUserData((prev) =>
                          prev ? { ...prev, [field]: text } : null
                        )
                      }
                    />
                  </View>
                ))}
            </ScrollView>
            <View style={styles.modalButtonRow}>
              {!isEditing ? (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={[styles.modalButton, styles.editButton]}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    style={[styles.modalButton, styles.cancelButton]}
                  >
                    <Text style={styles.buttonTextDark}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={updateUserProfile}
                    style={[styles.modalButton, styles.saveButton]}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setIsEditing(false);
                }}
                style={[styles.modalButton, styles.closeButton]}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 300 }]}>
            <Text style={styles.modalTitle}>Log out</Text>
            <Text style={styles.logoutMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.buttonTextDark}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.modalButton, styles.logoutButton]}
              >
                <Text style={styles.buttonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    width: "100%",
    alignSelf: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1f2937", // gray-900
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  userIconWrapper: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
  },
  username: {
    fontWeight: "700",
    fontSize: 24,
    color: "#1f2937",
  },
  userHandle: {
    fontWeight: "500",
    color: "#6b7280", // gray-500
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 20,
    marginBottom: 16,
    color: "#1f2937",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 16,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  levelLabel: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1e40af", // blue-900
  },
  xpContainer: {
    marginLeft: "auto",
    alignItems: "center",
  },
  xpText: {
    fontWeight: "700",
    fontSize: 24,
    color: "#1e40af",
  },
  xpLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1e40af",
  },
  badgesContainer: {
    backgroundColor: "000000",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  noBadgesText: {
    fontWeight: "500",
    color: "#6b7280",
  },
  configButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  configButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  configIconWrapper: {
    backgroundColor: "#bfdbfe",
    padding: 12,
    borderRadius: 12,
  },
  configButtonText: {
    fontWeight: "600",
    fontSize: 18,
    color: "#2563eb",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1f2937",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  inputDisabled: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
    flexWrap: "wrap",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  closeButton: {
    backgroundColor: "#6b7280",
  },
  logoutButton: {
    backgroundColor: "#b91c1c",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  buttonTextDark: {
    color: "#1f2937",
    fontWeight: "600",
  },
  logoutMessage: {
    fontSize: 16,
    marginVertical: 12,
    color: "#374151",
  },
});

export default Profile;
