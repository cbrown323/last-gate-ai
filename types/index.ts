export type ApplicationStatus = "development" | "production" | "archived";

export type TaskStatus = "backlog" | "todo" | "doing" | "done";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type SubtaskStatus = "todo" | "doing" | "done";

export type LifecyclePhase =
  | "discovery"
  | "planning"
  | "development"
  | "launch"
  | "growth"
  | "maintenance"
  | "sunset";

export type WorkflowType = "kanban" | "scrum";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "development",
  "production",
  "archived",
];

export const TASK_STATUSES: TaskStatus[] = [
  "backlog",
  "todo",
  "doing",
  "done",
];

export const TASK_PRIORITIES: TaskPriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  doing: "In Progress",
  done: "Done",
};

export const LIFECYCLE_PHASE_LABELS: Record<LifecyclePhase, string> = {
  discovery: "Discovery",
  planning: "Planning",
  development: "Development",
  launch: "Launch",
  growth: "Growth",
  maintenance: "Maintenance",
  sunset: "Sunset",
};

export const WORKFLOW_TYPE_LABELS: Record<WorkflowType, string> = {
  kanban: "Kanban",
  scrum: "Scrum",
};

export interface Application {
  id: string;
  name: string;
  description: string | null;
  status: ApplicationStatus;
  repoUrl: string | null;
  websiteUrl: string | null;
  owner: string | null;
  lifecyclePhase: LifecyclePhase;
  workflowType: WorkflowType;
  ticketPrefix: string | null;
  isPinned: boolean;
  doingWipLimit: number;
  lifecyclePhaseStartedAt: string;
  createdAt: string;
  updatedAt: string;
  gitMeta?: GitMetadata | null;
  tasks?: Task[];
  epics?: Epic[];
  summaries?: AiSummary[];
  _count?: {
    tasks: number;
    epics?: number;
  };
}

export interface GitMetadata {
  id: string;
  applicationId: string;
  lastCommitAt: string | null;
  commitCount: number | null;
  commitsLast7Days: number | null;
  commitsLast30Days: number | null;
  contributorCount: number | null;
  openIssues: number | null;
  defaultBranch: string | null;
  syncedAt: string | null;
}

export interface Task {
  id: string;
  applicationId: string;
  epicId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  priority: TaskPriority;
  assignee: string | null;
  dueAt: string | null;
  startAt: string | null;
  reference: string | null;
  tags: string[];
  color: string | null;
  code: string | null;
  isClosed: boolean;
  estimationHours: number | null;
  timeSpentHours: number;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  comments?: TaskComment[];
  epic?: Epic | null;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: SubtaskStatus;
  position: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  body: string;
  author: string | null;
  createdAt: string;
}

export interface TaskTransition {
  id: string;
  taskId: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

export interface Epic {
  id: string;
  applicationId: string;
  name: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  color: string | null;
  position: number;
  parentId: string | null;
  createdAt: string;
  _count?: { tasks: number };
}

export interface AiSummary {
  id: string;
  applicationId: string;
  content: string;
  generatedAt: string;
}

export interface DependencyEntry {
  name: string;
  version: string;
  dev?: boolean;
}

export interface StackScanResult {
  id: string;
  applicationId: string;
  frameworks: string[];
  languages: string[];
  dependencies: DependencyEntry[];
  manifestFiles: string[];
  lockfilePresent: boolean;
  scannedAt: string;
}

export interface ArchitectureLayer {
  name: string;
  components: string[];
}

export interface ArchitectureDirectory {
  path: string;
  role: string;
  layer: string;
  fileCount: number;
}

export interface ArchitectureMapResult {
  id: string;
  applicationId: string;
  layers: ArchitectureLayer[];
  directories: ArchitectureDirectory[];
  diagram: string;
  mappedAt: string;
}

export type SecuritySeverity = "high" | "medium" | "low" | "info";

export interface SecurityFinding {
  severity: SecuritySeverity;
  title: string;
  detail: string;
}

export interface SecurityReportResult {
  id: string;
  applicationId: string;
  findings: SecurityFinding[];
  score: number;
  summary: string;
  mode: "ai" | "offline";
  generatedAt: string;
}

export interface HeadroomReportResult {
  id: string;
  applicationId: string;
  score: number;
  summary: string;
  recommendations: string[];
  mode: "ai" | "offline";
  generatedAt: string;
}

export interface DeploymentRecord {
  id: string;
  applicationId: string;
  platform: string;
  status: string;
  url: string | null;
  version: string | null;
  notes: string | null;
  deployedAt: string;
}

export interface Note {
  id: string;
  applicationId: string | null;
  applicationName?: string | null;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteLink {
  id: string;
  title: string;
  applicationId: string | null;
}

export interface NoteWithLinks extends Note {
  backlinks: NoteLink[];
  outgoingLinks: NoteLink[];
}

export type CalendarEventType =
  | "event"
  | "milestone"
  | "meeting"
  | "release"
  | "deadline"
  | "reminder";

export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  "event",
  "milestone",
  "meeting",
  "release",
  "deadline",
  "reminder",
];

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  event: "Event",
  milestone: "Milestone",
  meeting: "Meeting",
  release: "Release",
  deadline: "Deadline",
  reminder: "Reminder",
};

export interface CalendarEventRecord {
  id: string;
  applicationId: string | null;
  applicationName?: string | null;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: CalendarEventType;
  color: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CalendarItemSource = "event" | "task" | "epic";

export interface CalendarItem {
  id: string;
  source: CalendarItemSource;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  type: CalendarEventType | null;
  color: string | null;
  applicationId: string | null;
  applicationName: string | null;
  href: string | null;
}

export type SearchResultType =
  | "application"
  | "task"
  | "note"
  | "event"
  | "epic";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  href: string;
  badge: string | null;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  counts: Record<SearchResultType, number>;
}

export interface PortfolioStats {
  total: number;
  development: number;
  production: number;
  archived: number;
  openIssues: number;
  needsAttention: number;
  openTasks: number;
  overdueTasks: number;
  doingTasks: number;
}

export interface TaskPortfolioStats {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  recentActivity: TaskTransitionActivity[];
  overdue: TaskSummary[];
}

export interface TaskTransitionActivity {
  id: string;
  taskId: string;
  taskTitle: string;
  applicationId: string;
  applicationName: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  applicationId: string;
  applicationName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
}

export type {
  VelocityEffortStats,
  ApplicationVelocityEffort,
  LifecycleVelocityAlert,
  VelocityTrend,
} from "@/lib/pm/velocity-types";

export type IntelligenceStepId =
  | "git"
  | "stack"
  | "architecture"
  | "summary"
  | "security"
  | "headroom"
  | "deployments";

export type IntelligenceStepResultStatus = "complete" | "skipped" | "failed";

export interface IntelligenceStepResult {
  stepId: IntelligenceStepId;
  status: IntelligenceStepResultStatus;
  error?: string;
  durationMs: number;
}

export type IntelligenceJobStatus = "pending" | "running" | "complete" | "failed";

export type IntelligenceJobTrigger = "manual" | "cron" | "portfolio";

export interface IntelligenceJobRecord {
  id: string;
  applicationId: string;
  status: IntelligenceJobStatus;
  currentStep: IntelligenceStepId | null;
  stepResults: IntelligenceStepResult[];
  error: string | null;
  trigger: IntelligenceJobTrigger;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}
