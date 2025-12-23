import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
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
  Link2,
  X,
  Minus,
  Plus,
} from "lucide-react-native";
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

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAllTasks, updateTask, projects } = useProjects();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [editedPriority, setEditedPriority] = useState<Priority>("medium");
  const [editedStatus, setEditedStatus] = useState<TaskStatus>("todo");
  const [editedStartDate, setEditedStartDate] = useState<string>("");
  const [editedEndDate, setEditedEndDate] = useState<string>("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [editedDependencies, setEditedDependencies] = useState<string[]>([]);
  const [showDependencyPicker, setShowDependencyPicker] = useState(false);
  const [editedProgress, setEditedProgress] = useState<number>(0);

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
    setEditedProgress(task.progress);
    // Ensure dates are within project range (in case project dates changed)
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    setEditedStartDate(
      taskStart < projectStart
        ? project.startDate
        : taskStart > projectEnd
          ? project.endDate
          : task.startDate
    );
    setEditedEndDate(
      taskEnd > projectEnd
        ? project.endDate
        : taskEnd < projectStart
          ? project.startDate
          : task.endDate
    );
    setEditedDependencies(task.dependencies || []);
    setIsEditing(true);
  };

  // Get available tasks for dependencies (all tasks in the project except the current one)
  const availableTasks = project?.tasks.filter((t) => t.id !== task.id) || [];

  const toggleDependency = (taskId: string) => {
    if (editedDependencies.includes(taskId)) {
      setEditedDependencies(editedDependencies.filter((id) => id !== taskId));
    } else {
      setEditedDependencies([...editedDependencies, taskId]);
    }
  };

  const handleSave = () => {
    if (!editedTitle.trim()) {
      console.log("Please enter a task title");
      return;
    }

    // Validate task dates are within project date range
    const taskStartDate = new Date(editedStartDate);
    const taskEndDate = new Date(editedEndDate);
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

    // Calculate progress: if in-progress with dependencies, use auto-calculation, otherwise use manual progress
    let finalProgress = 0;
    if (editedStatus === "completed") {
      finalProgress = 100;
    } else if (editedStatus === "in-progress") {
      // If has dependencies, auto-calculation will happen in the store (pass 0 as placeholder)
      // Otherwise, use the manually set progress
      finalProgress = editedDependencies.length > 0 ? 0 : editedProgress;
    } else {
      finalProgress = 0;
    }

    updateTask(task.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim() || undefined,
      priority: editedPriority,
      status: editedStatus,
      startDate: editedStartDate,
      endDate: editedEndDate,
      dependencies: editedDependencies.length > 0 ? editedDependencies : undefined,
      progress: finalProgress,
    });

    setIsEditing(false);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setEditedStartDate(selectedDate.toISOString().split("T")[0]);
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
      setEditedEndDate(selectedDate.toISOString().split("T")[0]);
    }
    if (Platform.OS === "ios") {
      setShowEndDatePicker(false);
    }
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
          {isEditing ? (
            <View style={styles.timelineCard}>
              <TouchableOpacity
                style={styles.timelineItem}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Calendar size={20} color="#6b7280" />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Start Date</Text>
                  <Text style={styles.timelineValue}>
                    {editedStartDate
                      ? formatDate(editedStartDate)
                      : formatDate(task.startDate)}
                  </Text>
                </View>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={new Date(editedStartDate || task.startDate)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleStartDateChange}
                  minimumDate={new Date(project.startDate)}
                  maximumDate={new Date(project.endDate)}
                />
              )}
              <TouchableOpacity
                style={styles.timelineItem}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Calendar size={20} color="#6b7280" />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>End Date</Text>
                  <Text style={styles.timelineValue}>
                    {editedEndDate
                      ? formatDate(editedEndDate)
                      : formatDate(task.endDate)}
                  </Text>
                </View>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={new Date(editedEndDate || task.endDate)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleEndDateChange}
                  minimumDate={new Date(editedStartDate || task.startDate)}
                  maximumDate={new Date(project.endDate)}
                />
              )}
            </View>
          ) : (
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
          )}
        </View>

        {isEditing && (
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
                {editedDependencies.length > 0 && (
                  <View style={styles.selectedDependencies}>
                    {editedDependencies.map((depId) => {
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
                    {availableTasks.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.dependencyItem,
                          editedDependencies.includes(t.id) &&
                            styles.selectedDependencyItem,
                        ]}
                        onPress={() => toggleDependency(t.id)}
                      >
                        <View
                          style={[
                            styles.dependencyCheckbox,
                            editedDependencies.includes(t.id) &&
                              styles.checkedDependencyCheckbox,
                          ]}
                        >
                          {editedDependencies.includes(t.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.dependencyItemText,
                            editedDependencies.includes(t.id) &&
                              styles.selectedDependencyItemText,
                          ]}
                        >
                          {t.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {!isEditing && task.dependencies && task.dependencies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dependencies</Text>
            <View style={styles.dependenciesDisplay}>
              {task.dependencies.map((depId) => {
                const depTask = project?.tasks.find((t) => t.id === depId);
                if (!depTask) return null;
                return (
                  <View key={depId} style={styles.dependencyDisplayChip}>
                    <Link2 size={14} color="#6366f1" />
                    <Text style={styles.dependencyDisplayText}>
                      {depTask.title}
                    </Text>
                    <View
                      style={[
                        styles.dependencyStatusBadge,
                        {
                          backgroundColor:
                            depTask.status === "completed"
                              ? "#10b981"
                              : depTask.status === "in-progress"
                                ? "#f59e0b"
                                : "#6b7280",
                        },
                      ]}
                    >
                      <Text style={styles.dependencyStatusText}>
                        {depTask.status === "completed"
                          ? "Done"
                          : depTask.status === "in-progress"
                            ? "In Progress"
                            : "To Do"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

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
            {editedStatus === "in-progress" && editedDependencies.length === 0 && (
              <View style={styles.progressEditContainer}>
                <Text style={styles.progressLabel}>Progress: {editedProgress}%</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${editedProgress}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.progressControls}>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => setEditedProgress(Math.max(0, editedProgress - 5))}
                  >
                    <Minus size={20} color="#6366f1" />
                  </TouchableOpacity>
                  <View style={styles.progressInputContainer}>
                    <TextInput
                      style={styles.progressInput}
                      value={editedProgress.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 0;
                        setEditedProgress(Math.max(0, Math.min(100, num)));
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.progressPercent}>%</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => setEditedProgress(Math.min(100, editedProgress + 5))}
                  >
                    <Plus size={20} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {editedStatus === "in-progress" && editedDependencies.length > 0 && (
              <View style={styles.autoProgressNote}>
                <Text style={styles.autoProgressNoteText}>
                  Progress is automatically calculated based on completed dependencies
                </Text>
              </View>
            )}
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
  dependenciesDisplay: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  dependencyDisplayChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dependencyDisplayText: {
    fontSize: 14,
    color: "#1f2937",
    flex: 1,
    marginLeft: 8,
  },
  dependencyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dependencyStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  progressEditContainer: {
    marginTop: 16,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  progressControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  progressButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  progressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  autoProgressNote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 8,
  },
  autoProgressNoteText: {
    fontSize: 12,
    color: "#6366f1",
    textAlign: "center",
    fontStyle: "italic",
  },
});
