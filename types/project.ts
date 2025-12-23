export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  startDate: string;
  endDate: string;
  assignee?: string;
  projectId: string;
  dependencies?: string[];
  progress: number; // 0-100
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: "planning" | "active" | "completed" | "on-hold";
  startDate: string;
  endDate: string;
  color: string;
  progress: number; // 0-100
  tasks: Task[];
  teamMembers?: string[];
}

export type ProjectStatus = Project["status"];
export type TaskStatus = Task["status"];
export type Priority = Task["priority"];
