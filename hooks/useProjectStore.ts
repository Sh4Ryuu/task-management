import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { Project, Task } from "@/types/project";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "projects";
/** Bumped when stored shape or seed data policy changes; triggers one-time migration. */
const SCHEMA_KEY = "projects_data_schema";
const DATA_SCHEMA_VERSION = 2;

/** Titles of the old bundled demo projects (removed from the app; strip from AsyncStorage once). */
const REMOVED_SEED_PROJECT_TITLES = new Set([
  "Mobile App Development",
  "Website Redesign",
]);

function stripSeedProjects(projects: Project[]): Project[] {
  return projects.filter((p) => !REMOVED_SEED_PROJECT_TITLES.has(p.title));
}

export const [ProjectProvider, useProjects] = createContextHook(() => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      try {
        const schema = await AsyncStorage.getItem(SCHEMA_KEY);
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!stored) {
          const initial: Project[] = [];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
          await AsyncStorage.setItem(SCHEMA_KEY, String(DATA_SCHEMA_VERSION));
          return initial;
        }

        let list: Project[] = JSON.parse(stored);
        if (!Array.isArray(list)) {
          list = [];
        }

        if (schema !== String(DATA_SCHEMA_VERSION)) {
          list = stripSeedProjects(list);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          await AsyncStorage.setItem(SCHEMA_KEY, String(DATA_SCHEMA_VERSION));
        }

        return list;
      } catch (error) {
        console.error("Error loading projects:", error);
        return [];
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
