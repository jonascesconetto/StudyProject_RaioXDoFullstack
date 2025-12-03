import DeleteTask from "../../../src/tasks/usecase/delete-task.usecase";
import TaskRepository from "../../../src/tasks/provider/task.repository";
import { Task, Priority, TaskTag, User } from "../../../src";
import { mockTasks } from "../../data/tasks.mock";
import { MockTaskRepository } from "../../data/mock-task.repository";

describe("DeleteTask UseCase", () => {
  let deleteTaskUseCase: DeleteTask;
  let mockRepository: MockTaskRepository;
  let mockUser: User;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    deleteTaskUseCase = new DeleteTask(mockRepository);
    mockUser = new User({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });
  });

  describe("Successful deletion", () => {
    it("should delete an existing task", async () => {
      const existingTask = new Task({
        id: "task-to-delete",
        title: "Task to be deleted",
        priority: Priority.Medium,
        completed: false,
      });
      mockRepository.setTasks([existingTask], mockUser.id);

      await deleteTaskUseCase.execute("task-to-delete", mockUser);

      expect(mockRepository.getDeletedTaskIds()).toContain("task-to-delete");
      expect(mockRepository.getTasks(mockUser.id)).toHaveLength(0);
      expect(mockRepository.getFindByIdCalls()).toHaveLength(1);
      expect(mockRepository.getDeleteCalls()).toHaveLength(1);
    });

    it("should call repository methods with correct parameters", async () => {
      const taskId = "task-123";
      const userId = "user-456";
      const testUser = new User({
        id: userId,
        name: "Test User",
        email: "test@example.com",
      });
      const existingTask = new Task({
        id: taskId,
        title: "Existing task",
        priority: Priority.High,
        completed: false,
      });
      mockRepository.addTaskForUser(existingTask, userId);

      // Act
      await deleteTaskUseCase.execute(taskId, testUser);

      // Assert
      const findByIdCalls = mockRepository.getFindByIdCalls();
      const deleteCalls = mockRepository.getDeleteCalls();

      expect(findByIdCalls).toHaveLength(1);
      expect(findByIdCalls[0]).toEqual({ id: taskId, userId });

      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0]).toEqual({ id: taskId, userId });
    });

    it("should delete task from a list of multiple tasks", async () => {
      // Arrange
      const taskToDelete = mockTasks[0];
      const remainingTasks = mockTasks.slice(1);
      mockRepository.setTasks([...mockTasks], mockUser.id);

      // Act
      await deleteTaskUseCase.execute(taskToDelete.id, mockUser);

      // Assert
      expect(mockRepository.getDeletedTaskIds()).toContain(taskToDelete.id);
      expect(mockRepository.getTasks(mockUser.id)).toHaveLength(
        mockTasks.length - 1
      );

      // Verify the correct task was deleted
      const remainingIds = mockRepository
        .getTasks(mockUser.id)
        .map((t) => t.id);
      expect(remainingIds).not.toContain(taskToDelete.id);
      remainingTasks.forEach((task) => {
        expect(remainingIds).toContain(task.id);
      });
    });

    it("should delete task with different properties", async () => {
      // Arrange
      const complexTask = new Task({
        id: "complex-task",
        title: "Complex task with all properties",
        dueDate: new Date("2024-12-31"),
        tags: [TaskTag.Trabalho, TaskTag.Afazeres],
        priority: Priority.High,
        completed: true,
      });
      mockRepository.setTasks([complexTask]);

      // Act
      await deleteTaskUseCase.execute("complex-task", mockUser);

      // Assert
      expect(mockRepository.getDeletedTaskIds()).toContain("complex-task");
      expect(mockRepository.getTasks()).toHaveLength(0);
    });

    it("should handle deletion of completed tasks", async () => {
      // Arrange
      const completedTask = new Task({
        id: "completed-task",
        title: "Completed task",
        completed: true,
        priority: Priority.Low,
      });
      mockRepository.setTasks([completedTask]);

      // Act
      await deleteTaskUseCase.execute("completed-task", mockUser);

      // Assert
      expect(mockRepository.getDeletedTaskIds()).toContain("completed-task");
      expect(mockRepository.getTasks()).toHaveLength(0);
    });

    it("should handle deletion of draft tasks", async () => {
      // Arrange
      const draftTask = Task.draft({
        id: "draft-task",
        title: "Draft task",
      });
      mockRepository.setTasks([draftTask]);

      // Act
      await deleteTaskUseCase.execute("draft-task", mockUser);

      // Assert
      expect(mockRepository.getDeletedTaskIds()).toContain("draft-task");
      expect(mockRepository.getTasks()).toHaveLength(0);
    });
  });

  describe("Error handling", () => {
    it("should throw error when task does not exist", async () => {
      // Arrange
      mockRepository.setTasks([]); // Empty repository

      // Act & Assert
      await expect(
        deleteTaskUseCase.execute("non-existent-task", mockUser)
      ).rejects.toThrow("Tarefa não encontrada");

      // Verify repository was called but no deletion occurred
      expect(mockRepository.getFindByIdCalls()).toHaveLength(1);
      expect(mockRepository.getDeleteCalls()).toHaveLength(0);
      expect(mockRepository.getDeletedTaskIds()).toHaveLength(0);
    });

    it("should throw error when task belongs to different user", async () => {
      // Arrange
      const task = new Task({
        id: "other-user-task",
        title: "Task belonging to other user",
        priority: Priority.Medium,
        completed: false,
      });
      // Simulate task not found for this user by not adding it to mock repository
      mockRepository.setTasks([]);

      // Act & Assert
      await expect(
        deleteTaskUseCase.execute("other-user-task", mockUser)
      ).rejects.toThrow("Tarefa não encontrada");

      expect(mockRepository.getFindByIdCalls()).toHaveLength(1);
      expect(mockRepository.getDeleteCalls()).toHaveLength(0);
    });

    it("should throw error with correct message for missing task", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks);

      // Act & Assert
      try {
        await deleteTaskUseCase.execute("missing-task-id", mockUser);
        fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Tarefa não encontrada");
      }
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const mockRepoWithError = {
        async findById(): Promise<Task | null> {
          throw new Error("Database connection error");
        },
        async delete(): Promise<void> {
          throw new Error("Delete operation failed");
        },
        async findByUser(): Promise<Task[]> {
          return [];
        },
        async save(): Promise<void> {},
      } as TaskRepository;

      const deleteTaskWithErrorRepo = new DeleteTask(mockRepoWithError);

      // Act & Assert
      await expect(
        deleteTaskWithErrorRepo.execute("task-id", mockUser)
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty task ID", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks);

      // Act & Assert
      await expect(deleteTaskUseCase.execute("", mockUser)).rejects.toThrow(
        "Tarefa não encontrada"
      );
    });

    it("should handle null task ID", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks);

      // Act & Assert
      await expect(
        deleteTaskUseCase.execute(null as any, mockUser)
      ).rejects.toThrow("Tarefa não encontrada");
    });

    it("should handle undefined task ID", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks);

      // Act & Assert
      await expect(
        deleteTaskUseCase.execute(undefined as any, mockUser)
      ).rejects.toThrow("Tarefa não encontrada");
    });

    it("should handle very long task ID", async () => {
      // Arrange
      const longTaskId = "a".repeat(1000);
      mockRepository.setTasks(mockTasks);

      // Act & Assert
      await expect(
        deleteTaskUseCase.execute(longTaskId, mockUser)
      ).rejects.toThrow("Tarefa não encontrada");
    });

    it("should handle special characters in task ID", async () => {
      // Arrange
      const specialTask = new Task({
        id: "task-with-special-chars-!@#$%",
        title: "Special task",
        priority: Priority.Medium,
        completed: false,
      });
      mockRepository.setTasks([specialTask]);

      // Act
      await deleteTaskUseCase.execute(
        "task-with-special-chars-!@#$%",
        mockUser
      );

      // Assert
      expect(mockRepository.getDeletedTaskIds()).toContain(
        "task-with-special-chars-!@#$%"
      );
    });
  });

  describe("Use case behavior", () => {
    it("should be instance of UseCase", () => {
      expect(deleteTaskUseCase).toBeDefined();
      expect(typeof deleteTaskUseCase.execute).toBe("function");
    });

    it("should return void on successful deletion", async () => {
      // Arrange
      const task = new Task({
        id: "test-task",
        title: "Test task",
        priority: Priority.Medium,
        completed: false,
      });
      mockRepository.addTaskForUser(task, mockUser.id);
      // Act
      const result = await deleteTaskUseCase.execute("test-task", mockUser);
      // Assert
      expect(result).toBeUndefined();
    });

    it("should throw error when deleting task of another user", async () => {
      // Arrange
      const task = new Task({
        id: "user-specific-task",
        title: "User specific task",
        priority: Priority.High,
        completed: false,
      });

      mockRepository.addTaskForUser(task, mockUser.id);

      const anotherUser = new User({
        id: "user-456",
        name: "Another User",
        email: "another@example.com",
      });

      await expect(
        deleteTaskUseCase.execute("user-specific-task", anotherUser)
      ).rejects.toThrow("Tarefa não encontrada");
    });

    it("should maintain repository state consistency", async () => {
      // Arrange
      const initialTasks = mockTasks.slice(0, 3);
      mockRepository.setTasks(initialTasks, mockUser.id);
      const taskToDelete = initialTasks[1];
      // Act
      await deleteTaskUseCase.execute(taskToDelete.id, mockUser);
      // Assert
      const remainingTasks = mockRepository.getTasks(mockUser.id);
      expect(remainingTasks).toHaveLength(2);
      expect(remainingTasks.map((t) => t.id)).not.toContain(taskToDelete.id);
      expect(remainingTasks.map((t) => t.id)).toContain(initialTasks[0].id);
      expect(remainingTasks.map((t) => t.id)).toContain(initialTasks[2].id);
    });
  });

  describe("Multiple operations", () => {
    it("should handle multiple deletions in sequence", async () => {
      // Arrange
      const tasksToDelete = mockTasks.slice(0, 3);
      mockRepository.setTasks([...mockTasks], mockUser.id);
      // Act
      for (const task of tasksToDelete) {
        await deleteTaskUseCase.execute(task.id, mockUser);
      }
      // Assert
      expect(mockRepository.getDeletedTaskIds()).toHaveLength(3);
      tasksToDelete.forEach((task) => {
        expect(mockRepository.getDeletedTaskIds()).toContain(task.id);
      });
      expect(mockRepository.getTasks(mockUser.id)).toHaveLength(
        mockTasks.length - 3
      );
    });

    it("should handle deletion attempts after task already deleted", async () => {
      // Arrange
      const task = new Task({
        id: "to-be-deleted-twice",
        title: "Task to be deleted twice",
        priority: Priority.Medium,
        completed: false,
      });
      mockRepository.setTasks([task]);
      // Act - First deletion should succeed
      await deleteTaskUseCase.execute("to-be-deleted-twice", mockUser);
      // Act & Assert - Second deletion should fail
      await expect(
        deleteTaskUseCase.execute("to-be-deleted-twice", mockUser)
      ).rejects.toThrow("Tarefa não encontrada");
    });

    it("should maintain correct call counts for multiple operations", async () => {
      // Arrange
      const tasks = mockTasks.slice(0, 2);
      mockRepository.setTasks(tasks, mockUser.id);
      // Act
      await deleteTaskUseCase.execute(tasks[0].id, mockUser);
      await deleteTaskUseCase.execute(tasks[1].id, mockUser);
      // Assert
      expect(mockRepository.getFindByIdCalls()).toHaveLength(2);
      expect(mockRepository.getDeleteCalls()).toHaveLength(2);
      expect(mockRepository.getDeletedTaskIds()).toHaveLength(2);
    });
  });

  describe("Integration with different task types", () => {
    it("should delete tasks with all priority levels", async () => {
      // Arrange
      const lowPriorityTask = new Task({
        id: "low-priority",
        title: "Low priority task",
        priority: Priority.Low,
        completed: false,
      });
      const mediumPriorityTask = new Task({
        id: "medium-priority",
        title: "Medium priority task",
        priority: Priority.Medium,
        completed: false,
      });
      const highPriorityTask = new Task({
        id: "high-priority",
        title: "High priority task",
        priority: Priority.High,
        completed: false,
      });
      mockRepository.setTasks([
        lowPriorityTask,
        mediumPriorityTask,
        highPriorityTask,
      ]);
      // Act
      await deleteTaskUseCase.execute("low-priority", mockUser);
      await deleteTaskUseCase.execute("medium-priority", mockUser);
      await deleteTaskUseCase.execute("high-priority", mockUser);
      // Assert
      expect(mockRepository.getDeletedTaskIds()).toEqual([
        "low-priority",
        "medium-priority",
        "high-priority",
      ]);
      expect(mockRepository.getTasks()).toHaveLength(0);
    });

    it("should delete tasks with all tag combinations", async () => {
      // Arrange
      const workTask = new Task({
        id: "work-task",
        title: "Work task",
        tags: [TaskTag.Trabalho],
        priority: Priority.Medium,
        completed: false,
      });
      const personalTask = new Task({
        id: "personal-task",
        title: "Personal task",
        tags: [TaskTag.Pessoal],
        priority: Priority.Medium,
        completed: false,
      });
      const multiTagTask = new Task({
        id: "multi-tag-task",
        title: "Multi tag task",
        tags: [TaskTag.Trabalho, TaskTag.Afazeres, TaskTag.Outro],
        priority: Priority.Medium,
        completed: false,
      });

      mockRepository.setTasks([workTask, personalTask, multiTagTask]);

      // Act
      await deleteTaskUseCase.execute("work-task", mockUser);
      await deleteTaskUseCase.execute("personal-task", mockUser);
      await deleteTaskUseCase.execute("multi-tag-task", mockUser);

      // Assert
      expect(mockRepository.getDeletedTaskIds()).toHaveLength(3);
      expect(mockRepository.getTasks()).toHaveLength(0);
    });
  });
});
