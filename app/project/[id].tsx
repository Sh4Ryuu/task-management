import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Circle,
  Edit,
  Trash2,
} from "lucide-react-native";
import { useProjects } from "@/hooks/useProjectStore";
import TaskCard from "@/components/TaskCard";
import { Task } from "@/types/project";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProject, updateTask, deleteProject } = useProjects();
  const [filter, setFilter] = useState<
    "all" | "todo" | "in-progress" | "completed"
  >("all");
  const [showMenu, setShowMenu] = useState(false);

  const project = getProject(id!);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Project not found</Text>
      </SafeAreaView>
    );
  }

  const filteredTasks = project.tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getStatusCounts = () => {
    const todo = project.tasks.filter((t) => t.status === "todo").length;
    const inProgress = project.tasks.filter(
      (t) => t.status === "in-progress",
    ).length;
    const completed = project.tasks.filter(
      (t) => t.status === "completed",
    ).length;
    return { todo, inProgress, completed };
  };

  const statusCounts = getStatusCounts();

  const handleToggleTaskComplete = (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    const newProgress = newStatus === "completed" ? 100 : 0;
    updateTask(task.id, { status: newStatus, progress: newProgress });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFilterColor = (filterType: typeof filter) => {
    if (!filterType?.trim()) return "#9ca3af";
    return filter === filterType ? "#6366f1" : "#9ca3af";
  };

  const handleDeleteProject = () => {
    setShowMenu(false);
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteProject(id!);
            router.back();
          },
        },
      ],
    );
  };

  const handleEditProject = () => {
    setShowMenu(false);
    router.push(`/create-project?id=${id}` as any);
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
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowMenu(true)}
          >
            <MoreVertical size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          {project.description && (
            <Text style={styles.projectDescription}>{project.description}</Text>
          )}

          <View style={styles.projectMeta}>
            <View style={styles.metaItem}>
              <Calendar size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <TrendingUp size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{project.progress}% Complete</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${project.progress}%` }]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Circle size={20} color="#6b7280" />
          <Text style={styles.statNumber}>{statusCounts.todo}</Text>
          <Text style={styles.statLabel}>To Do</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color="#f59e0b" />
          <Text style={styles.statNumber}>{statusCounts.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={styles.statNumber}>{statusCounts.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(["all", "todo", "in-progress", "completed"] as const).map(
            (filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterButton,
                  filter === filterType && styles.activeFilter,
                ]}
                onPress={() => setFilter(filterType)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: getFilterColor(filterType) },
                  ]}
                >
                  {filterType === "all" ? "All" : filterType.replace("-", " ")}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.tasksContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === "all"
                ? "Add your first task to get started"
                : `No ${filter.replace("-", " ")} tasks`}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => router.push(`/task/${task.id}` as any)}
              onToggleComplete={() => handleToggleTaskComplete(task)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push(`/create-task?projectId=${project.id}` as any)
        }
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[project.color, project.color + "80"]}
          style={styles.fabGradient}
        >
          <Plus size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProject}
            >
              <Edit size={20} color="#6366f1" />
              <Text style={styles.menuItemText}>Edit Project</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteProject}
            >
              <Trash2 size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                Delete Project
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 20,
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
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "flex-start",
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    marginBottom: 20,
  },
  projectMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 8,
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "white",
  },
  activeFilter: {
    backgroundColor: "#6366f1",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tasksContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
});
