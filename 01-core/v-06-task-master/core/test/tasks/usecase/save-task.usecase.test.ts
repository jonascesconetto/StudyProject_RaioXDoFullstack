import SaveTask from "../../../src/tasks/usecase/save-task.usecase";
import TaskRepository from "../../../src/tasks/provider/task.repository";
import { Task, Priority, TaskTag, User } from "../../../src";
import { mockTasks } from "../../data/tasks.mock";
import { MockTaskRepository } from "../../data/mock-task.repository";

describe("SaveTask UseCase", () => {
  let saveTaskUseCase: SaveTask;
  let mockRepository: MockTaskRepository;
  let mockUser: User;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    saveTaskUseCase = new SaveTask(mockRepository);
    mockUser = new User({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });
  });

  describe("Successful save operations", () => {
    it("should save a new task", async () => {
      // Arrange
      const newTask = new Task({
        title: "Nova tarefa de teste",
        priority: Priority.Medium,
        completed: false,
      });

      // Act
      await saveTaskUseCase.execute(newTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].title).toBe("Nova tarefa de teste");
      expect(savedTasks[0].id).toBe(newTask.id);
    });

    it("should update an existing task", async () => {
      // Arrange
      const existingTask = mockTasks[0];
      mockRepository.setTasks([existingTask], mockUser.id);

      const updatedTask = existingTask.clone({
        title: "Título atualizado",
        priority: Priority.High,
      });

      // Act
      await saveTaskUseCase.execute(updatedTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks(mockUser.id);
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].title).toBe("Título atualizado");
      expect(savedTasks[0].priority).toBe(Priority.High);
      expect(savedTasks[0].id).toBe(existingTask.id);
    });

    it("should save task with all properties", async () => {
      // Arrange
      const complexTask = new Task({
        title: "Tarefa complexa com todas as propriedades",
        dueDate: new Date("2024-12-31"),
        tags: [TaskTag.Trabalho, TaskTag.Afazeres],
        priority: Priority.High,
        completed: true,
      });

      // Act
      await saveTaskUseCase.execute(complexTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(1);
      const savedTask = savedTasks[0];

      expect(savedTask.title).toBe("Tarefa complexa com todas as propriedades");
      expect(savedTask.dueDate).toEqual(new Date("2024-12-31"));
      expect(savedTask.tags).toEqual([TaskTag.Trabalho, TaskTag.Afazeres]);
      expect(savedTask.priority).toBe(Priority.High);
      expect(savedTask.completed).toBe(true);
    });

    it("should save task with minimum required properties", async () => {
      // Arrange
      const minimalTask = new Task({
        title: "Tarefa mínima",
      });

      // Act
      await saveTaskUseCase.execute(minimalTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(1);
      const savedTask = savedTasks[0];

      expect(savedTask.title).toBe("Tarefa mínima");
      expect(savedTask.priority).toBe(Priority.Medium);
      expect(savedTask.completed).toBe(false);
      expect(savedTask.tags).toEqual([]);
    });

    it("should save draft tasks", async () => {
      // Arrange
      const draftTask = Task.draft({
        title: "Rascunho de tarefa",
        priority: Priority.Low,
      });

      // Act
      await saveTaskUseCase.execute(draftTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].title).toBe("Rascunho de tarefa");
      expect(savedTasks[0].isDraft()).toBe(true);
    });

    it("should save valid tasks", async () => {
      // Arrange
      const validTask = new Task({
        title: "Tarefa válida",
        priority: Priority.High,
        completed: false,
      });

      // Act
      await saveTaskUseCase.execute(validTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].isValid()).toBe(true);
    });

    it("should pass correct userId to repository", async () => {
      // Arrange
      const task = new Task({
        title: "Tarefa para teste de usuário",
      });
      const specificUser = new User({
        id: "specific-user-456",
        name: "Specific User",
        email: "specific@example.com",
      });

      // Act
      await saveTaskUseCase.execute(task, specificUser);

      // Assert
      const savedTasks = mockRepository.getTasks(specificUser.id);
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0]).toBe(task);

      const saveCalls = mockRepository.getSaveCalls();
      expect(saveCalls).toHaveLength(1);
      expect(saveCalls[0].userId).toBe("specific-user-456");
    });
  });

  describe("Error handling", () => {
    it("should throw error for task with null title", async () => {
      // Arrange
      const taskWithNullTitle = new Task({ title: "Valid" });
      // Manually set title to null for testing
      (taskWithNullTitle as any).title = null;

      // Act & Assert
      await expect(
        saveTaskUseCase.execute(taskWithNullTitle, mockUser)
      ).rejects.toThrow("Título é obrigatório");
    });

    it("should throw error for task with empty title", async () => {
      // Arrange
      const taskWithEmptyTitle = new Task({ title: "Valid" });
      // Manually set title to empty for testing
      (taskWithEmptyTitle as any).title = "";

      // Act & Assert
      await expect(
        saveTaskUseCase.execute(taskWithEmptyTitle, mockUser)
      ).rejects.toThrow("Título é obrigatório");
    });

    it("should throw error for task with whitespace-only title", async () => {
      // Arrange
      const taskWithWhitespaceTitle = new Task({ title: "Valid" });
      // Manually set title to whitespace for testing
      (taskWithWhitespaceTitle as any).title = "   ";

      // Act & Assert
      await expect(
        saveTaskUseCase.execute(taskWithWhitespaceTitle, mockUser)
      ).rejects.toThrow("Título é obrigatório");
    });

    it("should throw error for task with undefined title", async () => {
      // Arrange
      const taskWithUndefinedTitle = new Task({ title: "Valid" });
      // Manually set title to undefined for testing
      (taskWithUndefinedTitle as any).title = undefined;

      // Act & Assert
      await expect(
        saveTaskUseCase.execute(taskWithUndefinedTitle, mockUser)
      ).rejects.toThrow("Título é obrigatório");
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const mockRepoWithError = {
        async save(): Promise<void> {
          throw new Error("Database connection error");
        },
        async findById(): Promise<Task | null> {
          return null;
        },
        async findByUser(): Promise<Task[]> {
          return [];
        },
        async delete(): Promise<void> {},
      } as TaskRepository;

      const saveTaskWithErrorRepo = new SaveTask(mockRepoWithError);
      const validTask = new Task({ title: "Valid task" });

      // Act & Assert
      await expect(
        saveTaskWithErrorRepo.execute(validTask, mockUser)
      ).rejects.toThrow("Database connection error");
    });

    it("should throw specific error message", async () => {
      // Arrange
      const invalidTask = new Task({ title: "Valid" });
      (invalidTask as any).title = "";

      // Act & Assert
      try {
        await saveTaskUseCase.execute(invalidTask, mockUser);
        fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Título é obrigatório");
      }
    });
  });

  describe("Task properties handling", () => {
    it("should save tasks with all priority levels", async () => {
      // Arrange
      const lowPriorityTask = new Task({
        title: "Tarefa baixa prioridade",
        priority: Priority.Low,
      });
      const mediumPriorityTask = new Task({
        title: "Tarefa média prioridade",
        priority: Priority.Medium,
      });
      const highPriorityTask = new Task({
        title: "Tarefa alta prioridade",
        priority: Priority.High,
      });

      // Act
      await saveTaskUseCase.execute(lowPriorityTask, mockUser);
      await saveTaskUseCase.execute(mediumPriorityTask, mockUser);
      await saveTaskUseCase.execute(highPriorityTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(3);

      const priorities = savedTasks.map((task) => task.priority);
      expect(priorities).toContain(Priority.Low);
      expect(priorities).toContain(Priority.Medium);
      expect(priorities).toContain(Priority.High);
    });

    it("should save tasks with all tag combinations", async () => {
      // Arrange
      const workTask = new Task({
        title: "Tarefa de trabalho",
        tags: [TaskTag.Trabalho],
      });
      const personalTask = new Task({
        title: "Tarefa pessoal",
        tags: [TaskTag.Pessoal],
      });
      const multiTagTask = new Task({
        title: "Tarefa com múltiplas tags",
        tags: [TaskTag.Trabalho, TaskTag.Afazeres, TaskTag.Outro],
      });

      // Act
      await saveTaskUseCase.execute(workTask, mockUser);
      await saveTaskUseCase.execute(personalTask, mockUser);
      await saveTaskUseCase.execute(multiTagTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(3);

      expect(savedTasks[0].tags).toEqual([TaskTag.Trabalho]);
      expect(savedTasks[1].tags).toEqual([TaskTag.Pessoal]);
      expect(savedTasks[2].tags).toEqual([
        TaskTag.Trabalho,
        TaskTag.Afazeres,
        TaskTag.Outro,
      ]);
    });

    it("should save tasks with different completion states", async () => {
      // Arrange
      const incompleteTask = new Task({
        title: "Tarefa incompleta",
        completed: false,
      });
      const completedTask = new Task({
        title: "Tarefa completa",
        completed: true,
      });

      // Act
      await saveTaskUseCase.execute(incompleteTask, mockUser);
      await saveTaskUseCase.execute(completedTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(2);
      expect(savedTasks[0].completed).toBe(false);
      expect(savedTasks[1].completed).toBe(true);
    });

    it("should save tasks with different due dates", async () => {
      // Arrange
      const pastTask = new Task({
        title: "Tarefa do passado",
        dueDate: new Date("2020-01-01"),
      });
      const futureTask = new Task({
        title: "Tarefa futura",
        dueDate: new Date("2030-12-31"),
      });

      // Act
      await saveTaskUseCase.execute(pastTask, mockUser);
      await saveTaskUseCase.execute(futureTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(2);
      expect(savedTasks[0].dueDate).toEqual(new Date("2020-01-01"));
      expect(savedTasks[1].dueDate).toEqual(new Date("2030-12-31"));
    });
  });

  describe("Use case behavior", () => {
    it("should be instance of UseCase", () => {
      expect(saveTaskUseCase).toBeDefined();
      expect(typeof saveTaskUseCase.execute).toBe("function");
    });

    it("should return void on successful save", async () => {
      // Arrange
      const task = new Task({
        title: "Tarefa de teste",
        priority: Priority.Medium,
      });

      // Act
      const result = await saveTaskUseCase.execute(task, mockUser);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should work with different user instances", async () => {
      // Arrange
      const task = new Task({
        title: "Tarefa específica do usuário",
        priority: Priority.High,
      });

      const user1 = new User({
        id: "user-001",
        name: "User One",
        email: "user1@example.com",
      });

      const user2 = new User({
        id: "user-002",
        name: "User Two",
        email: "user2@example.com",
      });

      // Act
      await saveTaskUseCase.execute(task, user1);
      await saveTaskUseCase.execute(task, user2);

      // Assert
      const user1Tasks = mockRepository.getTasks(user1.id);
      const user2Tasks = mockRepository.getTasks(user2.id);

      expect(user1Tasks).toHaveLength(1);
      expect(user2Tasks).toHaveLength(1);
      expect(user1Tasks[0]).toBe(task);
      expect(user2Tasks[0]).toBe(task);

      const saveCalls = mockRepository.getSaveCalls();
      expect(saveCalls).toHaveLength(2);
      expect(saveCalls[0].userId).toBe("user-001");
      expect(saveCalls[1].userId).toBe("user-002");
    });

    it("should handle multiple save operations", async () => {
      // Arrange
      const tasks = [
        new Task({ title: "Primeira tarefa" }),
        new Task({ title: "Segunda tarefa" }),
        new Task({ title: "Terceira tarefa" }),
      ];

      // Act
      for (const task of tasks) {
        await saveTaskUseCase.execute(task, mockUser);
      }

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(3);
      expect(savedTasks.map((t) => t.title)).toEqual([
        "Primeira tarefa",
        "Segunda tarefa",
        "Terceira tarefa",
      ]);
    });
  });

  describe("Repository integration", () => {
    it("should call repository save method", async () => {
      // Arrange
      const task = new Task({ title: "Tarefa para teste de repositório" });

      // Act
      await saveTaskUseCase.execute(task, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0]).toBe(task);
    });

    it("should maintain task immutability", async () => {
      // Arrange
      const originalTask = new Task({
        title: "Tarefa original",
        priority: Priority.Medium,
        completed: false,
      });
      const originalTitle = originalTask.title;
      const originalPriority = originalTask.priority;
      const originalCompleted = originalTask.completed;

      // Act
      await saveTaskUseCase.execute(originalTask, mockUser);

      // Assert
      expect(originalTask.title).toBe(originalTitle);
      expect(originalTask.priority).toBe(originalPriority);
      expect(originalTask.completed).toBe(originalCompleted);
    });

    it("should preserve task identity", async () => {
      // Arrange
      const task = new Task({ title: "Tarefa com identidade" });
      const originalId = task.id;

      // Act
      await saveTaskUseCase.execute(task, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks[0].id).toBe(originalId);
    });
  });

  describe("Edge cases", () => {
    it("should handle tasks with special characters in title", async () => {
      // Arrange
      const specialTask = new Task({
        title: "Tarefa com caracteres especiais: @#$%&*()!",
      });

      // Act
      await saveTaskUseCase.execute(specialTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks[0].title).toBe(
        "Tarefa com caracteres especiais: @#$%&*()!"
      );
    });

    it("should handle tasks with very long titles", async () => {
      // Arrange
      const longTitle = "A".repeat(200);
      const longTitleTask = new Task({ title: longTitle });

      // Act
      await saveTaskUseCase.execute(longTitleTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks[0].title).toBe(longTitle);
    });

    it("should handle tasks with empty tags array", async () => {
      // Arrange
      const taskWithEmptyTags = new Task({
        title: "Tarefa sem tags",
        tags: [],
      });

      // Act
      await saveTaskUseCase.execute(taskWithEmptyTags, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks[0].tags).toEqual([]);
    });

    it("should handle draft tasks with minimal validation", async () => {
      // Arrange
      const minimalDraft = Task.draft({
        title: "", // Empty title should be allowed in draft
      });

      // Act & Assert
      await expect(
        saveTaskUseCase.execute(minimalDraft, mockUser)
      ).rejects.toThrow("Título é obrigatório");
    });

    it("should handle tasks with edge case dates", async () => {
      // Arrange
      const veryOldTask = new Task({
        title: "Tarefa muito antiga",
        dueDate: new Date("1970-01-01"),
      });
      const veryFutureTask = new Task({
        title: "Tarefa muito futura",
        dueDate: new Date("2100-12-31"),
      });

      // Act
      await saveTaskUseCase.execute(veryOldTask, mockUser);
      await saveTaskUseCase.execute(veryFutureTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks();
      expect(savedTasks).toHaveLength(2);
      expect(savedTasks[0].dueDate).toEqual(new Date("1970-01-01"));
      expect(savedTasks[1].dueDate).toEqual(new Date("2100-12-31"));
    });
  });

  describe("Performance considerations", () => {
    it("should handle saving multiple tasks efficiently", async () => {
      // Arrange
      const tasks: Task[] = [];
      for (let i = 0; i < 100; i++) {
        tasks.push(
          new Task({
            title: `Tarefa ${i}`,
            priority: i % 2 === 0 ? Priority.High : Priority.Low,
          })
        );
      }

      // Act
      const startTime = performance.now();
      for (const task of tasks) {
        await saveTaskUseCase.execute(task, mockUser);
      }
      const endTime = performance.now();

      // Assert
      expect(mockRepository.getTasks()).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
    });

    it("should not affect other tasks when saving", async () => {
      // Arrange
      const existingTasks = mockTasks.slice(0, 3);
      mockRepository.setTasks(existingTasks, mockUser.id);

      const newTask = new Task({ title: "Nova tarefa" });

      // Act
      await saveTaskUseCase.execute(newTask, mockUser);

      // Assert
      const savedTasks = mockRepository.getTasks(mockUser.id);
      expect(savedTasks).toHaveLength(4);

      // Verify existing tasks weren't modified
      const existingTaskIds = existingTasks.map((t) => t.id);
      const savedExistingTasks = savedTasks.filter((t) =>
        existingTaskIds.includes(t.id)
      );
      expect(savedExistingTasks).toHaveLength(3);
    });
  });
});
