export type TaskFilter =
  | "all"
  | "completed"
  | "today"
  | "week"
  | { tag: string }
  | { search: string };
