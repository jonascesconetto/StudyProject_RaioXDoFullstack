import {
  TaskFilterBySearchService,
  Task,
  Priority,
  TaskTag,
} from "../../../src";
import {
  mockTasks,
  mockEmptyTasks,
  mockSingleTask,
  mockTasksWithSpecialCharacters,
  mockTasksWithAccents,
} from "../../data/tasks.mock";

describe("TaskFilterBySearchService", () => {
  let service: TaskFilterBySearchService;

  beforeEach(() => {
    service = new TaskFilterBySearchService(mockTasks);
  });

  describe("Basic search functionality", () => {
    it("should return all tasks when search term is empty", () => {
      const result = service.filter("");
      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(mockTasks.length);
    });

    it("should return all tasks when search term is whitespace", () => {
      const result = service.filter("   ");
      expect(result).toEqual(mockTasks);
    });

    it("should return all tasks when search term is undefined", () => {
      const result = service.filter(undefined as any);
      expect(result).toEqual(mockTasks);
    });

    it("should return all tasks when search term is null", () => {
      const result = service.filter(null as any);
      expect(result).toEqual(mockTasks);
    });

    it("should return empty array when task list is empty", () => {
      const emptyService = new TaskFilterBySearchService(mockEmptyTasks);
      const result = emptyService.filter("teste");
      expect(result).toEqual([]);
    });

    it("should handle single task array", () => {
      const singleService = new TaskFilterBySearchService(mockSingleTask);
      const result = singleService.filter("única");
      expect(result).toEqual(mockSingleTask);
    });
  });

  describe("Title search", () => {
    it("should find tasks by exact title match", () => {
      const result = service.filter("Implementar autenticação do usuário");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Implementar autenticação do usuário");
    });

    it("should find tasks by partial title match", () => {
      const result = service.filter("autenticação");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("autenticação");
    });

    it("should be case insensitive", () => {
      const result = service.filter("AUTENTICAÇÃO");
      expect(result).toHaveLength(1);
      expect(result[0].title.toLowerCase()).toContain("autenticação");
    });

    it("should find multiple tasks with common words", () => {
      const result = service.filter("projeto");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.title.toLowerCase()).toContain("projeto");
      });
    });

    it("should find tasks with multiple word search", () => {
      const result = service.filter("código API");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("código");
      expect(result[0].title).toContain("API");
    });

    it("should return empty array when no matches found", () => {
      const result = service.filter("inexistente");
      expect(result).toEqual([]);
    });
  });

  describe("Tag search", () => {
    it("should find tasks by tag name", () => {
      const result = service.filter("Trabalho");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });
    });

    it("should find tasks by tag name case insensitive", () => {
      const result = service.filter("trabalho");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Trabalho);
      });
    });

    it("should find tasks by multiple tags", () => {
      const workTasks = service.filter("Trabalho");
      const personalTasks = service.filter("Pessoal");

      expect(workTasks.length).toBeGreaterThan(0);
      expect(personalTasks.length).toBeGreaterThan(0);
    });

    it("should find tasks that have specific tag combinations", () => {
      const result = service.filter("Pessoal");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((task) => {
        expect(task.tags).toContain(TaskTag.Pessoal);
      });
    });
  });

  describe("Combined search (title and tags)", () => {
    it("should find tasks matching in either title or tags", () => {
      const result = service.filter("desenvolvimento");
      expect(result.length).toBeGreaterThan(0);

      // Should find tasks with "desenvolvimento" in title
      const hasWordInTitle = result.some((task) =>
        task.title.toLowerCase().includes("desenvolvimento")
      );
      expect(hasWordInTitle).toBe(true);
    });

    it("should prioritize exact matches", () => {
      const result = service.filter("API");
      expect(result.length).toBeGreaterThan(0);

      // Should find tasks with "API" in title
      const exactMatches = result.filter((task) =>
        task.title.toLowerCase().includes("api")
      );
      expect(exactMatches.length).toBeGreaterThan(0);
    });

    it("should handle search terms that match both title and tags", () => {
      // Create service with extended tasks for testing
      const testTasks = [
        ...mockTasks,
        new Task({
          title: "Projeto pessoal de desenvolvimento",
          tags: [TaskTag.Pessoal, TaskTag.Trabalho],
          priority: Priority.Medium,
          completed: false,
        }),
      ];
      const testService = new TaskFilterBySearchService(testTasks);

      const result = testService.filter("pessoal");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Special characters and accents", () => {
    it("should handle search with special characters", () => {
      const specialService = new TaskFilterBySearchService(
        mockTasksWithSpecialCharacters
      );
      const result = specialService.filter("SSL/HTTPS");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("SSL/HTTPS");
    });

    it("should handle search with ampersand", () => {
      const specialService = new TaskFilterBySearchService(
        mockTasksWithSpecialCharacters
      );
      const result = specialService.filter("&");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("&");
    });

    it("should handle search with parentheses", () => {
      const specialService = new TaskFilterBySearchService(
        mockTasksWithSpecialCharacters
      );
      const result = specialService.filter("Jenkins");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("Jenkins");
    });

    it("should handle accented characters", () => {
      const accentService = new TaskFilterBySearchService(mockTasksWithAccents);
      const result = accentService.filter("configuração");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("Configuração");
    });

    it("should handle search without accents finding accented content", () => {
      const accentService = new TaskFilterBySearchService(mockTasksWithAccents);
      const result = accentService.filter("configuracao");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("Configuração");
    });

    it("should handle accented search finding non-accented content", () => {
      const result = service.filter("Implementar");
      const tasks = result.filter((task) =>
        task.title.toLowerCase().includes("implementar")
      );
      expect(tasks.length).toBeGreaterThan(0);
    });

    it("should handle various accent combinations", () => {
      const accentTestTasks = [
        ...mockTasksWithAccents,
        new Task({
          title: "Revisão de código e documentação",
          tags: [TaskTag.Trabalho],
          priority: Priority.Medium,
          completed: false,
        }),
        new Task({
          title: "Integração com APIs externas",
          tags: [TaskTag.Trabalho],
          priority: Priority.High,
          completed: false,
        }),
      ];
      const accentService = new TaskFilterBySearchService(accentTestTasks);

      // Test various accent searches
      const revisaoResult = accentService.filter("revisao");
      expect(revisaoResult.length).toBeGreaterThan(0);

      const integracaoResult = accentService.filter("integracao");
      expect(integracaoResult.length).toBeGreaterThan(0);

      const documentacaoResult = accentService.filter("documentacao");
      expect(documentacaoResult.length).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle very short search terms", () => {
      const result = service.filter("a");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle very long search terms", () => {
      const longTerm = "a".repeat(100);
      const result = service.filter(longTerm);
      expect(result).toEqual([]);
    });

    it("should handle search terms with only numbers", () => {
      const result = service.filter("123");
      expect(result).toEqual([]);
    });

    it("should handle search terms with mixed numbers and letters", () => {
      // Create service with task containing numbers
      const testTasks = [
        ...mockTasks,
        new Task({
          title: "Bug fix #123 - resolver erro crítico",
          tags: [TaskTag.Trabalho],
          priority: Priority.High,
          completed: false,
        }),
      ];
      const testService = new TaskFilterBySearchService(testTasks);

      const result = testService.filter("123");
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("123");
    });

    it("should trim search terms", () => {
      const result1 = service.filter("  autenticação  ");
      const result2 = service.filter("autenticação");
      expect(result1).toEqual(result2);
    });

    it("should handle multiple consecutive spaces in search", () => {
      const result = service.filter("código    API");
      expect(result).toHaveLength(1);
    });

    it("should maintain original task order when possible", () => {
      const result = service.filter("Trabalho");

      // Verify that tasks maintain their relative order
      const workTaskIds = mockTasks
        .filter((task) => task.tags.includes(TaskTag.Trabalho))
        .map((task) => task.id);

      const resultIds = result.map((task) => task.id);

      // Should maintain relative order of found tasks
      let lastFoundIndex = -1;
      workTaskIds.forEach((id) => {
        const currentIndex = resultIds.indexOf(id);
        if (currentIndex !== -1) {
          expect(currentIndex).toBeGreaterThan(lastFoundIndex);
          lastFoundIndex = currentIndex;
        }
      });
    });
  });

  describe("Performance considerations", () => {
    it("should handle large task lists efficiently", () => {
      // Create a large list of tasks
      const largeTasks: Task[] = [];
      for (let i = 0; i < 1000; i++) {
        largeTasks.push(
          new Task({
            title: `Task ${i} with some content`,
            tags: [TaskTag.Trabalho],
            priority: Priority.Medium,
            completed: false,
          })
        );
      }

      const largeService = new TaskFilterBySearchService(largeTasks);
      const startTime = performance.now();
      const result = largeService.filter("content");
      const endTime = performance.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it("should return results without modifying original array", () => {
      const originalTasks = [...mockTasks];
      const result = service.filter("API");

      expect(mockTasks).toEqual(originalTasks);
      expect(result).not.toBe(mockTasks);
    });
  });

  describe("Service instantiation", () => {
    it("should create service instance successfully", () => {
      expect(service).toBeInstanceOf(TaskFilterBySearchService);
    });

    it("should have filter method", () => {
      expect(typeof service.filter).toBe("function");
    });

    it("should work with multiple service instances", () => {
      const service1 = new TaskFilterBySearchService(mockTasks);
      const service2 = new TaskFilterBySearchService(mockTasks);

      const result1 = service1.filter("API");
      const result2 = service2.filter("API");

      expect(result1).toEqual(result2);
    });

    it("should handle empty task list on initialization", () => {
      const emptyService = new TaskFilterBySearchService([]);
      expect(emptyService).toBeInstanceOf(TaskFilterBySearchService);
      expect(emptyService.filter("test")).toEqual([]);
    });
  });
});
