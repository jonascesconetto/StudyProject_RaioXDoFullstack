import { Task } from "./task.entity";
import { DateUtils } from "../../utils/date.utils";

export class TaskFilterDailyService {
  constructor(private readonly tasks: Task[]) {}

  filter(): Task[] {
    const startOfToday = DateUtils.startOfToday();

    return this.tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);

      const isToday = DateUtils.isSameDay(taskDate, startOfToday);
      const isDelayed = taskDate < startOfToday && !task.completed;

      return isToday || isDelayed;
    });
  }
}
