import { TaskFilterByTagService } from "./task-filter-by-tag.service";
import { TaskFilterBySearchService } from "./task-filter-by-search.service";
import { TaskFilterCompletedService } from "./task-filter-completed.service";
import { TaskFilterDailyService } from "./task-filter-daily.service";
import { TaskFilterWeeklyService } from "./task-filter-weekly.service";
import { TaskFilter } from "./task-filter.type";
import { Task } from "./task.entity";

export class TaskFilterService {
  constructor(private readonly tasks: Task[]) {}

  filter(filter: TaskFilter): Task[] {
    if (!filter) {
      return this.tasks;
    }

    switch (filter) {
      case "all":
        return [...this.tasks];
      case "completed":
        return new TaskFilterCompletedService(this.tasks).filter();
      case "today":
        return new TaskFilterDailyService(this.tasks).filter();
      case "week":
        return new TaskFilterWeeklyService(this.tasks).filter();
      default:
        if (typeof filter === "object" && "search" in filter) {
          return new TaskFilterBySearchService(this.tasks).filter(
            filter.search
          );
        } else {
          return new TaskFilterByTagService(this.tasks).filter(
            (filter as any).tag
          );
        }
    }
  }
}
