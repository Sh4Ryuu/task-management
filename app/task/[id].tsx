import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Flag,
  Clock,
  CheckCircle,
  Circle,
  Save,
} from "lucide-react-native";
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

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAllTasks, updateTask, projects } = useProjects();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [editedPriority, setEditedPriority] = useState<Priority>("medium");
  const [editedStatus, setEditedStatus] = useState<TaskStatus>("todo");

  const allTasks = getAllTasks();
  const task = allTasks.find((t) => t.id === id);
  const project = projects.find((p) => p.id === task?.projectId);

  if (!task || !project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Task not found</Text>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setEditedPriority(task.priority);
    setEditedStatus(task.status);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedTitle.trim()) {
      console.log("Please enter a task title");
      return;
    }

    updateTask(task.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim() || undefined,
      priority: editedPriority,
      status: editedStatus,
      progress:
        editedStatus === "completed"
          ? 100
          : editedStatus === "in-progress"
            ? 50
            : 0,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle size={24} color="#10b981" />;
      case "in-progress":
        return <Clock size={24} color="#f59e0b" />;
      default:
        return <Circle size={24} color="#6b7280" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    const priorityOption = TASK_PRIORITIES.find((p) => p.value === priority);
    return priorityOption?.color || "#6b7280";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue = () => {
    const today = new Date();
    const endDate = new Date(task.endDate);
    return endDate < today && task.status !== "completed";
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

          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save size={16} color="white" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Edit3 size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.projectName}>{project.title}</Text>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Task title"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          ) : (
            <Text style={styles.taskTitle}>{task.title}</Text>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Status</Text>
              <Text style={styles.statusValue}>
                {task.status.replace("-", " ")}
              </Text>
            </View>
            {isOverdue() && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${task.progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{task.progress}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Task description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.description}>
              {task.description || "No description provided"}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <Calendar size={20} color="#6b7280" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Start Date</Text>
                <Text style={styles.timelineValue}>
                  {formatDate(task.startDate)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <Calendar size={20} color="#6b7280" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>End Date</Text>
                <Text style={styles.timelineValue}>
                  {formatDate(task.endDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          {isEditing ? (
            <View style={styles.priorityContainer}>
              {TASK_PRIORITIES.map((priorityOption) => (
                <TouchableOpacity
                  key={priorityOption.value}
                  style={[
                    styles.priorityButton,
                    editedPriority === priorityOption.value && {
                      backgroundColor: priorityOption.color,
                      borderColor: priorityOption.color,
                    },
                  ]}
                  onPress={() => setEditedPriority(priorityOption.value)}
                >
                  <Flag
                    size={16}
                    color={
                      editedPriority === priorityOption.value
                        ? "white"
                        : priorityOption.color
                    }
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      editedPriority === priorityOption.value &&
                        styles.activePriorityText,
                    ]}
                  >
                    {priorityOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.priorityDisplay}>
              <Flag size={20} color={getPriorityColor(task.priority)} />
              <Text
                style={[
                  styles.priorityDisplayText,
                  { color: getPriorityColor(task.priority) },
                ]}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
                Priority
              </Text>
            </View>
          )}
        </View>

        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusContainer}>
              {TASK_STATUSES.map((statusOption) => (
                <TouchableOpacity
                  key={statusOption.value}
                  style={[
                    styles.statusButton,
                    editedStatus === statusOption.value &&
                      styles.activeStatusButton,
                  ]}
                  onPress={() => setEditedStatus(statusOption.value)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      editedStatus === statusOption.value &&
                        styles.activeStatusButtonText,
                    ]}
                  >
                    {statusOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 4,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  projectName: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 8,
    width: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginTop: -15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textTransform: "capitalize",
  },
  overdueBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    minWidth: 35,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
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
  timelineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timelineContent: {
    marginLeft: 12,
  },
  timelineLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  priorityDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },
  priorityDisplayText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeStatusButtonText: {
    color: "white",
  },
});
