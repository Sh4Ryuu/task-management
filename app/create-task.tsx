import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Calendar, Flag, Link2, X } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useProjects } from "@/hooks/useProjectStore";
import { Priority, TaskStatus } from "@/types/project";

const TASK_PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#10b981" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function CreateTaskScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { addTask, getProject } = useProjects();
  const project = getProject(projectId!);
  
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  
  // Initialize startDate to be at least the project start date
  const getInitialStartDate = () => {
    if (!project) return new Date().toISOString().split("T")[0];
    const today = new Date();
    const projectStart = new Date(project.startDate);
    return new Date(
      Math.max(today.getTime(), projectStart.getTime())
    ).toISOString().split("T")[0];
  };
  
  const [startDate, setStartDate] = useState<string>(getInitialStartDate());
  const [endDate, setEndDate] = useState<string>("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [showDependencyPicker, setShowDependencyPicker] = useState(false);

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

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Project not found</Text>
      </SafeAreaView>
    );
  }

  // Get available tasks for dependencies (all tasks in the project except the current one being created)
  const availableTasks = project.tasks || [];

  const toggleDependency = (taskId: string) => {
    if (selectedDependencies.includes(taskId)) {
      setSelectedDependencies(selectedDependencies.filter((id) => id !== taskId));
    } else {
      setSelectedDependencies([...selectedDependencies, taskId]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    if (!endDate) {
      Alert.alert("Error", "Please select an end date");
      return;
    }

    // Validate task dates are within project date range
    const taskStartDate = new Date(startDate);
    const taskEndDate = new Date(endDate);
    const projectStartDate = new Date(project.startDate);
    const projectEndDate = new Date(project.endDate);

    if (taskStartDate < projectStartDate) {
      Alert.alert(
        "Error",
        `Task start date must be on or after the project start date (${project.startDate})`
      );
      return;
    }

    if (taskEndDate > projectEndDate) {
      Alert.alert(
        "Error",
        `Task end date must be on or before the project end date (${project.endDate})`
      );
      return;
    }

    if (taskEndDate <= taskStartDate) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    addTask(projectId!, {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      startDate,
      endDate,
      dependencies: selectedDependencies.length > 0 ? selectedDependencies : undefined,
      progress: status === "completed" ? 100 : 0,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[project.color, project.color + "80"]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Task</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.projectName}>{project.title}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
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
              <Text style={styles.label}>Start Date</Text>
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
                  value={new Date(startDate || project.startDate)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleStartDateChange}
                  minimumDate={new Date(project.startDate)}
                  maximumDate={new Date(project.endDate)}
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
                        : new Date(project.startDate)
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleEndDateChange}
                  minimumDate={new Date(startDate || project.startDate)}
                  maximumDate={new Date(project.endDate)}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dependencies</Text>
            {availableTasks.length > 0 && (
              <TouchableOpacity
                style={styles.addDependencyButton}
                onPress={() => setShowDependencyPicker(!showDependencyPicker)}
              >
                <Link2 size={16} color="#6366f1" />
                <Text style={styles.addDependencyText}>
                  {showDependencyPicker ? "Hide" : "Select"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {availableTasks.length === 0 ? (
            <Text style={styles.noDependenciesText}>
              No other tasks available in this project
            </Text>
          ) : (
            <>
              {selectedDependencies.length > 0 && (
                <View style={styles.selectedDependencies}>
                  {selectedDependencies.map((depId) => {
                    const depTask = availableTasks.find((t) => t.id === depId);
                    if (!depTask) return null;
                    return (
                      <View key={depId} style={styles.dependencyChip}>
                        <Text style={styles.dependencyChipText}>
                          {depTask.title}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleDependency(depId)}
                          style={styles.removeDependencyButton}
                        >
                          <X size={14} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
              {showDependencyPicker && (
                <View style={styles.dependencyList}>
                  {availableTasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.dependencyItem,
                        selectedDependencies.includes(task.id) &&
                          styles.selectedDependencyItem,
                      ]}
                      onPress={() => toggleDependency(task.id)}
                    >
                      <View
                        style={[
                          styles.dependencyCheckbox,
                          selectedDependencies.includes(task.id) &&
                            styles.checkedDependencyCheckbox,
                        ]}
                      >
                        {selectedDependencies.includes(task.id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.dependencyItemText,
                          selectedDependencies.includes(task.id) &&
                            styles.selectedDependencyItemText,
                        ]}
                      >
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityContainer}>
            {TASK_PRIORITIES.map((priorityOption) => (
              <TouchableOpacity
                key={priorityOption.value}
                style={[
                  styles.priorityButton,
                  priority === priorityOption.value && {
                    backgroundColor: priorityOption.color,
                    borderColor: priorityOption.color,
                  },
                ]}
                onPress={() => setPriority(priorityOption.value)}
              >
                <Flag
                  size={16}
                  color={
                    priority === priorityOption.value
                      ? "white"
                      : priorityOption.color
                  }
                />
                <Text
                  style={[
                    styles.priorityText,
                    priority === priorityOption.value &&
                      styles.activePriorityText,
                  ]}
                >
                  {priorityOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            {TASK_STATUSES.map((statusOption) => (
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
    marginBottom: 8,
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
  projectName: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
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
  priorityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  priorityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 6,
  },
  activePriorityText: {
    color: "white",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addDependencyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eef2ff",
    borderRadius: 8,
  },
  addDependencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
    marginLeft: 4,
  },
  noDependenciesText: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  selectedDependencies: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  dependencyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  dependencyChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6366f1",
    marginRight: 6,
  },
  removeDependencyButton: {
    padding: 2,
  },
  dependencyList: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 200,
  },
  dependencyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedDependencyItem: {
    backgroundColor: "#eef2ff",
  },
  dependencyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedDependencyCheckbox: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  dependencyItemText: {
    fontSize: 14,
    color: "#1f2937",
    flex: 1,
  },
  selectedDependencyItemText: {
    color: "#6366f1",
    fontWeight: "600",
  },
});
