import { Task } from "../model/task.entity";
import { User } from "../../users";
import TaskRepository from "../provider/task.repository";
import UseCase from "../../shared/use-case";

export default class TasksByUser implements UseCase<User, Task[]> {
  constructor(private readonly repo: TaskRepository) {}

  async execute(user: User): Promise<Task[]> {
    return this.repo.findByUser(user.id);
  }
}
