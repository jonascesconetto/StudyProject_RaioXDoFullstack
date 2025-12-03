import { Task } from "../model/task.entity";
import { User } from "../../users";
import TaskRepository from "../provider/task.repository";
import UseCase from "../../shared/use-case";

export default class SaveTask implements UseCase<Task, void> {
  constructor(private readonly repo: TaskRepository) {}

  async execute(task: Task, loggedUser: User): Promise<void> {
    if (task.title == null || task.title.trim() === "") {
      throw new Error("Título é obrigatório");
    }

    await this.repo.save(task, loggedUser.id);
  }
}
