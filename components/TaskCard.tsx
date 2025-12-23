import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react-native";
import { Task } from "@/types/project";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export default function TaskCard({
  task,
  onPress,
  onToggleComplete,
}: TaskCardProps) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle size={20} color="#10b981" />;
      case "in-progress":
        return <Clock size={20} color="#f59e0b" />;
      default:
        return <Circle size={20} color="#6b7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = () => {
    const today = new Date();
    const endDate = new Date(task.endDate);
    return endDate < today && task.status !== "completed";
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onToggleComplete}
          style={styles.statusButton}
        >
          {getStatusIcon()}
        </TouchableOpacity>

        <View style={styles.details}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                task.status === "completed" && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <View style={styles.badges}>
              {isOverdue() && (
                <View style={styles.overdueBadge}>
                  <AlertTriangle size={12} color="white" />
                </View>
              )}
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{task.priority}</Text>
              </View>
            </View>
          </View>

          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.dateText}>
              {formatDate(task.startDate)} - {formatDate(task.endDate)}
            </Text>

            {(task.progress > 0 || task.status === "in-progress") && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${task.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{task.progress}%</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  statusButton: {
    marginRight: 12,
    marginTop: 2,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
  },
  overdueBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    padding: 4,
    marginRight: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
    minWidth: 25,
  },
});
