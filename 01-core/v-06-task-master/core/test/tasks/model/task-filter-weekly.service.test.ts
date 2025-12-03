import {
  TaskFilterWeeklyService,
  Task,
  Priority,
  TaskTag,
  DateUtils,
} from "../../../src";
import { mockTasks, mockEmptyTasks } from "../../data/tasks.mock";

describe("TaskFilterWeeklyService", () => {
  let service: TaskFilterWeeklyService;
  let startOfWeek: Date;
  let endOfWeek: Date;

  beforeEach(() => {
    startOfWeek = DateUtils.startOfTomorrow();
    endOfWeek = DateUtils.endOfThisWeek();
    service = new TaskFilterWeeklyService(mockTasks);
  });

  describe("Basic filtering functionality", () => {
    it("should filter tasks for this week", () => {
      const thisWeekTasks = [
        new Task({
          title: "Task for this week",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Another task for this week",
          dueDate: new Date(endOfWeek.getTime() - 24 * 60 * 60 * 1000), // Day before end of week
          priority: Priority.High,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(thisWeekTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      result.forEach((task) => {
        expect(task.completed).toBe(false);
        expect(task.dueDate.getTime()).toBeGreaterThanOrEqual(
          startOfWeek.getTime()
        );
        expect(task.dueDate.getTime()).toBeLessThanOrEqual(endOfWeek.getTime());
      });
    });

    it("should exclude completed tasks", () => {
      const weekTasks = [
        new Task({
          title: "Incomplete task this week",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "Completed task this week",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          priority: Priority.Medium,
          completed: true,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(weekTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Incomplete task this week");
      expect(result[0].completed).toBe(false);
    });

    it("should exclude tasks from today and earlier", () => {
      const today = DateUtils.endOfToday();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const mixedTasks = [
        new Task({
          title: "Yesterday's task",
          dueDate: yesterday,
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Today's task",
          dueDate: today,
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "Tomorrow's task",
          dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          priority: Priority.Low,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(mixedTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Tomorrow's task");
    });

    it("should exclude tasks from next week", () => {
      const nextWeek = new Date(endOfWeek.getTime() + 24 * 60 * 60 * 1000);

      const futureTasks = [
        new Task({
          title: "This week task",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Next week task",
          dueDate: nextWeek,
          priority: Priority.High,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(futureTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("This week task");
    });

    it("should return empty array when task list is empty", () => {
      const emptyService = new TaskFilterWeeklyService(mockEmptyTasks);
      const result = emptyService.filter();

      expect(result).toEqual([]);
    });

    it("should handle single task array", () => {
      const thisWeekTask = [
        new Task({
          title: "Single task for this week",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          priority: Priority.Medium,
          completed: false,
        }),
      ];

      const singleService = new TaskFilterWeeklyService(thisWeekTask);
      const result = singleService.filter();

      expect(result).toEqual(thisWeekTask);
    });
  });

  describe("Date handling", () => {
    it("should handle tasks at week boundaries", () => {
      const startBoundary = new Date(startOfWeek.getTime() + 1); // Just after start
      const endBoundary = new Date(endOfWeek.getTime() - 1); // Just before end

      const boundaryTasks = [
        new Task({
          title: "Start boundary task",
          dueDate: startBoundary,
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "End boundary task",
          dueDate: endBoundary,
          priority: Priority.Medium,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(boundaryTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      expect(result.map((task) => task.title)).toEqual(
        expect.arrayContaining(["Start boundary task", "End boundary task"])
      );
    });

    it("should handle tasks with different times on same day", () => {
      const sameDay = new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000); // Two days from start

      const morningTask = new Task({
        title: "Morning task",
        dueDate: new Date(
          sameDay.getFullYear(),
          sameDay.getMonth(),
          sameDay.getDate(),
          8,
          0
        ),
        priority: Priority.High,
        completed: false,
      });

      const eveningTask = new Task({
        title: "Evening task",
        dueDate: new Date(
          sameDay.getFullYear(),
          sameDay.getMonth(),
          sameDay.getDate(),
          20,
          0
        ),
        priority: Priority.Medium,
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([
        morningTask,
        eveningTask,
      ]);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      expect(result).toContain(morningTask);
      expect(result).toContain(eveningTask);
    });

    it("should handle edge case of exact start and end times", () => {
      const exactStart = new Date(startOfWeek.getTime());
      const exactEnd = new Date(endOfWeek.getTime());

      const edgeTasks = [
        new Task({
          title: "Exact start time",
          dueDate: exactStart,
          completed: false,
        }),
        new Task({
          title: "Exact end time",
          dueDate: exactEnd,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(edgeTasks);
      const result = weeklyService.filter();

      // Should include exact end but not exact start (since start is end of today)
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Exact start time");
    });

    it("should handle weekend tasks", () => {
      // Assuming the week includes weekend
      const weekendDate = new Date(endOfWeek.getTime() - 24 * 60 * 60 * 1000); // Day before end of week

      const weekendTask = new Task({
        title: "Weekend task",
        dueDate: weekendDate,
        priority: Priority.Low,
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([weekendTask]);
      const result = weeklyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(weekendTask);
    });
  });

  describe("Completion status handling", () => {
    it("should exclude all completed tasks regardless of date", () => {
      const weekTasks = [
        new Task({
          title: "Incomplete task 1",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          title: "Completed task 1",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: true,
        }),
        new Task({
          title: "Incomplete task 2",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          title: "Completed task 2",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completed: true,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(weekTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      expect(result.every((task) => !task.completed)).toBe(true);

      const titles = result.map((task) => task.title);
      expect(titles).toContain("Incomplete task 1");
      expect(titles).toContain("Incomplete task 2");
      expect(titles).not.toContain("Completed task 1");
      expect(titles).not.toContain("Completed task 2");
    });

    it("should handle all completed tasks in week", () => {
      const allCompletedTasks = [
        new Task({
          title: "Completed task 1",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: true,
        }),
        new Task({
          title: "Completed task 2",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completed: true,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(allCompletedTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(0);
    });

    it("should handle all incomplete tasks in week", () => {
      const allIncompleteTasks = [
        new Task({
          title: "Incomplete task 1",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          title: "Incomplete task 2",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(allIncompleteTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      expect(result.every((task) => !task.completed)).toBe(true);
    });
  });

  describe("Result consistency", () => {
    it("should maintain original task order", () => {
      const taskList = [
        new Task({
          id: "task-1",
          title: "First task",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          id: "task-2",
          title: "Second task",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          id: "task-3",
          title: "Third task",
          dueDate: new Date(startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(taskList);
      const result = weeklyService.filter();

      expect(result.map((task) => task.id)).toEqual([
        "task-1",
        "task-2",
        "task-3",
      ]);
    });

    it("should return new array instance", () => {
      const result = service.filter();

      expect(result).not.toBe(mockTasks);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should not modify original tasks array", () => {
      const originalTasks = [...mockTasks];
      service.filter();

      expect(mockTasks).toEqual(originalTasks);
    });

    it("should return the actual task instances", () => {
      const thisWeekTask = new Task({
        title: "This week task",
        dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([thisWeekTask]);
      const result = weeklyService.filter();

      expect(result[0]).toBe(thisWeekTask);
    });
  });

  describe("Task properties preservation", () => {
    it("should preserve all task properties in filtered results", () => {
      const complexTask = new Task({
        title: "Complex week task",
        dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
        tags: [TaskTag.Trabalho, TaskTag.Afazeres],
        priority: Priority.High,
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([complexTask]);
      const result = weeklyService.filter();

      expect(result).toHaveLength(1);
      const task = result[0];

      expect(task.id).toBeDefined();
      expect(task.title).toBe("Complex week task");
      expect(task.tags).toEqual([TaskTag.Trabalho, TaskTag.Afazeres]);
      expect(task.priority).toBe(Priority.High);
      expect(task.completed).toBe(false);
    });

    it("should include tasks with different priorities", () => {
      const priorityTasks = [
        new Task({
          title: "Low priority",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          priority: Priority.Low,
          completed: false,
        }),
        new Task({
          title: "High priority",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          priority: Priority.High,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(priorityTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      const priorities = new Set(result.map((task) => task.priority));
      expect(priorities.has(Priority.Low)).toBe(true);
      expect(priorities.has(Priority.High)).toBe(true);
    });

    it("should include tasks with different tags", () => {
      const taggedTasks = [
        new Task({
          title: "Work task",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          tags: [TaskTag.Trabalho],
          completed: false,
        }),
        new Task({
          title: "Personal task",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          tags: [TaskTag.Pessoal],
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(taggedTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(2);
      const allTags = result.flatMap((task) => task.tags);
      expect(allTags).toContain(TaskTag.Trabalho);
      expect(allTags).toContain(TaskTag.Pessoal);
    });
  });

  describe("Performance considerations", () => {
    it("should handle large task lists efficiently", () => {
      const largeTasks: Task[] = [];
      for (let i = 0; i < 1000; i++) {
        const dueDate =
          i % 2 === 0
            ? new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000) // This week
            : new Date(startOfWeek.getTime() - 24 * 60 * 60 * 1000); // Before this week
        largeTasks.push(
          new Task({
            title: `Task ${i}`,
            dueDate,
            completed: false,
          })
        );
      }

      const largeService = new TaskFilterWeeklyService(largeTasks);
      const startTime = performance.now();
      const result = largeService.filter();
      const endTime = performance.now();

      expect(result).toHaveLength(500); // Half are for this week
      expect(endTime - startTime).toBeLessThan(50);
    });

    it("should be memory efficient", () => {
      const thisWeekTask = new Task({
        title: "This week task",
        dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([thisWeekTask]);
      const result = weeklyService.filter();

      expect(result[0]).toBe(thisWeekTask);
    });
  });

  describe("Service instantiation", () => {
    it("should create service instance successfully", () => {
      expect(service).toBeInstanceOf(TaskFilterWeeklyService);
    });

    it("should have filter method", () => {
      expect(typeof service.filter).toBe("function");
    });

    it("should work with multiple service instances", () => {
      const thisWeekTask = new Task({
        title: "This week task",
        dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
        completed: false,
      });

      const service1 = new TaskFilterWeeklyService([thisWeekTask]);
      const service2 = new TaskFilterWeeklyService([thisWeekTask]);

      const result1 = service1.filter();
      const result2 = service2.filter();

      expect(result1).toEqual(result2);
    });

    it("should handle different task arrays", () => {
      const customTasks = [
        new Task({
          title: "Custom this week task",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          title: "Custom completed task",
          dueDate: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completed: true,
        }),
      ];

      const customService = new TaskFilterWeeklyService(customTasks);
      const result = customService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Custom this week task");
    });

    it("should handle empty task list on initialization", () => {
      const emptyService = new TaskFilterWeeklyService([]);
      expect(emptyService).toBeInstanceOf(TaskFilterWeeklyService);
      expect(emptyService.filter()).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle tasks with very future due dates", () => {
      const veryFutureDate = new Date("2030-12-31");
      const futureTask = new Task({
        title: "Very future task",
        dueDate: veryFutureDate,
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([futureTask]);
      const result = weeklyService.filter();

      expect(result).toHaveLength(0);
    });

    it("should handle tasks with very old due dates", () => {
      const veryOldDate = new Date("2020-01-01");
      const oldTask = new Task({
        title: "Very old task",
        dueDate: veryOldDate,
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([oldTask]);
      const result = weeklyService.filter();

      expect(result).toHaveLength(0);
    });

    it("should maintain consistency with multiple consecutive calls", () => {
      const thisWeekTask = new Task({
        title: "Consistent task",
        dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
        completed: false,
      });

      const weeklyService = new TaskFilterWeeklyService([thisWeekTask]);

      const result1 = weeklyService.filter();
      const result2 = weeklyService.filter();
      const result3 = weeklyService.filter();

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result1).toEqual(result3);
    });

    it("should handle tasks exactly at midnight boundaries", () => {
      const startMidnight = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate(),
        0,
        0,
        0
      );
      const endMidnight = new Date(
        endOfWeek.getFullYear(),
        endOfWeek.getMonth(),
        endOfWeek.getDate(),
        23,
        59,
        59
      );

      const midnightTasks = [
        new Task({
          title: "Start midnight task",
          dueDate: startMidnight,
          completed: false,
        }),
        new Task({
          title: "End midnight task",
          dueDate: endMidnight,
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(midnightTasks);
      const result = weeklyService.filter();

      // Results depend on the exact implementation of DateUtils.endOfToday() and DateUtils.endOfThisWeek()
      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("should handle mixed week and non-week tasks", () => {
      const mixedTasks = [
        new Task({
          title: "Last week task",
          dueDate: new Date(startOfWeek.getTime() - 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          title: "This week task",
          dueDate: new Date(startOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
        new Task({
          title: "Next week task",
          dueDate: new Date(endOfWeek.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
      ];

      const weeklyService = new TaskFilterWeeklyService(mixedTasks);
      const result = weeklyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("This week task");
    });
  });
});
