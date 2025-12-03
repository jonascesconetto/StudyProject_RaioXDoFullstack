import { User } from "../../users";
import TaskRepository from "../provider/task.repository";
import UseCase from "../../shared/use-case";

export default class DeleteTask implements UseCase<string, void> {
  constructor(private readonly repo: TaskRepository) {}

  async execute(taskId: string, loggedUser: User): Promise<void> {
    const existingTask = await this.repo.findById(taskId, loggedUser.id);

    if (!existingTask) {
      throw new Error("Tarefa não encontrada");
    }

    await this.repo.delete(taskId, loggedUser.id);
  }
}
