import { TaskTag } from "./task-tag.enum";
import { Task } from "./task.entity";

export class TaskFilterByTagService {
  constructor(private readonly tasks: Task[]) {}

  filter(tag: TaskTag): Task[] {
    return this.tasks.filter((task) => task.tags.includes(tag));
  }
}
