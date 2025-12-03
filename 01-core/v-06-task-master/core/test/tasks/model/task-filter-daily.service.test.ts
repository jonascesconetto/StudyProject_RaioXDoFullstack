import {
  TaskFilterDailyService,
  Task,
  Priority,
  TaskTag,
  DateUtils,
} from "../../../src";
import { mockTasks, mockEmptyTasks } from "../../data/tasks.mock";

describe("TaskFilterDailyService", () => {
  let service: TaskFilterDailyService;
  let today: Date;

  beforeEach(() => {
    today = DateUtils.startOfToday();
    service = new TaskFilterDailyService(mockTasks);
  });

  describe("Basic filtering functionality", () => {
    it("should filter tasks due today", () => {
      const todayTasks = [
        new Task({
          title: "Task due today",
          dueDate: today,
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Another task due today",
          dueDate: today,
          priority: Priority.High,
          completed: true,
        }),
      ];

      const dailyService = new TaskFilterDailyService(todayTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(2);
      result.forEach((task) => {
        expect(DateUtils.isSameDay(task.dueDate, today)).toBe(true);
      });
    });

    it("should filter delayed incomplete tasks", () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const delayedTasks = [
        new Task({
          title: "Delayed incomplete task",
          dueDate: yesterday,
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "Delayed completed task",
          dueDate: yesterday,
          priority: Priority.Medium,
          completed: true,
        }),
      ];

      const dailyService = new TaskFilterDailyService(delayedTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Delayed incomplete task");
      expect(result[0].completed).toBe(false);
    });

    it("should include both today's tasks and delayed incomplete tasks", () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mixedTasks = [
        new Task({
          title: "Today's task",
          dueDate: today,
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Delayed task",
          dueDate: yesterday,
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "Completed delayed task",
          dueDate: yesterday,
          priority: Priority.Low,
          completed: true,
        }),
      ];

      const dailyService = new TaskFilterDailyService(mixedTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(2);
      expect(result.map((task) => task.title)).toEqual(
        expect.arrayContaining(["Today's task", "Delayed task"])
      );
    });

    it("should exclude future tasks", () => {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const futureTasks = [
        new Task({
          title: "Future task",
          dueDate: tomorrow,
          priority: Priority.Medium,
          completed: false,
        }),
      ];

      const dailyService = new TaskFilterDailyService(futureTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(0);
    });

    it("should return empty array when task list is empty", () => {
      const emptyService = new TaskFilterDailyService(mockEmptyTasks);
      const result = emptyService.filter();

      expect(result).toEqual([]);
    });

    it("should handle single task array", () => {
      const todayTask = [
        new Task({
          title: "Single task for today",
          dueDate: today,
          priority: Priority.Medium,
          completed: false,
        }),
      ];

      const singleService = new TaskFilterDailyService(todayTask);
      const result = singleService.filter();

      expect(result).toEqual(todayTask);
    });
  });

  describe("Date handling", () => {
    it("should handle tasks with different times on the same day", () => {
      const morningTask = new Task({
        title: "Morning task",
        dueDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          8,
          0
        ),
        priority: Priority.High,
        completed: false,
      });

      const eveningTask = new Task({
        title: "Evening task",
        dueDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          20,
          0
        ),
        priority: Priority.Medium,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([
        morningTask,
        eveningTask,
      ]);
      const result = dailyService.filter();

      expect(result).toHaveLength(2);
      expect(result).toContain(morningTask);
      expect(result).toContain(eveningTask);
    });

    it("should handle delayed tasks from multiple previous days", () => {
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const delayedTasks = [
        new Task({
          title: "Two days overdue",
          dueDate: twoDaysAgo,
          priority: Priority.High,
          completed: false,
        }),
        new Task({
          title: "One week overdue",
          dueDate: oneWeekAgo,
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Old completed task",
          dueDate: oneWeekAgo,
          priority: Priority.Low,
          completed: true,
        }),
      ];

      const dailyService = new TaskFilterDailyService(delayedTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(2);
      expect(result.every((task) => !task.completed)).toBe(true);
    });

    it("should handle edge case of end of day today", () => {
      const endOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      const endOfDayTask = new Task({
        title: "End of day task",
        dueDate: endOfToday,
        priority: Priority.Medium,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([endOfDayTask]);
      const result = dailyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(endOfDayTask);
    });

    it("should handle edge case of start of tomorrow", () => {
      const startOfTomorrow = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        0,
        0,
        0
      );

      const tomorrowTask = new Task({
        title: "Tomorrow task",
        dueDate: startOfTomorrow,
        priority: Priority.Medium,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([tomorrowTask]);
      const result = dailyService.filter();

      expect(result).toHaveLength(0);
    });
  });

  describe("Completion status handling", () => {
    it("should include completed tasks due today", () => {
      const completedTodayTask = new Task({
        title: "Completed today task",
        dueDate: today,
        priority: Priority.Medium,
        completed: true,
      });

      const dailyService = new TaskFilterDailyService([completedTodayTask]);
      const result = dailyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].completed).toBe(true);
    });

    it("should exclude completed delayed tasks", () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const completedDelayedTask = new Task({
        title: "Completed delayed task",
        dueDate: yesterday,
        priority: Priority.Medium,
        completed: true,
      });

      const dailyService = new TaskFilterDailyService([completedDelayedTask]);
      const result = dailyService.filter();

      expect(result).toHaveLength(0);
    });

    it("should handle mixed completion statuses correctly", () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mixedTasks = [
        new Task({
          title: "Today incomplete",
          dueDate: today,
          completed: false,
        }),
        new Task({
          title: "Today complete",
          dueDate: today,
          completed: true,
        }),
        new Task({
          title: "Yesterday incomplete",
          dueDate: yesterday,
          completed: false,
        }),
        new Task({
          title: "Yesterday complete",
          dueDate: yesterday,
          completed: true,
        }),
      ];

      const dailyService = new TaskFilterDailyService(mixedTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(3);

      const titles = result.map((task) => task.title);
      expect(titles).toContain("Today incomplete");
      expect(titles).toContain("Today complete");
      expect(titles).toContain("Yesterday incomplete");
      expect(titles).not.toContain("Yesterday complete");
    });
  });

  describe("Result consistency", () => {
    it("should maintain original task order", () => {
      const taskList = [
        new Task({
          id: "task-1",
          title: "First task",
          dueDate: today,
          completed: false,
        }),
        new Task({
          id: "task-2",
          title: "Second task",
          dueDate: today,
          completed: false,
        }),
        new Task({
          id: "task-3",
          title: "Third task",
          dueDate: today,
          completed: false,
        }),
      ];

      const dailyService = new TaskFilterDailyService(taskList);
      const result = dailyService.filter();

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
      const todayTask = new Task({
        title: "Today task",
        dueDate: today,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([todayTask]);
      const result = dailyService.filter();

      expect(result[0]).toBe(todayTask);
    });
  });

  describe("Task properties preservation", () => {
    it("should preserve all task properties in filtered results", () => {
      const complexTask = new Task({
        title: "Complex task",
        dueDate: today,
        tags: [TaskTag.Trabalho, TaskTag.Afazeres],
        priority: Priority.High,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([complexTask]);
      const result = dailyService.filter();

      expect(result).toHaveLength(1);
      const task = result[0];

      expect(task.id).toBeDefined();
      expect(task.title).toBe("Complex task");
      expect(task.dueDate).toBe(today);
      expect(task.tags).toEqual([TaskTag.Trabalho, TaskTag.Afazeres]);
      expect(task.priority).toBe(Priority.High);
      expect(task.completed).toBe(false);
    });

    it("should include tasks with different priorities", () => {
      const priorityTasks = [
        new Task({
          title: "Low priority",
          dueDate: today,
          priority: Priority.Low,
          completed: false,
        }),
        new Task({
          title: "High priority",
          dueDate: today,
          priority: Priority.High,
          completed: false,
        }),
      ];

      const dailyService = new TaskFilterDailyService(priorityTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(2);
      const priorities = new Set(result.map((task) => task.priority));
      expect(priorities.has(Priority.Low)).toBe(true);
      expect(priorities.has(Priority.High)).toBe(true);
    });

    it("should include tasks with different tags", () => {
      const taggedTasks = [
        new Task({
          title: "Work task",
          dueDate: today,
          tags: [TaskTag.Trabalho],
          completed: false,
        }),
        new Task({
          title: "Personal task",
          dueDate: today,
          tags: [TaskTag.Pessoal],
          completed: false,
        }),
      ];

      const dailyService = new TaskFilterDailyService(taggedTasks);
      const result = dailyService.filter();

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
          i % 2 === 0 ? today : new Date(today.getTime() + 24 * 60 * 60 * 1000);
        largeTasks.push(
          new Task({
            title: `Task ${i}`,
            dueDate,
            completed: false,
          })
        );
      }

      const largeService = new TaskFilterDailyService(largeTasks);
      const startTime = performance.now();
      const result = largeService.filter();
      const endTime = performance.now();

      expect(result).toHaveLength(500); // Half are for today
      expect(endTime - startTime).toBeLessThan(50);
    });

    it("should be memory efficient", () => {
      const todayTask = new Task({
        title: "Today task",
        dueDate: today,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([todayTask]);
      const result = dailyService.filter();

      expect(result[0]).toBe(todayTask);
    });
  });

  describe("Service instantiation", () => {
    it("should create service instance successfully", () => {
      expect(service).toBeInstanceOf(TaskFilterDailyService);
    });

    it("should have filter method", () => {
      expect(typeof service.filter).toBe("function");
    });

    it("should work with multiple service instances", () => {
      const todayTask = new Task({
        title: "Today task",
        dueDate: today,
        completed: false,
      });

      const service1 = new TaskFilterDailyService([todayTask]);
      const service2 = new TaskFilterDailyService([todayTask]);

      const result1 = service1.filter();
      const result2 = service2.filter();

      expect(result1).toEqual(result2);
    });

    it("should handle different task arrays", () => {
      const customTasks = [
        new Task({
          title: "Custom today task",
          dueDate: today,
          completed: false,
        }),
        new Task({
          title: "Custom future task",
          dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          completed: false,
        }),
      ];

      const customService = new TaskFilterDailyService(customTasks);
      const result = customService.filter();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Custom today task");
    });

    it("should handle empty task list on initialization", () => {
      const emptyService = new TaskFilterDailyService([]);
      expect(emptyService).toBeInstanceOf(TaskFilterDailyService);
      expect(emptyService.filter()).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle tasks with very old due dates", () => {
      const veryOldDate = new Date("2020-01-01");
      const oldTask = new Task({
        title: "Very old task",
        dueDate: veryOldDate,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([oldTask]);
      const result = dailyService.filter();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(oldTask);
    });

    it("should handle tasks with invalid dates gracefully", () => {
      // This test assumes DateUtils.parseDate handles invalid dates properly
      const taskWithValidDate = new Task({
        title: "Valid date task",
        dueDate: today,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([taskWithValidDate]);
      const result = dailyService.filter();

      expect(result).toHaveLength(1);
    });

    it("should maintain consistency with multiple consecutive calls", () => {
      const todayTask = new Task({
        title: "Consistent task",
        dueDate: today,
        completed: false,
      });

      const dailyService = new TaskFilterDailyService([todayTask]);

      const result1 = dailyService.filter();
      const result2 = dailyService.filter();
      const result3 = dailyService.filter();

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result1).toEqual(result3);
    });

    it("should handle tasks exactly at midnight boundaries", () => {
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfYesterday = new Date(startOfToday.getTime() - 1);

      const midnightTasks = [
        new Task({
          title: "Start of today",
          dueDate: startOfToday,
          completed: false,
        }),
        new Task({
          title: "End of yesterday",
          dueDate: endOfYesterday,
          completed: false,
        }),
      ];

      const dailyService = new TaskFilterDailyService(midnightTasks);
      const result = dailyService.filter();

      expect(result).toHaveLength(2); // Both should be included
    });
  });
});
