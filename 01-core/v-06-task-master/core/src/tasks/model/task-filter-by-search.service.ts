import { Task } from "./task.entity";

export class TaskFilterBySearchService {
  constructor(private readonly tasks: Task[]) {}

  filter(search: string): Task[] {
    if (!search || typeof search !== "string" || search.trim() === "") {
      return this.tasks;
    }

    const normalizedSearch = this.normalizeText(search.trim())
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    return this.tasks.filter((task) => {
      const normalizedTaskTitle = this.normalizeText(task.title).toLowerCase();
      const normalizedTagNames = task.tags
        .map((tag) => this.normalizeText(tag.toString()).toLowerCase())
        .join(" ");
      const combinedText = `${normalizedTaskTitle} ${normalizedTagNames}`;

      return normalizedSearch.every((word) => combinedText.includes(word));
    });
  }

  private normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}
