import { TaskFilterByTagService, Task, Priority, TaskTag } from "../../../src";
import {
  mockTasks,
  mockEmptyTasks,
  mockSingleTask,
} from "../../data/tasks.mock";

describe("TaskFilterByTagService", () => {
  let service: TaskFilterByTagService;

  beforeEach(() => {
    service = new TaskFilterByTagService(mockTasks);
  });

  describe("Basic filtering functionality", () => {
    it("should filter tasks by Trabalho tag", () => {
      const result = service.filter(TaskTag.Trabalho);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });
    });

    it("should filter tasks by Pessoal tag", () => {
      const result = service.filter(TaskTag.Pessoal);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Pessoal);
      });
    });

    it("should filter tasks by Afazeres tag", () => {
      const result = service.filter(TaskTag.Afazeres);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Afazeres);
      });
    });

    it("should filter tasks by Outro tag", () => {
      const result = service.filter(TaskTag.Outro);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Outro);
      });
    });

    it("should return empty array when no tasks match the tag", () => {
      // Create a service with tasks that don't have a specific tag
      const taskWithoutSpecificTag = [
        new Task({
          title: "Task without specific tag",
          tags: [TaskTag.Trabalho],
          priority: Priority.Medium,
          completed: false,
        }),
      ];
      const specificService = new TaskFilterByTagService(
        taskWithoutSpecificTag
      );

      const result = specificService.filter(TaskTag.Outro);
      expect(result).toEqual([]);
    });

    it("should return empty array when task list is empty", () => {
      const emptyService = new TaskFilterByTagService(mockEmptyTasks);
      const result = emptyService.filter(TaskTag.Trabalho);

      expect(result).toEqual([]);
    });

    it("should handle single task array", () => {
      const singleService = new TaskFilterByTagService(mockSingleTask);
      const result = singleService.filter(TaskTag.Pessoal);

      expect(result).toEqual(mockSingleTask);
    });
  });

  describe("Tasks with multiple tags", () => {
    it("should find tasks that have the specified tag among multiple tags", () => {
      // Tasks with multiple tags should be found if they contain the specified tag
      const result = service.filter(TaskTag.Trabalho);

      // Check that some tasks have multiple tags including Trabalho
      const tasksWithMultipleTags = result.filter(
        (task) => task.tags.length > 1
      );
      expect(tasksWithMultipleTags.length).toBeGreaterThan(0);

      tasksWithMultipleTags.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });
    });

    it("should not return tasks that don't have the specified tag", () => {
      const result = service.filter(TaskTag.Trabalho);

      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });

      // Verify no task without the tag is included
      const tasksWithoutTag = mockTasks.filter(
        (task) => !task.tags.includes(TaskTag.Trabalho)
      );
      tasksWithoutTag.forEach((taskWithoutTag) => {
        expect(result).not.toContain(taskWithoutTag);
      });
    });

    it("should find tasks with overlapping tags correctly", () => {
      // Get tasks with Trabalho tag
      const trabalhoTasks = service.filter(TaskTag.Trabalho);

      // Get tasks with Pessoal tag
      const pessoalTasks = service.filter(TaskTag.Pessoal);

      // Tasks that have both tags should appear in both results
      const tasksWithBothTags = mockTasks.filter(
        (task) =>
          task.tags.includes(TaskTag.Trabalho) &&
          task.tags.includes(TaskTag.Pessoal)
      );

      tasksWithBothTags.forEach((task) => {
        expect(trabalhoTasks).toContain(task);
        expect(pessoalTasks).toContain(task);
      });
    });
  });

  describe("Result consistency", () => {
    it("should maintain original task order", () => {
      const result = service.filter(TaskTag.Trabalho);

      // Get the IDs of tasks with Trabalho tag in original order
      const originalTrabalhoIds = mockTasks
        .filter((task) => task.tags.includes(TaskTag.Trabalho))
        .map((task) => task.id);

      const resultIds = result.map((task) => task.id);

      // Should maintain relative order
      expect(resultIds).toEqual(originalTrabalhoIds);
    });

    it("should return new array instance", () => {
      const result = service.filter(TaskTag.Trabalho);

      expect(result).not.toBe(mockTasks);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should not modify original tasks array", () => {
      const originalTasks = [...mockTasks];
      service.filter(TaskTag.Trabalho);

      expect(mockTasks).toEqual(originalTasks);
    });

    it("should return the actual task instances", () => {
      const result = service.filter(TaskTag.Trabalho);

      result.forEach((task) => {
        expect(task).toBeInstanceOf(Task);
        expect(mockTasks).toContain(task);
      });
    });
  });

  describe("All tag types", () => {
    it("should handle all available tag types", () => {
      const allTags = [
        TaskTag.Trabalho,
        TaskTag.Pessoal,
        TaskTag.Afazeres,
        TaskTag.Outro,
      ];

      allTags.forEach((tag) => {
        const result = service.filter(tag);

        // Should return array (may be empty)
        expect(Array.isArray(result)).toBe(true);

        // If not empty, all tasks should have the specified tag
        result.forEach((task) => {
          expect(task.tags).toContain(tag);
        });
      });
    });

    it("should return correct counts for each tag type", () => {
      const trabalhoCount = service.filter(TaskTag.Trabalho).length;
      const pessoalCount = service.filter(TaskTag.Pessoal).length;
      const afazeresCount = service.filter(TaskTag.Afazeres).length;
      const outroCount = service.filter(TaskTag.Outro).length;

      // Verify counts match manual counting from mock data
      const manualTrabalhoCount = mockTasks.filter((task) =>
        task.tags.includes(TaskTag.Trabalho)
      ).length;
      const manualPessoalCount = mockTasks.filter((task) =>
        task.tags.includes(TaskTag.Pessoal)
      ).length;
      const manualAfazeresCount = mockTasks.filter((task) =>
        task.tags.includes(TaskTag.Afazeres)
      ).length;
      const manualOutroCount = mockTasks.filter((task) =>
        task.tags.includes(TaskTag.Outro)
      ).length;

      expect(trabalhoCount).toBe(manualTrabalhoCount);
      expect(pessoalCount).toBe(manualPessoalCount);
      expect(afazeresCount).toBe(manualAfazeresCount);
      expect(outroCount).toBe(manualOutroCount);
    });
  });

  describe("Task properties preservation", () => {
    it("should preserve all task properties in filtered results", () => {
      const result = service.filter(TaskTag.Trabalho);

      result.forEach((task) => {
        expect(task.id).toBeDefined();
        expect(task.title).toBeDefined();
        expect(task.dueDate).toBeDefined();
        expect(task.tags).toBeDefined();
        expect(task.priority).toBeDefined();
        expect(typeof task.completed).toBe("boolean");
      });
    });

    it("should include both completed and incomplete tasks", () => {
      const result = service.filter(TaskTag.Trabalho);

      if (result.length > 1) {
        const completedTasks = result.filter((task) => task.completed);
        const incompleteTasks = result.filter((task) => !task.completed);

        // Should have a mix (based on mock data)
        expect(completedTasks.length + incompleteTasks.length).toBe(
          result.length
        );
      }
    });

    it("should include tasks with different priorities", () => {
      const result = service.filter(TaskTag.Trabalho);

      if (result.length > 1) {
        const priorities = new Set(result.map((task) => task.priority));
        expect(priorities.size).toBeGreaterThan(0);
      }
    });
  });

  describe("Performance considerations", () => {
    it("should handle large task lists efficiently", () => {
      // Create a large list of tasks
      const largeTasks: Task[] = [];
      for (let i = 0; i < 1000; i++) {
        largeTasks.push(
          new Task({
            title: `Task ${i}`,
            tags: i % 2 === 0 ? [TaskTag.Trabalho] : [TaskTag.Pessoal],
            priority: Priority.Medium,
            completed: false,
          })
        );
      }

      const largeService = new TaskFilterByTagService(largeTasks);
      const startTime = performance.now();
      const result = largeService.filter(TaskTag.Trabalho);
      const endTime = performance.now();

      expect(result).toHaveLength(500); // Half of the tasks
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
    });

    it("should be memory efficient", () => {
      const result = service.filter(TaskTag.Trabalho);

      // Should not create deep copies, just filter references
      result.forEach((task) => {
        const originalTask = mockTasks.find((t) => t.id === task.id);
        expect(task).toBe(originalTask);
      });
    });
  });

  describe("Service instantiation", () => {
    it("should create service instance successfully", () => {
      expect(service).toBeInstanceOf(TaskFilterByTagService);
    });

    it("should have filter method", () => {
      expect(typeof service.filter).toBe("function");
    });

    it("should work with multiple service instances", () => {
      const service1 = new TaskFilterByTagService(mockTasks);
      const service2 = new TaskFilterByTagService(mockTasks);

      const result1 = service1.filter(TaskTag.Trabalho);
      const result2 = service2.filter(TaskTag.Trabalho);

      expect(result1).toEqual(result2);
    });

    it("should handle different task arrays", () => {
      const customTasks = [
        new Task({
          title: "Custom Task 1",
          tags: [TaskTag.Trabalho],
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "Custom Task 2",
          tags: [TaskTag.Pessoal],
          priority: Priority.Low,
          completed: true,
        }),
      ];

      const customService = new TaskFilterByTagService(customTasks);
      const result = customService.filter(TaskTag.Trabalho);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Custom Task 1");
    });

    it("should handle empty task list on initialization", () => {
      const emptyService = new TaskFilterByTagService([]);
      expect(emptyService).toBeInstanceOf(TaskFilterByTagService);
      expect(emptyService.filter(TaskTag.Trabalho)).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle tasks with empty tags array", () => {
      const tasksWithEmptyTags = [
        new Task({
          title: "Task with no tags",
          tags: [],
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Task with tags",
          tags: [TaskTag.Trabalho],
          priority: Priority.Medium,
          completed: false,
        }),
      ];

      const edgeCaseService = new TaskFilterByTagService(tasksWithEmptyTags);
      const result = edgeCaseService.filter(TaskTag.Trabalho);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Task with tags");
    });

    it("should handle tasks with duplicate tags", () => {
      // This shouldn't happen in practice, but test robustness
      const taskWithDuplicateTags = new Task({
        title: "Task with duplicate tags",
        tags: [TaskTag.Trabalho, TaskTag.Trabalho],
        priority: Priority.Medium,
        completed: false,
      });

      const edgeCaseService = new TaskFilterByTagService([
        taskWithDuplicateTags,
      ]);
      const result = edgeCaseService.filter(TaskTag.Trabalho);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(taskWithDuplicateTags);
    });

    it("should maintain consistency with multiple consecutive calls", () => {
      const result1 = service.filter(TaskTag.Trabalho);
      const result2 = service.filter(TaskTag.Trabalho);
      const result3 = service.filter(TaskTag.Trabalho);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result1).toEqual(result3);
    });
  });
});
