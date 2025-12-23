import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Filter } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useProjects } from "@/hooks/useProjectStore";
import { Task } from "@/types/project";

const DAY_WIDTH = 40;

export default function TimelineScreen() {
  const { projects, getAllTasks } = useProjects();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter"
  >("month");
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const TIMELINE_WIDTH = width * 2;

  const allTasks = getAllTasks();

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
    const project = projects.find((p) => p.id === task.projectId);
    return project?.color || "#6366f1";
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
            <View
              style={[styles.progressOverlay, { width: `${task.progress}%` }]}
            />
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
            <Text style={styles.headerSubtitle}>Gantt Chart View</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="white" />
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
                  { height: allTasks.length * 60 + 40 },
                ]}
              >
                {allTasks.map((task, index) => renderTaskBar(task, index))}
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
