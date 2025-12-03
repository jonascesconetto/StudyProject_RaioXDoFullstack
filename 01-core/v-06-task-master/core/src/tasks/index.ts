import { Priority } from "./model/priority.enum";
import { TaskTag } from "./model/task-tag.enum";
import { Task, TaskProps } from "./model/task.entity";

import { TaskFilter } from "./model/task-filter.type";
import { TaskFilterBySearchService } from "./model/task-filter-by-search.service";
import { TaskFilterByTagService } from "./model/task-filter-by-tag.service";
import { TaskFilterCompletedService } from "./model/task-filter-completed.service";
import { TaskFilterDailyService } from "./model/task-filter-daily.service";
import { TaskFilterService } from "./model/task-filter.service";
import { TaskFilterWeeklyService } from "./model/task-filter-weekly.service";

import TaskRepository from "./provider/task.repository";

import DeleteTask from "./usecase/delete-task.usecase";
import TasksByUser from "./usecase/tasks-by-user.usecase";
import SaveTask from "./usecase/save-task.usecase";

export {
  DeleteTask,
  TasksByUser,
  Priority,
  SaveTask,
  Task,
  TaskFilterBySearchService,
  TaskFilterByTagService,
  TaskFilterCompletedService,
  TaskFilterDailyService,
  TaskFilterService,
  TaskFilterWeeklyService,
  TaskTag,
};

export type { TaskProps, TaskFilter, TaskRepository };
