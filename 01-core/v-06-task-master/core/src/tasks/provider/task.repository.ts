import { Task } from "../model/task.entity";

export default interface TaskRepository {
  findByUser(userId: string): Promise<Task[]>;
  findById(id: string, userId: string): Promise<Task | null>;
  save(task: Task, userId: string): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
}
