import { Task } from "./task.entity";
import { DateUtils } from "../../utils/date.utils";

export class TaskFilterWeeklyService {
  constructor(private readonly tasks: Task[]) {}

  filter(): Task[] {
    const startOfWeek = DateUtils.startOfTomorrow();
    const endOfWeek = DateUtils.endOfThisWeek();

    return this.tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate >= startOfWeek && taskDate <= endOfWeek && !task.completed
      );
    });
  }
}
