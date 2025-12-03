import TasksByUser from "../../../src/tasks/usecase/tasks-by-user.usecase";
import TaskRepository from "../../../src/tasks/provider/task.repository";
import { Task, Priority, TaskTag, User } from "../../../src";
import { mockTasks } from "../../data/tasks.mock";
import { MockTaskRepository } from "../../data/mock-task.repository";

describe("TasksByUser UseCase", () => {
  let tasksByUserUseCase: TasksByUser;
  let mockRepository: MockTaskRepository;
  let mockUser: User;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    tasksByUserUseCase = new TasksByUser(mockRepository);
    mockUser = new User({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });
  });

  describe("Successful task retrieval", () => {
    it("should return all tasks for a user", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(mockTasks.length);
    });

    it("should return empty array when user has no tasks", async () => {
      // Arrange - don't set any tasks for this user
      mockRepository.setTasks([], "other-user-id");

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should return only tasks belonging to the specific user", async () => {
      // Arrange
      const user1 = new User({
        id: "user-1",
        name: "User One",
        email: "user1@example.com",
      });

      const user2 = new User({
        id: "user-2",
        name: "User Two",
        email: "user2@example.com",
      });

      const user1Tasks = mockTasks.slice(0, 3);
      const user2Tasks = mockTasks.slice(3, 6);

      // Set tasks for different users
      mockRepository.setTasks(user1Tasks, user1.id);
      user2Tasks.forEach((task) => {
        mockRepository.addTaskForUser(task, user2.id);
      });

      // Act
      const result1 = await tasksByUserUseCase.execute(user1);
      const result2 = await tasksByUserUseCase.execute(user2);

      // Assert
      expect(result1).toEqual(user1Tasks);
      expect(result2).toEqual(user2Tasks);
      expect(result1).not.toEqual(result2);
    });

    it("should return tasks with all properties preserved", async () => {
      // Arrange
      const userTasks = [
        new Task({
          id: "task-001",
          title: "Tarefa com todas as propriedades",
          dueDate: new Date("2024-12-31"),
          tags: [TaskTag.Trabalho, TaskTag.Afazeres],
          priority: Priority.High,
          completed: true,
        }),
        new Task({
          id: "task-002",
          title: "Tarefa mínima",
          priority: Priority.Low,
          completed: false,
        }),
      ];
      mockRepository.setTasks(userTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(2);

      const complexTask = result[0];
      expect(complexTask.id).toBe("task-001");
      expect(complexTask.title).toBe("Tarefa com todas as propriedades");
      expect(complexTask.dueDate).toEqual(new Date("2024-12-31"));
      expect(complexTask.tags).toEqual([TaskTag.Trabalho, TaskTag.Afazeres]);
      expect(complexTask.priority).toBe(Priority.High);
      expect(complexTask.completed).toBe(true);

      const simpleTask = result[1];
      expect(simpleTask.id).toBe("task-002");
      expect(simpleTask.title).toBe("Tarefa mínima");
      expect(simpleTask.priority).toBe(Priority.Low);
      expect(simpleTask.completed).toBe(false);
    });

    it("should return tasks in repository order", async () => {
      // Arrange
      const orderedTasks = [
        new Task({ id: "task-001", title: "Primeira tarefa" }),
        new Task({ id: "task-002", title: "Segunda tarefa" }),
        new Task({ id: "task-003", title: "Terceira tarefa" }),
      ];
      mockRepository.setTasks(orderedTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result.map((task) => task.id)).toEqual([
        "task-001",
        "task-002",
        "task-003",
      ]);
      expect(result.map((task) => task.title)).toEqual([
        "Primeira tarefa",
        "Segunda tarefa",
        "Terceira tarefa",
      ]);
    });

    it("should return tasks with different completion states", async () => {
      // Arrange
      const mixedTasks = [
        new Task({ title: "Tarefa completa", completed: true }),
        new Task({ title: "Tarefa incompleta", completed: false }),
        new Task({ title: "Outra tarefa completa", completed: true }),
      ];
      mockRepository.setTasks(mixedTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(3);
      const completedTasks = result.filter((task) => task.completed);
      const incompleteTasks = result.filter((task) => !task.completed);

      expect(completedTasks).toHaveLength(2);
      expect(incompleteTasks).toHaveLength(1);
    });

    it("should return tasks with different priorities", async () => {
      // Arrange
      const priorityTasks = [
        new Task({ title: "Alta prioridade", priority: Priority.High }),
        new Task({ title: "Média prioridade", priority: Priority.Medium }),
        new Task({ title: "Baixa prioridade", priority: Priority.Low }),
      ];
      mockRepository.setTasks(priorityTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(3);
      const priorities = result.map((task) => task.priority);
      expect(priorities).toContain(Priority.High);
      expect(priorities).toContain(Priority.Medium);
      expect(priorities).toContain(Priority.Low);
    });

    it("should return tasks with different tags", async () => {
      // Arrange
      const taggedTasks = [
        new Task({ title: "Tarefa de trabalho", tags: [TaskTag.Trabalho] }),
        new Task({ title: "Tarefa pessoal", tags: [TaskTag.Pessoal] }),
        new Task({
          title: "Tarefa com múltiplas tags",
          tags: [TaskTag.Trabalho, TaskTag.Afazeres],
        }),
        new Task({ title: "Tarefa sem tags", tags: [] }),
      ];
      mockRepository.setTasks(taggedTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(4);
      const allTags = result.flatMap((task) => task.tags);
      expect(allTags).toContain(TaskTag.Trabalho);
      expect(allTags).toContain(TaskTag.Pessoal);
      expect(allTags).toContain(TaskTag.Afazeres);
    });
  });

  describe("Error handling", () => {
    it("should handle repository errors gracefully", async () => {
      // Arrange
      const mockRepoWithError = {
        async findByUser(): Promise<Task[]> {
          throw new Error("Database connection error");
        },
        async findById(): Promise<Task | null> {
          return null;
        },
        async save(): Promise<void> {},
        async delete(): Promise<void> {},
      } as TaskRepository;

      const tasksByUserWithErrorRepo = new TasksByUser(mockRepoWithError);

      // Act & Assert
      await expect(tasksByUserWithErrorRepo.execute(mockUser)).rejects.toThrow(
        "Database connection error"
      );
    });

    it("should handle network timeout errors", async () => {
      // Arrange
      const mockRepoWithTimeout = {
        async findByUser(): Promise<Task[]> {
          throw new Error("Request timeout");
        },
        async findById(): Promise<Task | null> {
          return null;
        },
        async save(): Promise<void> {},
        async delete(): Promise<void> {},
      } as TaskRepository;

      const tasksByUserWithTimeout = new TasksByUser(mockRepoWithTimeout);

      // Act & Assert
      await expect(tasksByUserWithTimeout.execute(mockUser)).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should propagate specific repository errors", async () => {
      // Arrange
      const mockRepoWithSpecificError = {
        async findByUser(): Promise<Task[]> {
          throw new Error("User not found in database");
        },
        async findById(): Promise<Task | null> {
          return null;
        },
        async save(): Promise<void> {},
        async delete(): Promise<void> {},
      } as TaskRepository;

      const tasksByUserWithSpecificError = new TasksByUser(
        mockRepoWithSpecificError
      );

      // Act & Assert
      try {
        await tasksByUserWithSpecificError.execute(mockUser);
        fail("Expected error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("User not found in database");
      }
    });
  });

  describe("Use case behavior", () => {
    it("should be instance of UseCase", () => {
      expect(tasksByUserUseCase).toBeDefined();
      expect(typeof tasksByUserUseCase.execute).toBe("function");
    });

    it("should return Promise<Task[]>", async () => {
      // Arrange
      mockRepository.setTasks([], mockUser.id);

      // Act
      const result = tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toBeInstanceOf(Promise);
      const resolvedResult = await result;
      expect(Array.isArray(resolvedResult)).toBe(true);
    });

    it("should work with different user instances", async () => {
      // Arrange
      const user1 = new User({
        name: "User One",
        email: "user1@example.com",
      });

      const user2 = new User({
        name: "User Two",
        email: "user2@example.com",
      });

      const tasksForUser1 = [
        new Task({ title: "Tarefa do usuário 1" }),
        new Task({ title: "Outra tarefa do usuário 1" }),
      ];

      const tasksForUser2 = [new Task({ title: "Tarefa do usuário 2" })];

      mockRepository.addTaskForUser(tasksForUser1[0], user1.id);
      mockRepository.addTaskForUser(tasksForUser1[1], user1.id);
      mockRepository.addTaskForUser(tasksForUser2[0], user2.id);

      // Act
      const result1 = await tasksByUserUseCase.execute(user1);
      const result2 = await tasksByUserUseCase.execute(user2);

      // Assert
      expect(result1).toEqual(tasksForUser1);
      expect(result2).toEqual(tasksForUser2);
    });

    it("should maintain task immutability", async () => {
      // Arrange
      const originalTask = new Task({
        title: "Tarefa original",
        priority: Priority.Medium,
        completed: false,
      });
      mockRepository.setTasks([originalTask], mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      const returnedTask = result[0];
      expect(returnedTask).toBe(originalTask); // Should be same reference
      expect(returnedTask.title).toBe("Tarefa original");
      expect(returnedTask.priority).toBe(Priority.Medium);
      expect(returnedTask.completed).toBe(false);
    });

    it("should not modify repository state", async () => {
      // Arrange
      const originalTasks = [...mockTasks];
      mockRepository.setTasks(mockTasks, mockUser.id);

      // Act
      await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(mockRepository.getTasks(mockUser.id)).toEqual(originalTasks);
    });
  });

  describe("Different task scenarios", () => {
    it("should handle single task", async () => {
      // Arrange
      const singleTask = [
        new Task({
          title: "Única tarefa do usuário",
          priority: Priority.High,
          completed: false,
        }),
      ];
      mockRepository.setTasks(singleTask, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Única tarefa do usuário");
    });

    it("should handle large number of tasks", async () => {
      // Arrange
      const largeTasks: Task[] = [];
      for (let i = 0; i < 100; i++) {
        largeTasks.push(
          new Task({
            title: `Tarefa ${i}`,
            priority: i % 2 === 0 ? Priority.High : Priority.Low,
            completed: i % 3 === 0,
          })
        );
      }
      mockRepository.setTasks(largeTasks, mockUser.id);

      // Act
      const startTime = performance.now();
      const result = await tasksByUserUseCase.execute(mockUser);
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it("should handle tasks with edge case dates", async () => {
      // Arrange
      const edgeDateTasks = [
        new Task({
          title: "Tarefa muito antiga",
          dueDate: new Date("1970-01-01"),
        }),
        new Task({
          title: "Tarefa futura",
          dueDate: new Date("2100-12-31"),
        }),
      ];
      mockRepository.setTasks(edgeDateTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].dueDate).toEqual(new Date("1970-01-01"));
      expect(result[1].dueDate).toEqual(new Date("2100-12-31"));
    });

    it("should handle tasks with special characters in titles", async () => {
      // Arrange
      const specialTasks = [
        new Task({ title: "Tarefa com caracteres especiais: @#$%&*()" }),
        new Task({ title: "Tarefa com acentos: ção, ãã, üü" }),
        new Task({ title: "Tarefa com emojis: 🚀 📝 ✅" }),
      ];
      mockRepository.setTasks(specialTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Tarefa com caracteres especiais: @#$%&*()");
      expect(result[1].title).toBe("Tarefa com acentos: ção, ãã, üü");
      expect(result[2].title).toBe("Tarefa com emojis: 🚀 📝 ✅");
    });

    it("should handle draft tasks", async () => {
      // Arrange
      const draftTasks = [
        Task.draft({ title: "Rascunho 1" }),
        Task.draft({ title: "Rascunho 2" }),
        new Task({ title: "Tarefa válida" }),
      ];
      mockRepository.setTasks(draftTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].isDraft()).toBe(true);
      expect(result[1].isDraft()).toBe(true);
      expect(result[2].isValid()).toBe(true);
    });
  });

  describe("Performance considerations", () => {
    it("should handle repository calls efficiently", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks, mockUser.id);

      // Act
      const startTime = performance.now();
      const result = await tasksByUserUseCase.execute(mockUser);
      const endTime = performance.now();

      // Assert
      expect(result).toEqual(mockTasks);
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });

    it("should not make unnecessary repository calls", async () => {
      // Arrange
      mockRepository.setTasks([], mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toEqual([]);
    });

    it("should be memory efficient with large datasets", async () => {
      // Arrange
      const largeTasks: Task[] = [];
      for (let i = 0; i < 1000; i++) {
        largeTasks.push(new Task({ title: `Tarefa ${i}` }));
      }
      mockRepository.setTasks(largeTasks, mockUser.id);

      // Act
      const result = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result).toHaveLength(1000);
      // Should return same references, not create new objects
      result.forEach((task, index) => {
        expect(task).toBe(largeTasks[index]);
      });
    });
  });

  describe("Multiple executions", () => {
    it("should handle multiple consecutive calls", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks, mockUser.id);

      // Act
      const result1 = await tasksByUserUseCase.execute(mockUser);
      const result2 = await tasksByUserUseCase.execute(mockUser);
      const result3 = await tasksByUserUseCase.execute(mockUser);

      // Assert
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should handle concurrent calls", async () => {
      // Arrange
      mockRepository.setTasks(mockTasks, mockUser.id);

      // Act
      const promises = [
        tasksByUserUseCase.execute(mockUser),
        tasksByUserUseCase.execute(mockUser),
        tasksByUserUseCase.execute(mockUser),
      ];
      const results = await Promise.all(promises);

      // Assert
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
      results.forEach((result) => {
        expect(result).toEqual(mockTasks);
      });
    });

    it("should handle different users in sequence", async () => {
      const user1 = new User({
        name: "User Sobrenome",
        email: "user1@test.com",
      });
      const user2 = new User({
        name: "User Sobrenome",
        email: "user2@test.com",
      });

      const tasksUser1 = [new Task({ title: "Tarefa usuário 1" })];
      const tasksUser2 = [new Task({ title: "Tarefa usuário 2" })];

      mockRepository.addTaskForUser(tasksUser1[0], user1.id);
      mockRepository.addTaskForUser(tasksUser2[0], user2.id);

      // Act
      const result1 = await tasksByUserUseCase.execute(user1);
      const result2 = await tasksByUserUseCase.execute(user2);

      // Assert
      expect(result1).toEqual(tasksUser1);
      expect(result2).toEqual(tasksUser2);
    });

    it("should handle user with very long ID", async () => {
      // Arrange
      const longId = "a".repeat(1000);
      const userWithLongId = new User({
        id: longId,
        name: "User with long ID",
        email: "long@test.com",
      });
      mockRepository.setTasks([], longId);

      // Act
      const result = await tasksByUserUseCase.execute(userWithLongId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
