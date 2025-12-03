import {
  TaskFilterService,
  Task,
  Priority,
  TaskTag,
  DateUtils,
} from "../../../src";
import {
  mockTasks,
  mockEmptyTasks,
  mockSingleTask,
} from "../../data/tasks.mock";

describe("TaskFilterService", () => {
  let service: TaskFilterService;
  let today: Date;
  let tomorrow: Date;

  beforeEach(() => {
    today = DateUtils.startOfToday();
    tomorrow = DateUtils.startOfTomorrow();
    service = new TaskFilterService(mockTasks);
  });

  describe("Basic filtering functionality", () => {
    it("should return all tasks when filter is 'all'", () => {
      const result = service.filter("all");

      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(mockTasks.length);
    });

    it("should return completed tasks when filter is 'completed'", () => {
      const result = service.filter("completed");

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.completed).toBe(true);
      });
    });

    it("should return today's tasks when filter is 'today'", () => {
      const todayTasks = [
        new Task({
          title: "Today's task",
          dueDate: today,
          completed: false,
        }),
        new Task({
          title: "Yesterday's incomplete task",
          dueDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          completed: false,
        }),
      ];

      const todayService = new TaskFilterService(todayTasks);
      const result = todayService.filter("today");

      expect(result).toHaveLength(2);
    });

    it("should return weekly tasks when filter is 'week'", () => {
      const weekTasks = [
        new Task({
          title: "This week task",
          dueDate: tomorrow,
          completed: false,
        }),
        new Task({
          title: "Next week task",
          dueDate: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000),
          completed: false,
        }),
      ];

      const weekService = new TaskFilterService(weekTasks);
      const result = weekService.filter("week");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("This week task");
    });

    it("should handle empty task list", () => {
      const emptyService = new TaskFilterService(mockEmptyTasks);

      expect(emptyService.filter("all")).toEqual([]);
      expect(emptyService.filter("completed")).toEqual([]);
      expect(emptyService.filter("today")).toEqual([]);
      expect(emptyService.filter("week")).toEqual([]);
    });

    it("should handle single task array", () => {
      const singleService = new TaskFilterService(mockSingleTask);
      const result = singleService.filter("all");

      expect(result).toEqual(mockSingleTask);
    });
  });

  describe("Search filter", () => {
    it("should filter by search term", () => {
      const result = service.filter({ search: "autenticação" });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.title.toLowerCase()).toContain("autenticação");
      });
    });

    it("should handle empty search", () => {
      const result = service.filter({ search: "" });

      expect(result).toEqual(mockTasks);
    });

    it("should handle case insensitive search", () => {
      const result = service.filter({ search: "API" });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.title.toLowerCase()).toContain("api");
      });
    });

    it("should return empty array for non-matching search", () => {
      const result = service.filter({ search: "inexistente" });

      expect(result).toEqual([]);
    });

    it("should handle multiple word search", () => {
      const result = service.filter({ search: "código API" });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toContain("código");
      expect(result[0].title).toContain("API");
    });
  });

  describe("Tag filter", () => {
    it("should filter by tag", () => {
      const result = service.filter({ tag: TaskTag.Trabalho });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });
    });

    it("should filter by different tags", () => {
      const workTasks = service.filter({ tag: TaskTag.Trabalho });
      const personalTasks = service.filter({ tag: TaskTag.Pessoal });

      expect(workTasks.length).toBeGreaterThan(0);
      expect(personalTasks.length).toBeGreaterThan(0);

      workTasks.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });

      personalTasks.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Pessoal);
      });
    });

    it("should return empty array when no tasks match tag", () => {
      const tasksWithoutSpecificTag = [
        new Task({
          title: "Task without specific tag",
          tags: [TaskTag.Trabalho],
          completed: false,
        }),
      ];

      const specificService = new TaskFilterService(tasksWithoutSpecificTag);
      const result = specificService.filter({ tag: TaskTag.Outro });

      expect(result).toEqual([]);
    });

    it("should handle all available tag types", () => {
      const allTags = [
        TaskTag.Trabalho,
        TaskTag.Pessoal,
        TaskTag.Afazeres,
        TaskTag.Outro,
      ];

      allTags.forEach((tag) => {
        const result = service.filter({ tag });

        expect(Array.isArray(result)).toBe(true);
        result.forEach((task) => {
          expect(task.tags).toContain(tag);
        });
      });
    });
  });

  describe("Filter type combinations", () => {
    it("should handle different filter types independently", () => {
      const allTasks = service.filter("all");
      const completedTasks = service.filter("completed");
      const searchTasks = service.filter({ search: "API" });
      const tagTasks = service.filter({ tag: TaskTag.Trabalho });

      expect(allTasks).not.toEqual(completedTasks);
      expect(allTasks).not.toEqual(searchTasks);
      expect(allTasks).not.toEqual(tagTasks);
      expect(completedTasks).not.toEqual(searchTasks);
    });

    it("should maintain consistency across multiple calls", () => {
      const result1 = service.filter("completed");
      const result2 = service.filter("completed");
      const result3 = service.filter("completed");

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should handle complex scenarios", () => {
      const complexTasks = [
        new Task({
          title: "Completed work task today",
          dueDate: today,
          tags: [TaskTag.Trabalho],
          completed: true,
        }),
        new Task({
          title: "Incomplete personal task tomorrow",
          dueDate: tomorrow,
          tags: [TaskTag.Pessoal],
          completed: false,
        }),
        new Task({
          title: "API integration project",
          dueDate: today,
          tags: [TaskTag.Trabalho, TaskTag.Afazeres],
          completed: false,
        }),
      ];

      const complexService = new TaskFilterService(complexTasks);

      const allResults = complexService.filter("all");
      const completedResults = complexService.filter("completed");
      const todayResults = complexService.filter("today");
      const workResults = complexService.filter({ tag: TaskTag.Trabalho });
      const apiResults = complexService.filter({ search: "API" });

      expect(allResults).toHaveLength(3);
      expect(completedResults).toHaveLength(1);
      expect(todayResults).toHaveLength(2);
      expect(workResults).toHaveLength(2);
      expect(apiResults).toHaveLength(1);
    });
  });

  describe("Result consistency", () => {
    it("should maintain original task order", () => {
      const result = service.filter("all");

      expect(result.map((task) => task.id)).toEqual(
        mockTasks.map((task) => task.id)
      );
    });

    it("should return new array instances", () => {
      const result = service.filter("all");

      expect(result).not.toBe(mockTasks);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should not modify original tasks array", () => {
      const originalTasks = [...mockTasks];

      service.filter("completed");
      service.filter({ search: "test" });
      service.filter({ tag: TaskTag.Trabalho });

      expect(mockTasks).toEqual(originalTasks);
    });

    it("should return actual task instances", () => {
      const result = service.filter("all");

      result.forEach((task) => {
        expect(task).toBeInstanceOf(Task);
        expect(mockTasks).toContain(task);
      });
    });
  });

  describe("Task properties preservation", () => {
    it("should preserve all task properties in filtered results", () => {
      const result = service.filter("all");

      result.forEach((task) => {
        expect(task.id).toBeDefined();
        expect(task.title).toBeDefined();
        expect(task.dueDate).toBeDefined();
        expect(task.tags).toBeDefined();
        expect(task.priority).toBeDefined();
        expect(typeof task.completed).toBe("boolean");
      });
    });

    it("should include tasks with different properties", () => {
      const result = service.filter("all");

      const priorities = new Set(result.map((task) => task.priority));
      const completionStates = new Set(result.map((task) => task.completed));
      const allTags = new Set(result.flatMap((task) => task.tags));

      expect(priorities.size).toBeGreaterThan(1);
      expect(completionStates.size).toBe(2); // true and false
      expect(allTags.size).toBeGreaterThan(1);
    });

    it("should maintain task relationships across filters", () => {
      const workTasks = service.filter({ tag: TaskTag.Trabalho });
      const completedTasks = service.filter("completed");

      // Find tasks that are both work tasks and completed
      const workCompletedTasks = workTasks.filter((task) => task.completed);
      const completedWorkTasks = completedTasks.filter((task) =>
        task.tags.includes(TaskTag.Trabalho)
      );

      expect(workCompletedTasks).toEqual(completedWorkTasks);
    });
  });

  describe("Performance considerations", () => {
    it("should handle large task lists efficiently", () => {
      const largeTasks: Task[] = [];
      for (let i = 0; i < 1000; i++) {
        largeTasks.push(
          new Task({
            title: `Task ${i}`,
            tags: i % 2 === 0 ? [TaskTag.Trabalho] : [TaskTag.Pessoal],
            completed: i % 3 === 0,
            dueDate: i % 4 === 0 ? today : tomorrow,
          })
        );
      }

      const largeService = new TaskFilterService(largeTasks);

      const startTime = performance.now();
      const allResults = largeService.filter("all");
      const completedResults = largeService.filter("completed");
      const workResults = largeService.filter({ tag: TaskTag.Trabalho });
      const searchResults = largeService.filter({ search: "Task" });
      const endTime = performance.now();

      expect(allResults).toHaveLength(1000);
      expect(completedResults.length).toBeGreaterThan(0);
      expect(workResults).toHaveLength(500);
      expect(searchResults).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should be memory efficient", () => {
      const result = service.filter("all");

      result.forEach((task) => {
        const originalTask = mockTasks.find((t) => t.id === task.id);
        expect(task).toBe(originalTask);
      });
    });

    it("should reuse service instances efficiently", () => {
      const result1 = service.filter("completed");
      const result2 = service.filter({ tag: TaskTag.Trabalho });
      const result3 = service.filter({ search: "API" });

      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
      expect(result1).not.toBe(result3);
    });
  });

  describe("Service instantiation", () => {
    it("should create service instance successfully", () => {
      expect(service).toBeInstanceOf(TaskFilterService);
    });

    it("should have filter method", () => {
      expect(typeof service.filter).toBe("function");
    });

    it("should work with multiple service instances", () => {
      const service1 = new TaskFilterService(mockTasks);
      const service2 = new TaskFilterService(mockTasks);

      const result1 = service1.filter("completed");
      const result2 = service2.filter("completed");

      expect(result1).toEqual(result2);
    });

    it("should handle different task arrays", () => {
      const customTasks = [
        new Task({
          title: "Custom completed task",
          completed: true,
          tags: [TaskTag.Trabalho],
        }),
        new Task({
          title: "Custom incomplete task",
          completed: false,
          tags: [TaskTag.Pessoal],
        }),
      ];

      const customService = new TaskFilterService(customTasks);

      const allResults = customService.filter("all");
      const completedResults = customService.filter("completed");
      const workResults = customService.filter({ tag: TaskTag.Trabalho });

      expect(allResults).toHaveLength(2);
      expect(completedResults).toHaveLength(1);
      expect(workResults).toHaveLength(1);
    });

    it("should handle empty task list on initialization", () => {
      const emptyService = new TaskFilterService([]);

      expect(emptyService).toBeInstanceOf(TaskFilterService);
      expect(emptyService.filter("all")).toEqual([]);
      expect(emptyService.filter("completed")).toEqual([]);
      expect(emptyService.filter({ search: "test" })).toEqual([]);
      expect(emptyService.filter({ tag: TaskTag.Trabalho })).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined and null filters gracefully", () => {
      // These should be handled by TypeScript, but test runtime behavior
      expect(() => service.filter(null as any)).not.toThrow();
      expect(() => service.filter(undefined as any)).not.toThrow();
    });

    it("should handle malformed filter objects", () => {
      const malformedFilter = { invalidProperty: "test" };

      // Should default to tag filter behavior
      expect(() => service.filter(malformedFilter as any)).not.toThrow();
    });

    it("should handle tasks with edge case properties", () => {
      const edgeCaseTasks = [
        new Task({
          title: "ABC", // Minimum length
          dueDate: new Date("1970-01-01"),
          tags: [],
          priority: Priority.Low,
          completed: false,
        }),
        new Task({
          title: "A".repeat(100), // Long title
          dueDate: new Date("2030-12-31"),
          tags: [
            TaskTag.Trabalho,
            TaskTag.Pessoal,
            TaskTag.Afazeres,
            TaskTag.Outro,
          ],
          priority: Priority.High,
          completed: true,
        }),
      ];

      const edgeService = new TaskFilterService(edgeCaseTasks);

      const allResults = edgeService.filter("all");
      const completedResults = edgeService.filter("completed");
      const workResults = edgeService.filter({ tag: TaskTag.Trabalho });
      const searchResults = edgeService.filter({ search: "ABC" });

      expect(allResults).toHaveLength(2);
      expect(completedResults).toHaveLength(1);
      expect(workResults).toHaveLength(1);
      expect(searchResults).toHaveLength(1);
    });

    it("should maintain consistency across different filter types", () => {
      const consistencyTest = (filter: any) => {
        const result1 = service.filter(filter);
        const result2 = service.filter(filter);
        expect(result1).toEqual(result2);
      };

      consistencyTest("all");
      consistencyTest("completed");
      consistencyTest("today");
      consistencyTest("week");
      consistencyTest({ search: "test" });
      consistencyTest({ tag: TaskTag.Trabalho });
    });

    it("should handle concurrent filtering operations", () => {
      const operations = [
        () => service.filter("all"),
        () => service.filter("completed"),
        () => service.filter({ search: "API" }),
        () => service.filter({ tag: TaskTag.Trabalho }),
      ];

      const results = operations.map((op) => op());

      // Results should be independent
      expect(results[0]).not.toEqual(results[1]);
      expect(results[1]).not.toEqual(results[2]);
      expect(results[2]).not.toEqual(results[3]);

      // But same operations should yield same results
      expect(service.filter("all")).toEqual(results[0]);
      expect(service.filter("completed")).toEqual(results[1]);
    });
  });
});
