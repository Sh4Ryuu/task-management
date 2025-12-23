import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, TrendingUp } from "lucide-react-native";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export default function ProjectCard({ project, onPress }: ProjectCardProps) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "completed":
        return "#6366f1";
      case "planning":
        return "#f59e0b";
      case "on-hold":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[project.color, project.color + "80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {project.title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(project.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {project.status.replace("-", " ")}
              </Text>
            </View>
          </View>
        </View>

        {project.description && (
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${project.progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{project.progress}%</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.dateText}>
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <TrendingUp size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{project.tasks.length} tasks</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    minWidth: 35,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 4,
  },
});
