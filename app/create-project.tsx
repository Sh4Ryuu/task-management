import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Calendar, Palette } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useProjects } from "@/hooks/useProjectStore";
import { ProjectStatus } from "@/types/project";

const PROJECT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export default function CreateProjectScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addProject, updateProject, getProject } = useProjects();
  const isEditing = !!id;
  const existingProject = id ? getProject(id) : null;

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Load existing project data when editing
  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setDescription(existingProject.description || "");
      setStatus(existingProject.status);
      setStartDate(existingProject.startDate);
      setEndDate(existingProject.endDate);
      setSelectedColor(existingProject.color);
    }
  }, [existingProject]);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate.toISOString().split("T")[0]);
    }
    if (Platform.OS === "ios") {
      setShowStartDatePicker(false);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate.toISOString().split("T")[0]);
    }
    if (Platform.OS === "ios") {
      setShowEndDatePicker(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a project title");
      return;
    }

    if (!endDate) {
      Alert.alert("Error", "Please select an end date");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    if (isEditing && id) {
      updateProject(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        startDate,
        endDate,
        color: selectedColor,
      });
    } else {
      addProject({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        startDate,
        endDate,
        color: selectedColor,
        progress: 0,
      });
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[selectedColor, selectedColor + "80"]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Project" : "New Project"}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter project title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter project description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.dateText}>
                  {startDate || "Select date"}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={new Date(startDate || Date.now())}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.dateText}>
                  {endDate || "Select date"}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={
                    endDate
                      ? new Date(endDate)
                      : startDate
                        ? new Date(startDate)
                        : new Date()
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleEndDateChange}
                  minimumDate={new Date(startDate || Date.now())}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            {PROJECT_STATUSES.map((statusOption) => (
              <TouchableOpacity
                key={statusOption.value}
                style={[
                  styles.statusButton,
                  status === statusOption.value && styles.activeStatusButton,
                ]}
                onPress={() => setStatus(statusOption.value)}
              >
                <Text
                  style={[
                    styles.statusText,
                    status === statusOption.value && styles.activeStatusText,
                  ]}
                >
                  {statusOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Theme</Text>
          <View style={styles.colorContainer}>
            {PROJECT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Palette size={16} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 8,
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activeStatusButton: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeStatusText: {
    color: "white",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
