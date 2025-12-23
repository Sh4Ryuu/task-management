import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Bell,
  Palette,
  Download,
  Share,
  HelpCircle,
  ChevronRight,
  Star,
  Shield,
} from "lucide-react-native";

export default function SettingsScreen() {
  const settingsItems = [
    {
      icon: User,
      title: "Profile",
      subtitle: "Manage your account",
      onPress: () => {},
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Push notifications, email alerts",
      onPress: () => {},
    },
    {
      icon: Palette,
      title: "Appearance",
      subtitle: "Theme, colors, layout",
      onPress: () => {},
    },
    {
      icon: Download,
      title: "Export Data",
      subtitle: "Download your projects",
      onPress: () => {},
    },
    {
      icon: Share,
      title: "Share App",
      subtitle: "Tell your friends",
      onPress: () => {},
    },
    {
      icon: Star,
      title: "Rate App",
      subtitle: "Leave a review",
      onPress: () => {},
    },
    {
      icon: Shield,
      title: "Privacy",
      subtitle: "Data protection settings",
      onPress: () => {},
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "FAQs, contact us",
      onPress: () => {},
    },
  ];

  const renderSettingItem = (
    item: (typeof settingsItems)[0],
    index: number,
  ) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <item.icon size={20} color="#6366f1" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>General</Text>
          {settingsItems.slice(0, 4).map(renderSettingItem)}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Social</Text>
          {settingsItems.slice(4, 6).map(renderSettingItem)}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {settingsItems.slice(6).map(renderSettingItem)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginTop: -15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
});
