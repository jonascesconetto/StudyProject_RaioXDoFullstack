import { DateUtils } from "../../utils/date.utils";
import { Entity, EntityMode, EntityProps } from "../../shared/entity";
import { Priority } from "./priority.enum";
import { RequiredString } from "../../shared/required-string.vo";
import { TaskTag } from "./task-tag.enum";

export interface TaskProps extends EntityProps<string> {
  title?: string;
  dueDate?: Date | string;
  tags?: TaskTag[];
  priority?: Priority;
  completed?: boolean;
}

export class Task extends Entity<TaskProps> {
  public readonly title: string;
  public readonly dueDate: Date;
  public readonly tags: TaskTag[] = [];
  public readonly priority: Priority;
  public readonly completed: boolean = false;

  constructor(props: TaskProps, mode: EntityMode = "valid") {
    super(props, mode);
    this.title =
      mode === "draft"
        ? (props?.title ?? "")
        : RequiredString.create(props?.title ?? "", {
            attributeName: "Título",
            minLength: 3,
          }).value;
    this.dueDate = DateUtils.parseDate(props?.dueDate ?? "");
    this.tags = props?.tags ?? [];
    this.priority = props?.priority ?? Priority.Medium;
    this.completed = props?.completed ?? false;
  }

  static draft(props: TaskProps = {}) {
    return new Task(props, "draft");
  }

  toggleComplete(): Task {
    return this.clone({ completed: !this.completed });
  }
}
