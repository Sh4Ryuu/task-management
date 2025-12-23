import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Calendar, Flag } from "lucide-react-native";
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
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState<string>("");

  const project = getProject(projectId!);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Project not found</Text>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!title.trim()) {
      console.log("Please enter a task title");
      return;
    }

    if (!endDate) {
      console.log("Please select an end date");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      console.log("End date must be after start date");
      return;
    }

    addTask(projectId!, {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      startDate,
      endDate,
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
              <TouchableOpacity style={styles.dateInput}>
                <Calendar size={16} color="#6b7280" />
                <TextInput
                  style={styles.dateTextInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Calendar size={16} color="#6b7280" />
                <TextInput
                  style={styles.dateTextInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>
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
  dateTextInput: {
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
});
