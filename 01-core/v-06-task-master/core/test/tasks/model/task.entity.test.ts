import { Task, Priority, TaskTag, DateUtils } from "../../../src";

describe("Task Entity", () => {
  describe("Constructor", () => {
    it("should create task with provided properties", () => {
      const dueDate = new Date("2024-12-31");
      const task = new Task({
        title: "Test Task",
        dueDate,
        tags: [TaskTag.Trabalho],
        priority: Priority.High,
        completed: true,
      });

      expect(task.title).toBe("Test Task");
      expect(task.dueDate).toBe(dueDate);
      expect(task.tags).toEqual([TaskTag.Trabalho]);
      expect(task.priority).toBe(Priority.High);
      expect(task.completed).toBe(true);
    });

    it("should create task with minimal properties", () => {
      const task = new Task({ title: "Minimal Task" });

      expect(task.title).toBe("Minimal Task");
      expect(task.dueDate).toEqual(DateUtils.startOfToday());
      expect(task.tags).toEqual([]);
      expect(task.priority).toBe(Priority.Medium);
      expect(task.completed).toBe(false);
    });

    it("should generate id when not provided", () => {
      const task = new Task({ title: "Test Task" });

      expect(task.id).toBeDefined();
      expect(task.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it("should create task in valid mode by default", () => {
      const task = new Task({ title: "Test Task" });

      expect(task.mode).toBe("valid");
      expect(task.isValid()).toBe(true);
      expect(task.isDraft()).toBe(false);
    });

    it("should handle string date conversion", () => {
      const dateString = "2024-12-31T10:00:00.000Z";
      const task = new Task({
        title: "Test Task",
        dueDate: dateString,
      });

      expect(task.dueDate).toEqual(new Date(dateString));
    });

    it("should handle multiple tags", () => {
      const tags = [TaskTag.Trabalho, TaskTag.Pessoal, TaskTag.Afazeres];
      const task = new Task({
        title: "Multi-tag Task",
        tags,
      });

      expect(task.tags).toEqual(tags);
    });

    it("should preserve all priority values", () => {
      const lowTask = new Task({ title: "Low", priority: Priority.Low });
      const mediumTask = new Task({
        title: "Medium",
        priority: Priority.Medium,
      });
      const highTask = new Task({ title: "High", priority: Priority.High });

      expect(lowTask.priority).toBe(Priority.Low);
      expect(mediumTask.priority).toBe(Priority.Medium);
      expect(highTask.priority).toBe(Priority.High);
    });
  });

  describe("Title validation", () => {
    it("should validate title in valid mode", () => {
      expect(() => new Task({ title: "Valid Title" })).not.toThrow();
    });

    it("should throw error for short title in valid mode", () => {
      expect(() => new Task({ title: "AB" })).toThrow(
        "Título deve ter pelo menos 3 caracteres"
      );
    });

    it("should throw error for empty title in valid mode", () => {
      expect(() => new Task({ title: "" })).toThrow("Título é obrigatório");
    });

    it("should throw error for undefined title in valid mode", () => {
      expect(() => new Task({})).toThrow("Título é obrigatório");
    });

    it("should accept minimum valid title length", () => {
      const task = new Task({ title: "ABC" });
      expect(task.title).toBe("ABC");
    });
  });

  describe("Draft mode", () => {
    it("should create task in draft mode with static method", () => {
      const task = Task.draft({ title: "Draft Task" });

      expect(task.mode).toBe("draft");
      expect(task.isDraft()).toBe(true);
      expect(task.isValid()).toBe(false);
    });

    it("should create task in draft mode with constructor", () => {
      const task = new Task({ title: "Draft Task" }, "draft");

      expect(task.mode).toBe("draft");
      expect(task.isDraft()).toBe(true);
    });

    it("should allow empty title in draft mode", () => {
      const task = Task.draft({ title: "" });

      expect(task.title).toBe("");
      expect(task.isDraft()).toBe(true);
    });

    it("should allow short title in draft mode", () => {
      const task = Task.draft({ title: "AB" });

      expect(task.title).toBe("AB");
      expect(task.isDraft()).toBe(true);
    });

    it("should allow undefined title in draft mode", () => {
      const task = Task.draft({});

      expect(task.title).toBe("");
      expect(task.isDraft()).toBe(true);
    });

    it("should create draft with empty properties", () => {
      const task = Task.draft();

      expect(task.title).toBe("");
      expect(task.dueDate).toEqual(DateUtils.startOfToday());
      expect(task.tags).toEqual([]);
      expect(task.priority).toBe(Priority.Medium);
      expect(task.completed).toBe(false);
    });

    it("should convert draft to valid", () => {
      const draft = Task.draft({
        title: "Valid Title",
        priority: Priority.High,
      });
      const valid = draft.asValid();

      expect(valid.isValid()).toBe(true);
      expect(valid.isDraft()).toBe(false);
      expect(valid.title).toBe("Valid Title");
      expect(valid.priority).toBe(Priority.High);
      expect(valid.id).toBe(draft.id);
    });

    it("should convert valid to draft", () => {
      const valid = new Task({ title: "Valid Title" });
      const draft = valid.asDraft();

      expect(draft.isDraft()).toBe(true);
      expect(draft.isValid()).toBe(false);
      expect(draft.title).toBe("Valid Title");
      expect(draft.id).toBe(valid.id);
    });
  });

  describe("Task completion", () => {
    it("should toggle completion from false to true", () => {
      const task = new Task({ title: "Test Task", completed: false });
      const completedTask = task.toggleComplete();

      expect(task.completed).toBe(false);
      expect(completedTask.completed).toBe(true);
      expect(completedTask.id).toBe(task.id);
    });

    it("should toggle completion from true to false", () => {
      const task = new Task({ title: "Test Task", completed: true });
      const incompleteTask = task.toggleComplete();

      expect(task.completed).toBe(true);
      expect(incompleteTask.completed).toBe(false);
      expect(incompleteTask.id).toBe(task.id);
    });

    it("should preserve other properties when toggling completion", () => {
      const task = new Task({
        title: "Test Task",
        priority: Priority.High,
        tags: [TaskTag.Trabalho],
        completed: false,
      });
      const completedTask = task.toggleComplete();

      expect(completedTask.title).toBe("Test Task");
      expect(completedTask.priority).toBe(Priority.High);
      expect(completedTask.tags).toEqual([TaskTag.Trabalho]);
      expect(completedTask.completed).toBe(true);
    });

    it("should create new instance when toggling completion", () => {
      const task = new Task({ title: "Test Task" });
      const completedTask = task.toggleComplete();

      expect(completedTask).not.toBe(task);
      expect(completedTask.equals(task)).toBe(true);
    });
  });

  describe("Date handling", () => {
    it("should use provided Date object", () => {
      const dueDate = new Date("2024-12-31T15:30:00.000Z");
      const task = new Task({ title: "Test Task", dueDate });

      expect(task.dueDate).toBe(dueDate);
    });

    it("should convert string to Date", () => {
      const dateString = "2024-12-31T15:30:00.000Z";
      const task = new Task({ title: "Test Task", dueDate: dateString });

      expect(task.dueDate).toEqual(new Date(dateString));
    });

    it("should use today as default when no date provided", () => {
      const task = new Task({ title: "Test Task" });
      const today = DateUtils.startOfToday();

      expect(task.dueDate).toEqual(today);
    });

    it("should handle different date formats", () => {
      const isoDate = "2024-12-31";
      const task = new Task({ title: "Test Task", dueDate: isoDate });

      expect(task.dueDate).toEqual(new Date(isoDate));
    });
  });

  describe("Tags management", () => {
    it("should handle empty tags array", () => {
      const task = new Task({ title: "Test Task", tags: [] });

      expect(task.tags).toEqual([]);
    });

    it("should handle single tag", () => {
      const task = new Task({ title: "Test Task", tags: [TaskTag.Trabalho] });

      expect(task.tags).toEqual([TaskTag.Trabalho]);
    });

    it("should handle multiple tags", () => {
      const tags = [TaskTag.Trabalho, TaskTag.Pessoal, TaskTag.Afazeres];
      const task = new Task({ title: "Test Task", tags });

      expect(task.tags).toEqual(tags);
    });

    it("should default to empty array when no tags provided", () => {
      const task = new Task({ title: "Test Task" });

      expect(task.tags).toEqual([]);
    });

    it("should preserve tag order", () => {
      const tags = [TaskTag.Outro, TaskTag.Trabalho, TaskTag.Pessoal];
      const task = new Task({ title: "Test Task", tags });

      expect(task.tags).toEqual(tags);
    });
  });

  describe("Priority handling", () => {
    it("should use provided priority", () => {
      const task = new Task({ title: "Test Task", priority: Priority.High });

      expect(task.priority).toBe(Priority.High);
    });

    it("should default to Medium priority", () => {
      const task = new Task({ title: "Test Task" });

      expect(task.priority).toBe(Priority.Medium);
    });

    it("should handle all priority levels", () => {
      const lowTask = new Task({ title: "Low", priority: Priority.Low });
      const mediumTask = new Task({
        title: "Medium",
        priority: Priority.Medium,
      });
      const highTask = new Task({ title: "High", priority: Priority.High });

      expect(lowTask.priority).toBe(Priority.Low);
      expect(mediumTask.priority).toBe(Priority.Medium);
      expect(highTask.priority).toBe(Priority.High);
    });
  });

  describe("Entity behavior", () => {
    it("should inherit equality comparison", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const task1 = new Task({ id, title: "Task 1" });
      const task2 = new Task({ id, title: "Task 2" });

      expect(task1.equals(task2)).toBe(true);
    });

    it("should inherit cloning functionality", () => {
      const task = new Task({
        title: "Original Task",
        priority: Priority.Low,
        completed: false,
      });
      const cloned = task.clone({
        title: "Cloned Task",
        priority: Priority.High,
      });

      expect(cloned.id).toBe(task.id);
      expect(cloned.title).toBe("Cloned Task");
      expect(cloned.priority).toBe(Priority.High);
      expect(cloned.completed).toBe(false);
    });

    it("should provide access to props through data getter", () => {
      const task = new Task({ title: "Test Task", priority: Priority.High });
      const data = task.data;

      expect(data.title).toBe("Test Task");
      expect(data.priority).toBe(Priority.High);
    });
  });

  describe("Edge cases", () => {
    it("should handle task with all properties set to edge values", () => {
      const task = new Task({
        title: "ABC", // Minimum length
        dueDate: new Date("1970-01-01"),
        tags: [],
        priority: Priority.Low,
        completed: true,
      });

      expect(task.title).toBe("ABC");
      expect(task.dueDate).toEqual(new Date("1970-01-01"));
      expect(task.tags).toEqual([]);
      expect(task.priority).toBe(Priority.Low);
      expect(task.completed).toBe(true);
    });

    it("should handle invalid date string gracefully", () => {
      const task = new Task({
        title: "Test Task",
        dueDate: "invalid-date",
      });

      expect(task.dueDate).toEqual(DateUtils.startOfToday());
      expect(isNaN(task.dueDate.getTime())).toBe(false);
    });

    it("should maintain immutability across operations", () => {
      const originalDate = new Date("2024-12-31");
      const task = new Task({
        title: "Test Task",
        dueDate: originalDate,
        tags: [TaskTag.Trabalho],
        priority: Priority.High,
        completed: false,
      });

      const completed = task.toggleComplete();
      const draft = task.asDraft();
      const cloned = task.clone({ title: "Cloned Task" });

      // Original should remain unchanged
      expect(task.title).toBe("Test Task");
      expect(task.dueDate).toBe(originalDate);
      expect(task.tags).toEqual([TaskTag.Trabalho]);
      expect(task.priority).toBe(Priority.High);
      expect(task.completed).toBe(false);

      // Operations should create new instances
      expect(completed.completed).toBe(true);
      expect(draft.isDraft()).toBe(true);
      expect(cloned.title).toBe("Cloned Task");
    });

    it("should handle long titles in valid mode", () => {
      const longTitle = "A".repeat(100);
      const task = new Task({ title: longTitle });

      expect(task.title).toBe(longTitle);
    });

    it("should handle future dates", () => {
      const futureDate = new Date("2030-12-31");
      const task = new Task({ title: "Future Task", dueDate: futureDate });

      expect(task.dueDate).toBe(futureDate);
    });

    it("should handle past dates", () => {
      const pastDate = new Date("2020-01-01");
      const task = new Task({ title: "Past Task", dueDate: pastDate });

      expect(task.dueDate).toBe(pastDate);
    });
  });
});
