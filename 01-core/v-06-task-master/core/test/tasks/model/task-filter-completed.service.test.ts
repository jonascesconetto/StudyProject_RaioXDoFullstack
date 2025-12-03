import {
  TaskFilterCompletedService,
  Task,
  Priority,
  TaskTag,
} from "../../../src";
import {
  mockTasks,
  mockEmptyTasks,
  mockSingleTask,
} from "../../data/tasks.mock";

describe("TaskFilterCompletedService", () => {
  let service: TaskFilterCompletedService;

  beforeEach(() => {
    service = new TaskFilterCompletedService(mockTasks);
  });

  describe("Basic filtering functionality", () => {
    it("should filter completed tasks only", () => {
      const result = service.filterCompleted();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.completed).toBe(true);
      });
    });

    it("should filter incomplete tasks only", () => {
      const result = service.filterPending();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.completed).toBe(false);
      });
    });

    it("should return empty array when no completed tasks exist", () => {
      const incompleteTasks = [
        new Task({
          title: "Incomplete Task 1",
          completed: false,
          priority: Priority.Medium,
          tags: [TaskTag.Trabalho],
        }),
        new Task({
          title: "Incomplete Task 2",
          completed: false,
          priority: Priority.Low,
          tags: [TaskTag.Pessoal],
        }),
      ];

      const incompleteService = new TaskFilterCompletedService(incompleteTasks);
      const result = incompleteService.filterCompleted();

      expect(result).toEqual([]);
    });

    it("should return empty array when no incomplete tasks exist", () => {
      const completedTasks = [
        new Task({
          title: "Completed Task 1",
          completed: true,
          priority: Priority.High,
          tags: [TaskTag.Trabalho],
        }),
        new Task({
          title: "Completed Task 2",
          completed: true,
          priority: Priority.Medium,
          tags: [TaskTag.Pessoal],
        }),
      ];

      const completedService = new TaskFilterCompletedService(completedTasks);
      const result = completedService.filterPending();

      expect(result).toEqual([]);
    });

    it("should return empty arrays when task list is empty", () => {
      const emptyService = new TaskFilterCompletedService(mockEmptyTasks);

      expect(emptyService.filterCompleted()).toEqual([]);
      expect(emptyService.filterPending()).toEqual([]);
    });

    it("should handle single task array", () => {
      // Create a completed single task
      const completedTask = [
        new Task({
          id: "single-completed",
          title: "Single completed task",
          completed: true,
          priority: Priority.Medium,
          tags: [TaskTag.Pessoal],
        }),
      ];

      const singleCompletedService = new TaskFilterCompletedService(
        completedTask
      );

      expect(singleCompletedService.filterCompleted()).toEqual(completedTask);
      expect(singleCompletedService.filterPending()).toEqual([]);

      // Test with incomplete single task
      const singleIncompleteService = new TaskFilterCompletedService(
        mockSingleTask
      );

      expect(singleIncompleteService.filterCompleted()).toEqual([]);
      expect(singleIncompleteService.filterPending()).toEqual(mockSingleTask);
    });
  });

  describe("Generic filter by completion status", () => {
    it("should filter by completion status true", () => {
      const result = service.filter(true);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.completed).toBe(true);
      });
    });

    it("should filter by completion status false", () => {
      const result = service.filter(false);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.completed).toBe(false);
      });
    });

    it("should return same results as specific methods", () => {
      const completedViaGeneric = service.filter(true);
      const completedViaSpecific = service.filterCompleted();

      const incompleteViaGeneric = service.filter(false);
      const incompleteViaSpecific = service.filterPending();

      expect(completedViaGeneric).toEqual(completedViaSpecific);
      expect(incompleteViaGeneric).toEqual(incompleteViaSpecific);
    });
  });

  describe("Result consistency", () => {
    it("should maintain original task order", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      // Get the IDs of completed tasks in original order
      const originalCompletedIds = mockTasks
        .filter((task) => task.completed)
        .map((task) => task.id);

      const originalIncompleteIds = mockTasks
        .filter((task) => !task.completed)
        .map((task) => task.id);

      const completedResultIds = completedResult.map((task) => task.id);
      const incompleteResultIds = incompleteResult.map((task) => task.id);

      expect(completedResultIds).toEqual(originalCompletedIds);
      expect(incompleteResultIds).toEqual(originalIncompleteIds);
    });

    it("should return new array instances", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      expect(completedResult).not.toBe(mockTasks);
      expect(incompleteResult).not.toBe(mockTasks);
      expect(Array.isArray(completedResult)).toBe(true);
      expect(Array.isArray(incompleteResult)).toBe(true);
    });

    it("should not modify original tasks array", () => {
      const originalTasks = [...mockTasks];

      service.filterCompleted();
      service.filterPending();

      expect(mockTasks).toEqual(originalTasks);
    });

    it("should return the actual task instances", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      completedResult.forEach((task) => {
        expect(task).toBeInstanceOf(Task);
        expect(mockTasks).toContain(task);
      });

      incompleteResult.forEach((task) => {
        expect(task).toBeInstanceOf(Task);
        expect(mockTasks).toContain(task);
      });
    });

    it("should ensure completed and incomplete results are mutually exclusive", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      // No task should appear in both results
      completedResult.forEach((completedTask) => {
        expect(incompleteResult).not.toContain(completedTask);
      });

      incompleteResult.forEach((incompleteTask) => {
        expect(completedResult).not.toContain(incompleteTask);
      });
    });

    it("should ensure all tasks are accounted for", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      const totalFilteredTasks =
        completedResult.length + incompleteResult.length;
      expect(totalFilteredTasks).toBe(mockTasks.length);
    });
  });

  describe("Task properties preservation", () => {
    it("should preserve all task properties in filtered results", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      [...completedResult, ...incompleteResult].forEach((task) => {
        expect(task.id).toBeDefined();
        expect(task.title).toBeDefined();
        expect(task.dueDate).toBeDefined();
        expect(task.tags).toBeDefined();
        expect(task.priority).toBeDefined();
        expect(typeof task.completed).toBe("boolean");
      });
    });

    it("should include tasks with different priorities", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      if (completedResult.length > 1) {
        const completedPriorities = new Set(
          completedResult.map((task) => task.priority)
        );
        expect(completedPriorities.size).toBeGreaterThan(0);
      }

      if (incompleteResult.length > 1) {
        const incompletePriorities = new Set(
          incompleteResult.map((task) => task.priority)
        );
        expect(incompletePriorities.size).toBeGreaterThan(0);
      }
    });

    it("should include tasks with different tags", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      if (completedResult.length > 0) {
        const completedTags = new Set(
          completedResult.flatMap((task) => task.tags)
        );
        expect(completedTags.size).toBeGreaterThan(0);
      }

      if (incompleteResult.length > 0) {
        const incompleteTags = new Set(
          incompleteResult.flatMap((task) => task.tags)
        );
        expect(incompleteTags.size).toBeGreaterThan(0);
      }
    });

    it("should include tasks with different due dates", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      if (completedResult.length > 1) {
        const completedDates = new Set(
          completedResult.map((task) => task.dueDate.getTime())
        );
        expect(completedDates.size).toBeGreaterThan(0);
      }

      if (incompleteResult.length > 1) {
        const incompleteDates = new Set(
          incompleteResult.map((task) => task.dueDate.getTime())
        );
        expect(incompleteDates.size).toBeGreaterThan(0);
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
            completed: i % 2 === 0, // Half completed, half incomplete
            tags: [TaskTag.Trabalho],
            priority: Priority.Medium,
          })
        );
      }

      const largeService = new TaskFilterCompletedService(largeTasks);

      const startTime = performance.now();
      const completedResult = largeService.filterCompleted();
      const incompleteResult = largeService.filterPending();
      const endTime = performance.now();

      expect(completedResult).toHaveLength(500);
      expect(incompleteResult).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
    });

    it("should be memory efficient", () => {
      const completedResult = service.filterCompleted();
      const incompleteResult = service.filterPending();

      // Should not create deep copies, just filter references
      completedResult.forEach((task) => {
        const originalTask = mockTasks.find((t) => t.id === task.id);
        expect(task).toBe(originalTask);
      });

      incompleteResult.forEach((task) => {
        const originalTask = mockTasks.find((t) => t.id === task.id);
        expect(task).toBe(originalTask);
      });
    });
  });

  describe("Service instantiation", () => {
    it("should create service instance successfully", () => {
      expect(service).toBeInstanceOf(TaskFilterCompletedService);
    });

    it("should have all required methods", () => {
      expect(typeof service.filter).toBe("function");
      expect(typeof service.filterCompleted).toBe("function");
      expect(typeof service.filterPending).toBe("function");
    });

    it("should work with multiple service instances", () => {
      const service1 = new TaskFilterCompletedService(mockTasks);
      const service2 = new TaskFilterCompletedService(mockTasks);

      const result1 = service1.filterCompleted();
      const result2 = service2.filterCompleted();

      expect(result1).toEqual(result2);
    });

    it("should handle different task arrays", () => {
      const customTasks = [
        new Task({
          title: "Custom Completed Task",
          completed: true,
          priority: Priority.High,
          tags: [TaskTag.Trabalho],
        }),
        new Task({
          title: "Custom Incomplete Task",
          completed: false,
          priority: Priority.Low,
          tags: [TaskTag.Pessoal],
        }),
      ];

      const customService = new TaskFilterCompletedService(customTasks);

      const completedResult = customService.filterCompleted();
      const incompleteResult = customService.filterPending();

      expect(completedResult).toHaveLength(1);
      expect(completedResult[0].title).toBe("Custom Completed Task");

      expect(incompleteResult).toHaveLength(1);
      expect(incompleteResult[0].title).toBe("Custom Incomplete Task");
    });

    it("should handle empty task list on initialization", () => {
      const emptyService = new TaskFilterCompletedService([]);

      expect(emptyService).toBeInstanceOf(TaskFilterCompletedService);
      expect(emptyService.filterCompleted()).toEqual([]);
      expect(emptyService.filterPending()).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle tasks with all completed status", () => {
      const allCompletedTasks = mockTasks.map((task) =>
        task.clone({ completed: true })
      );

      const allCompletedService = new TaskFilterCompletedService(
        allCompletedTasks
      );

      const completedResult = allCompletedService.filterCompleted();
      const incompleteResult = allCompletedService.filterPending();

      expect(completedResult).toHaveLength(allCompletedTasks.length);
      expect(incompleteResult).toHaveLength(0);
    });

    it("should handle tasks with all incomplete status", () => {
      const allIncompleteTasks = mockTasks.map((task) =>
        task.clone({ completed: false })
      );

      const allIncompleteService = new TaskFilterCompletedService(
        allIncompleteTasks
      );

      const completedResult = allIncompleteService.filterCompleted();
      const incompleteResult = allIncompleteService.filterPending();

      expect(completedResult).toHaveLength(0);
      expect(incompleteResult).toHaveLength(allIncompleteTasks.length);
    });

    it("should handle mixed completion statuses", () => {
      const mixedTasks = [
        new Task({ title: "Task 1", completed: true, priority: Priority.High }),
        new Task({ title: "Task 2", completed: false, priority: Priority.Low }),
        new Task({
          title: "Task 3",
          completed: true,
          priority: Priority.Medium,
        }),
        new Task({
          title: "Task 4",
          completed: false,
          priority: Priority.High,
        }),
        new Task({ title: "Task 5", completed: true, priority: Priority.Low }),
      ];

      const mixedService = new TaskFilterCompletedService(mixedTasks);

      const completedResult = mixedService.filterCompleted();
      const incompleteResult = mixedService.filterPending();

      expect(completedResult).toHaveLength(3);
      expect(incompleteResult).toHaveLength(2);

      expect(completedResult.every((task) => task.completed)).toBe(true);
      expect(incompleteResult.every((task) => !task.completed)).toBe(true);
    });

    it("should maintain consistency with multiple consecutive calls", () => {
      const completedResult1 = service.filterCompleted();
      const completedResult2 = service.filterCompleted();
      const completedResult3 = service.filterCompleted();

      const incompleteResult1 = service.filterPending();
      const incompleteResult2 = service.filterPending();
      const incompleteResult3 = service.filterPending();

      expect(completedResult1).toEqual(completedResult2);
      expect(completedResult2).toEqual(completedResult3);
      expect(completedResult1).toEqual(completedResult3);

      expect(incompleteResult1).toEqual(incompleteResult2);
      expect(incompleteResult2).toEqual(incompleteResult3);
      expect(incompleteResult1).toEqual(incompleteResult3);
    });

    it("should handle boolean completion status correctly", () => {
      // Test explicit true
      const resultTrue = service.filter(true);
      expect(resultTrue.every((task) => task.completed === true)).toBe(true);

      // Test explicit false
      const resultFalse = service.filter(false);
      expect(resultFalse.every((task) => task.completed === false)).toBe(true);

      // Ensure they're different sets
      expect(resultTrue).not.toEqual(resultFalse);
    });
  });
});
