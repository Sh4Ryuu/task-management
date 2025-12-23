import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from "react-native";
import { Filter, X, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useProjects } from "@/hooks/useProjectStore";
import { Task } from "@/types/project";

const DAY_WIDTH = 40;

export default function TimelineScreen() {
  const { projects, getAllTasks } = useProjects();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter"
  >("month");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectFilter, setShowProjectFilter] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const TIMELINE_WIDTH = width * 2;

  const allTasks = getAllTasks();
  const filteredTasks = selectedProjectId
    ? allTasks.filter((task) => task.projectId === selectedProjectId)
    : allTasks;

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  const generateDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(today.getDate() - 7);
        endDate.setDate(today.getDate() + 21);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        endDate.setMonth(today.getMonth() + 3);
        break;
      case "quarter":
        startDate.setMonth(today.getMonth() - 3);
        endDate.setMonth(today.getMonth() + 9);
        break;
    }

    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const dates = generateDateRange();

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const timelineStart = dates[0];

    const startDayIndex = Math.floor(
      (taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const duration = Math.ceil(
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      left: Math.max(0, startDayIndex * DAY_WIDTH),
      width: Math.max(DAY_WIDTH, duration * DAY_WIDTH),
    };
  };

  const getTaskColor = (task: Task) => {
    // Color based on status: green for completed, yellow for in-progress, gray for todo
    switch (task.status) {
      case "completed":
        return "#10b981"; // green
      case "in-progress":
        return "#f59e0b"; // yellow/orange
      default:
        return "#6b7280"; // gray
    }
  };

  // Get dependency line positions
  const getDependencyLine = (task: Task, dependentTaskId: string) => {
    const taskIndex = filteredTasks.findIndex((t) => t.id === task.id);
    const depIndex = filteredTasks.findIndex((t) => t.id === dependentTaskId);
    
    if (taskIndex === -1 || depIndex === -1 || taskIndex <= depIndex) return null;
    
    const taskPos = getTaskPosition(task);
    const depTask = filteredTasks[depIndex];
    const depPos = getTaskPosition(depTask);
    
    // Calculate connection points
    const fromX = depPos.left + depPos.width; // End of dependency task
    const fromY = depIndex * 60 + 25; // Middle of dependency task row
    const toX = taskPos.left; // Start of current task
    const toY = taskIndex * 60 + 25; // Middle of current task row
    
    return { fromX, fromY, toX, toY, taskIndex, depIndex };
  };

  const renderTimelineHeader = () => (
    <View style={styles.timelineHeader}>
      {dates.map((date) => (
        <View key={date.toISOString()} style={styles.dateColumn}>
          <Text style={styles.dateText}>
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
          <View style={styles.dateLine} />
        </View>
      ))}
    </View>
  );

  const handleProjectFilter = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setShowProjectFilter(false);
  };

  const renderDependencyLines = () => {
    const lines: JSX.Element[] = [];
    
    filteredTasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          const lineData = getDependencyLine(task, depId);
          if (lineData) {
            const { fromX, fromY, toX, toY } = lineData;
            const horizontalWidth = Math.max(20, toX - fromX);
            const verticalHeight = Math.abs(toY - fromY);
            
            lines.push(
              <View
                key={`${task.id}-${depId}`}
                style={styles.dependencyLineContainer}
              >
                {/* Horizontal line from dependency end */}
                <View
                  style={[
                    styles.dependencyLineSegment,
                    {
                      left: fromX,
                      top: fromY - 1,
                      width: horizontalWidth,
                      height: 2,
                    },
                  ]}
                />
                {/* Vertical line */}
                {verticalHeight > 0 && (
                  <View
                    style={[
                      styles.dependencyLineSegment,
                      {
                        left: toX - 1,
                        top: Math.min(fromY, toY),
                        width: 2,
                        height: verticalHeight,
                      },
                    ]}
                  />
                )}
                {/* Arrow at task start */}
                <View
                  style={[
                    styles.dependencyArrow,
                    {
                      left: toX - 6,
                      top: toY - 6,
                    },
                  ]}
                >
                  <ArrowRight size={12} color="#6366f1" />
                </View>
              </View>
            );
          }
        });
      }
    });
    
    return lines;
  };

  const renderTaskBar = (task: Task, index: number) => {
    if (!task?.title?.trim()) return null;

    const position = getTaskPosition(task);
    const color = getTaskColor(task);
    const project = projects.find((p) => p.id === task.projectId);

    return (
      <View key={task.id} style={[styles.taskRow, { top: index * 60 }]}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title.trim()}
          </Text>
          <Text style={styles.projectName} numberOfLines={1}>
            {project?.title || "Unknown Project"}
          </Text>
        </View>
        <View style={styles.taskBarContainer}>
          <View
            style={[
              styles.taskBar,
              {
                left: position.left,
                width: position.width,
                backgroundColor: color,
              },
            ]}
          >
            <Text style={styles.taskBarText} numberOfLines={1}>
              {task.title.trim()}
            </Text>
            {task.status === "in-progress" && (
              <View
                style={[styles.progressOverlay, { width: `${task.progress}%` }]}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const handlePeriodChange = (period: "week" | "month" | "quarter") => {
    if (period && ["week", "month", "quarter"].includes(period)) {
      setSelectedPeriod(period);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Timeline</Text>
            <Text style={styles.headerSubtitle}>
              {selectedProject
                ? `${selectedProject.title} - Gantt Chart View`
                : "Global - Gantt Chart View"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowProjectFilter(true)}
          >
            <Filter size={20} color="white" />
            {selectedProjectId && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          {(["week", "month", "quarter"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton,
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.activePeriodText,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.timelineContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timelineScroll}
        >
          <View style={[styles.timeline, { width: TIMELINE_WIDTH }]}>
            {renderTimelineHeader()}
            <ScrollView
              style={styles.tasksScroll}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.tasksContainer,
                  { height: filteredTasks.length * 60 + 40 },
                ]}
              >
                {renderDependencyLines()}
                {filteredTasks.map((task, index) => renderTaskBar(task, index))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#6b7280" }]} />
          <Text style={styles.legendText}>To Do</Text>
        </View>
      </View>

      <Modal
        visible={showProjectFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProjectFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProjectFilter(false)}
        >
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter by Project</Text>
              <TouchableOpacity
                onPress={() => setShowProjectFilter(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterModalContent}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  !selectedProjectId && styles.selectedFilterOption,
                ]}
                onPress={() => handleProjectFilter(null)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    !selectedProjectId && styles.selectedFilterOptionText,
                  ]}
                >
                  All Projects (Global)
                </Text>
                {!selectedProjectId && (
                  <View style={styles.filterCheckmark}>
                    <Text style={styles.filterCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.filterOption,
                    selectedProjectId === project.id &&
                      styles.selectedFilterOption,
                  ]}
                  onPress={() => handleProjectFilter(project.id)}
                >
                  <View
                    style={[
                      styles.projectColorIndicator,
                      { backgroundColor: project.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedProjectId === project.id &&
                        styles.selectedFilterOptionText,
                    ]}
                  >
                    {project.title}
                  </Text>
                  {selectedProjectId === project.id && (
                    <View style={styles.filterCheckmark}>
                      <Text style={styles.filterCheckmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterModal: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  filterModalContent: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedFilterOption: {
    backgroundColor: "#eef2ff",
  },
  projectColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: "#1f2937",
    flex: 1,
  },
  selectedFilterOptionText: {
    color: "#6366f1",
    fontWeight: "600",
  },
  filterCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  filterCheckmarkText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  activePeriodButton: {
    backgroundColor: "white",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  activePeriodText: {
    color: "#6366f1",
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  timelineScroll: {
    flex: 1,
  },
  timeline: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  dateColumn: {
    width: DAY_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  dateText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  dateLine: {
    width: 1,
    height: 20,
    backgroundColor: "#e5e7eb",
    marginTop: 4,
  },
  tasksScroll: {
    flex: 1,
  },
  tasksContainer: {
    position: "relative",
  },
  taskRow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  taskInfo: {
    width: 150,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  projectName: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  taskBarContainer: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  taskBar: {
    position: "absolute",
    height: 24,
    borderRadius: 4,
    justifyContent: "center",
    paddingHorizontal: 8,
    top: 13,
    overflow: "hidden",
  },
  taskBarText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  progressOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  dependencyLineContainer: {
    position: "absolute",
    zIndex: 1,
    pointerEvents: "none",
  },
  dependencyLineSegment: {
    position: "absolute",
    backgroundColor: "#6366f1",
    opacity: 0.6,
  },
  dependencyArrow: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 6,
    padding: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
