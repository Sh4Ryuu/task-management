import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { Project, Task } from "@/types/project";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "projects";

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Mobile App Development",
    description: "Build a new mobile application for our clients",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-03-30",
    color: "#6366f1",
    progress: 65,
    tasks: [
      {
        id: "1-1",
        title: "UI/UX Design",
        description: "Create wireframes and mockups",
        status: "completed",
        priority: "high",
        startDate: "2024-01-15",
        endDate: "2024-02-01",
        projectId: "1",
        progress: 100,
      },
      {
        id: "1-2",
        title: "Frontend Development",
        description: "Implement React Native components",
        status: "in-progress",
        priority: "high",
        startDate: "2024-02-01",
        endDate: "2024-03-15",
        projectId: "1",
        progress: 70,
      },
      {
        id: "1-3",
        title: "Backend API",
        description: "Develop REST API endpoints",
        status: "in-progress",
        priority: "medium",
        startDate: "2024-02-15",
        endDate: "2024-03-20",
        projectId: "1",
        progress: 40,
      },
      {
        id: "1-4",
        title: "Testing & QA",
        description: "Comprehensive testing and bug fixes",
        status: "todo",
        priority: "high",
        startDate: "2024-03-15",
        endDate: "2024-03-30",
        projectId: "1",
        progress: 0,
      },
    ],
  },
  {
    id: "2",
    title: "Website Redesign",
    description: "Modernize company website with new branding",
    status: "planning",
    startDate: "2024-02-01",
    endDate: "2024-04-15",
    color: "#10b981",
    progress: 25,
    tasks: [
      {
        id: "2-1",
        title: "Brand Guidelines",
        description: "Define new visual identity",
        status: "completed",
        priority: "high",
        startDate: "2024-02-01",
        endDate: "2024-02-15",
        projectId: "2",
        progress: 100,
      },
      {
        id: "2-2",
        title: "Content Strategy",
        description: "Plan website content and structure",
        status: "in-progress",
        priority: "medium",
        startDate: "2024-02-10",
        endDate: "2024-03-01",
        projectId: "2",
        progress: 60,
      },
    ],
  },
];

export const [ProjectProvider, useProjects] = createContextHook(() => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProjects));
        return mockProjects;
      } catch (error) {
        console.error("Error loading projects:", error);
        return mockProjects;
      }
    },
  });

  const saveProjectsMutation = useMutation({
    mutationFn: async (projects: Project[]) => {
      if (!Array.isArray(projects)) {
        throw new Error("Invalid projects data");
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return projects;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const saveProjects = saveProjectsMutation.mutate;

  const projects = useMemo(
    () => projectsQuery.data || [],
    [projectsQuery.data],
  );

  const addProject = useCallback(
    (project: Omit<Project, "id" | "tasks">) => {
      const newProject: Project = {
        ...project,
        id: Date.now().toString(),
        tasks: [],
      };
      const updatedProjects = [...projects, newProject];
      saveProjects(updatedProjects);
    },
    [projects, saveProjects],
  );

  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      const updatedProjects = projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p,
      );
      saveProjects(updatedProjects);
    },
    [projects, saveProjects],
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      saveProjects(updatedProjects);
    },
    [projects, saveProjects],
  );

  const addTask = useCallback(
    (projectId: string, task: Omit<Task, "id" | "projectId">) => {
      const newTask: Task = {
        ...task,
        id: `${projectId}-${Date.now()}`,
        projectId,
      };

      const updatedProjects = projects.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p,
      );
      saveProjects(updatedProjects);
    },
    [projects, saveProjects],
  );

  // Calculate progress based on dependencies for in-progress tasks
  const calculateProgressFromDependencies = useCallback(
    (task: Task, allProjects: Project[]): number => {
      if (task.status !== "in-progress" || !task.dependencies || task.dependencies.length === 0) {
        return task.progress;
      }

      // Find all dependency tasks
      const dependencyTasks: Task[] = [];
      allProjects.forEach((p) => {
        p.tasks.forEach((t) => {
          if (task.dependencies?.includes(t.id)) {
            dependencyTasks.push(t);
          }
        });
      });

      if (dependencyTasks.length === 0) {
        return task.progress;
      }

      // Calculate progress: percentage of completed dependencies
      const completedDependencies = dependencyTasks.filter(
        (t) => t.status === "completed"
      ).length;
      const progress = Math.round((completedDependencies / dependencyTasks.length) * 100);

      return progress;
    },
    []
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      let updatedProjects = projects.map((p) => {
        const task = p.tasks.find((t) => t.id === taskId);
        if (!task) return p;

        const updatedTask = { ...task, ...updates };
        
        // Auto-calculate progress for in-progress tasks with dependencies
        // Only if progress wasn't explicitly set (manual progress takes precedence when no dependencies)
        if (
          updatedTask.status === "in-progress" &&
          updatedTask.dependencies &&
          updatedTask.dependencies.length > 0
        ) {
          updatedTask.progress = calculateProgressFromDependencies(updatedTask, projects);
        }
        // If no dependencies and progress is provided, use the provided progress
        // (This allows manual progress editing)

        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        };
      });

      // If a task was completed, update progress for all tasks that depend on it
      if (updates.status === "completed") {
        updatedProjects = updatedProjects.map((p) => ({
          ...p,
          tasks: p.tasks.map((t) => {
            // Check if this task depends on the completed task
            if (
              t.dependencies &&
              t.dependencies.includes(taskId) &&
              t.status === "in-progress" &&
              t.dependencies.length > 0
            ) {
              return {
                ...t,
                progress: calculateProgressFromDependencies(t, updatedProjects),
              };
            }
            return t;
          }),
        }));
      }

      saveProjects(updatedProjects);
    },
    [projects, saveProjects, calculateProgressFromDependencies],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      const updatedProjects = projects.map((p) => ({
        ...p,
        tasks: p.tasks.filter((t) => t.id !== taskId),
      }));
      saveProjects(updatedProjects);
    },
    [projects, saveProjects],
  );

  const getProject = useCallback(
    (projectId: string) => {
      return projects.find((p) => p.id === projectId);
    },
    [projects],
  );

  const getAllTasks = useCallback(() => {
    return projects.flatMap((p) => p.tasks);
  }, [projects]);

  return useMemo(
    () => ({
      projects,
      selectedProject,
      setSelectedProject,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      getProject,
      getAllTasks,
      isLoading: projectsQuery.isLoading,
      isError: projectsQuery.isError,
    }),
    [
      projects,
      selectedProject,
      setSelectedProject,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      getProject,
      getAllTasks,
      projectsQuery.isLoading,
      projectsQuery.isError,
    ],
  );
});
