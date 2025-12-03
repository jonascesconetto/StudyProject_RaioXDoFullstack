import { Task } from "./task.entity";

export class TaskFilterCompletedService {
  constructor(private readonly tasks: Task[]) {}

  filter(completed: boolean = true): Task[] {
    return this.tasks.filter((task) => task.completed === completed);
  }

  filterCompleted(): Task[] {
    return this.filter(true);
  }

  filterPending(): Task[] {
    return this.filter(false);
  }
}
