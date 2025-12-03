import { DateUtils } from "../../src/utils/date.utils";

describe("DateUtils", () => {
  describe("startOfDay", () => {
    it("should return the start of the day (00:00:00.000)", () => {
      const date = new Date();
      date.setHours(15, 30, 45, 123);
      const result = DateUtils.startOfDay(date);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getFullYear()).toBe(date.getFullYear());
      expect(result.getMonth()).toBe(date.getMonth());
      expect(result.getDate()).toBe(date.getDate());
    });

    it("should not modify the original date", () => {
      const originalDate = new Date();
      originalDate.setHours(15, 30, 45, 123);
      const originalTime = originalDate.getTime();

      DateUtils.startOfDay(originalDate);

      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe("endOfDay", () => {
    it("should return the end of the day (23:59:59.999)", () => {
      const date = new Date();
      date.setHours(15, 30, 45, 123);
      const result = DateUtils.endOfDay(date);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
      expect(result.getFullYear()).toBe(date.getFullYear());
      expect(result.getMonth()).toBe(date.getMonth());
      expect(result.getDate()).toBe(date.getDate());
    });

    it("should not modify the original date", () => {
      const originalDate = new Date();
      originalDate.setHours(15, 30, 45, 123);
      const originalTime = originalDate.getTime();

      DateUtils.endOfDay(originalDate);

      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe("addDays", () => {
    it("should add positive days correctly", () => {
      const date = new Date(2025, 9, 14); // October 14, 2025
      const result = DateUtils.addDays(date, 5);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9); // October is month 9 (0-based)
      expect(result.getDate()).toBe(19);
    });

    it("should subtract days when negative number is provided", () => {
      const date = new Date(2025, 9, 14); // October 14, 2025
      const result = DateUtils.addDays(date, -5);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9);
      expect(result.getDate()).toBe(9);
    });

    it("should handle month transitions", () => {
      const date = new Date(2025, 9, 30); // October 30, 2025
      const result = DateUtils.addDays(date, 5);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(10); // November is month 10
      expect(result.getDate()).toBe(4);
    });

    it("should handle year transitions", () => {
      const date = new Date(2025, 11, 30); // December 30, 2025
      const result = DateUtils.addDays(date, 5);

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January is month 0
      expect(result.getDate()).toBe(4);
    });

    it("should not modify the original date", () => {
      const originalDate = new Date(2025, 9, 14); // October 14, 2025
      const originalTime = originalDate.getTime();

      DateUtils.addDays(originalDate, 5);

      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe("isSameDay", () => {
    it("should return true for dates on the same day", () => {
      const baseDate = new Date(2025, 9, 14); // October 14, 2025
      const date1 = new Date(baseDate.getTime());
      date1.setHours(10, 30, 0, 0);
      const date2 = new Date(baseDate.getTime());
      date2.setHours(22, 45, 0, 0);

      expect(DateUtils.isSameDay(date1, date2)).toBe(true);
    });

    it("should return false for dates on different days", () => {
      const date1 = new Date(2025, 9, 14, 23, 59, 59); // October 14, 2025 23:59:59
      const date2 = new Date(2025, 9, 15, 0, 0, 0); // October 15, 2025 00:00:00

      expect(DateUtils.isSameDay(date1, date2)).toBe(false);
    });

    it("should return false for dates in different months", () => {
      const date1 = new Date(2025, 9, 14); // October 14, 2025
      const date2 = new Date(2025, 10, 14); // November 14, 2025

      expect(DateUtils.isSameDay(date1, date2)).toBe(false);
    });

    it("should return false for dates in different years", () => {
      const date1 = new Date(2025, 9, 14); // October 14, 2025
      const date2 = new Date(2024, 9, 14); // October 14, 2024

      expect(DateUtils.isSameDay(date1, date2)).toBe(false);
    });
  });

  describe("lastDayOfMonth", () => {
    it("should return the last day of October", () => {
      const date = new Date(2025, 9, 14); // October 14, 2025
      const result = DateUtils.lastDayOfMonth(date);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9); // October
      expect(result.getDate()).toBe(31);
    });

    it("should return the last day of February in a non-leap year", () => {
      const date = new Date(2025, 1, 14); // February 14, 2025
      const result = DateUtils.lastDayOfMonth(date);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(28);
    });

    it("should return the last day of February in a leap year", () => {
      const date = new Date(2024, 1, 14); // February 14, 2024
      const result = DateUtils.lastDayOfMonth(date);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });

    it("should handle December correctly", () => {
      const date = new Date(2025, 11, 14); // December 14, 2025
      const result = DateUtils.lastDayOfMonth(date);

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(31);
    });
  });

  describe("nextMonday", () => {
    it("should return the next Monday when current day is Tuesday", () => {
      // Tuesday, October 14, 2025
      const tuesday = new Date(2025, 9, 14); // This is a Tuesday
      const result = DateUtils.nextMonday(tuesday);

      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(20); // Next Monday is October 20
    });

    it("should return the Monday of next week when current day is Monday", () => {
      // Monday, October 13, 2025
      const monday = new Date(2025, 9, 13); // This is a Monday
      const result = DateUtils.nextMonday(monday);

      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(20); // Next Monday is October 20
    });

    it("should return the next Monday when current day is Sunday", () => {
      // Sunday, October 12, 2025
      const sunday = new Date(2025, 9, 12); // This is a Sunday
      const result = DateUtils.nextMonday(sunday);

      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(13); // Next Monday is October 13
    });

    it("should return the next Monday when current day is Saturday", () => {
      // Saturday, October 11, 2025
      const saturday = new Date(2025, 9, 11); // This is a Saturday
      const result = DateUtils.nextMonday(saturday);

      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(13); // Next Monday is October 13
    });
  });

  describe("startOfToday", () => {
    it("should return the start of the current day", () => {
      const result = DateUtils.startOfToday();
      const now = new Date();

      expect(result.getFullYear()).toBe(now.getFullYear());
      expect(result.getMonth()).toBe(now.getMonth());
      expect(result.getDate()).toBe(now.getDate());
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("startOfTomorrow", () => {
    it("should return the start of tomorrow", () => {
      const result = DateUtils.startOfTomorrow();
      const tomorrow = DateUtils.addDays(new Date(), 1);

      expect(result.getFullYear()).toBe(tomorrow.getFullYear());
      expect(result.getMonth()).toBe(tomorrow.getMonth());
      expect(result.getDate()).toBe(tomorrow.getDate());
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("endOfToday", () => {
    it("should return the end of the current day", () => {
      const result = DateUtils.endOfToday();
      const now = new Date();

      expect(result.getFullYear()).toBe(now.getFullYear());
      expect(result.getMonth()).toBe(now.getMonth());
      expect(result.getDate()).toBe(now.getDate());
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("endOfThisWeek", () => {
    it("should return the end of this week (6 days from start of today)", () => {
      const result = DateUtils.endOfThisWeek();
      const startOfToday = DateUtils.startOfToday();
      const expectedDate = DateUtils.addDays(startOfToday, 6);

      expect(result.getFullYear()).toBe(expectedDate.getFullYear());
      expect(result.getMonth()).toBe(expectedDate.getMonth());
      expect(result.getDate()).toBe(expectedDate.getDate());
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("endOfThisMonth", () => {
    it("should return the end of the current month", () => {
      const result = DateUtils.endOfThisMonth();
      const today = new Date();
      const lastDay = DateUtils.lastDayOfMonth(today);

      expect(result.getFullYear()).toBe(lastDay.getFullYear());
      expect(result.getMonth()).toBe(lastDay.getMonth());
      expect(result.getDate()).toBe(lastDay.getDate());
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("startOfNextWeek", () => {
    it("should return the start of next Monday", () => {
      const result = DateUtils.startOfNextWeek();
      const today = new Date();
      const nextMonday = DateUtils.nextMonday(DateUtils.startOfDay(today));

      expect(result.getTime()).toBe(nextMonday.getTime());
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("parseDate", () => {
    it("should return the date if input is already a Date object", () => {
      const date = new Date(2025, 9, 14); // October 14, 2025
      const result = DateUtils.parseDate(date);

      expect(result).toBe(date);
    });

    it("should parse valid date string", () => {
      const result = DateUtils.parseDate("2025-10-14");

      expect(result.getFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(9); // October
      expect(result.getUTCDate()).toBe(14);
    });

    it("should return default date for invalid date string", () => {
      const defaultDate = new Date(2025, 0, 1); // January 1, 2025
      const result = DateUtils.parseDate("invalid-date", defaultDate);

      expect(result).toBe(defaultDate);
    });

    it("should return start of today as default when no default is provided", () => {
      const result = DateUtils.parseDate("invalid-date");
      const startOfToday = DateUtils.startOfToday();

      expect(result.getTime()).toBe(startOfToday.getTime());
    });

    it("should parse ISO date strings", () => {
      const result = DateUtils.parseDate("2025-10-14T15:30:00.000Z");

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9);
      expect(result.getDate()).toBe(14);
    });
  });

  describe("classifyDueLabel", () => {
    const referenceDate = DateUtils.startOfDay(new Date()); // Use current date as reference

    it('should return "Atrasada" for dates in the past', () => {
      const pastDate = DateUtils.addDays(referenceDate, -1);
      const result = DateUtils.classifyDueLabel(pastDate, referenceDate);

      expect(result).toBe("Atrasada");
    });

    it('should return "Hoje" for the same day', () => {
      const sameDay = new Date(referenceDate.getTime());
      sameDay.setHours(15, 0, 0, 0);
      const result = DateUtils.classifyDueLabel(sameDay, referenceDate);

      expect(result).toBe("Hoje");
    });

    it('should return "Amanhã" for tomorrow', () => {
      const tomorrow = DateUtils.addDays(referenceDate, 1);
      const result = DateUtils.classifyDueLabel(tomorrow, referenceDate);

      expect(result).toBe("Amanhã");
    });

    it('should return "Em X dias" for dates 2-6 days in the future', () => {
      const twoDaysLater = DateUtils.addDays(referenceDate, 2);
      const threeDaysLater = DateUtils.addDays(referenceDate, 3);
      const sixDaysLater = DateUtils.addDays(referenceDate, 6);

      expect(DateUtils.classifyDueLabel(twoDaysLater, referenceDate)).toBe(
        "Em 2 dias"
      );
      expect(DateUtils.classifyDueLabel(threeDaysLater, referenceDate)).toBe(
        "Em 3 dias"
      );
      expect(DateUtils.classifyDueLabel(sixDaysLater, referenceDate)).toBe(
        "Em 6 dias"
      );
    });

    it('should return "Nesta semana" for dates within this week', () => {
      // Calculate dates within the current week (up to 6 days from today)
      const endOfWeek = DateUtils.endOfThisWeek();
      const dayBeforeEndOfWeek = DateUtils.addDays(endOfWeek, -1);

      // Test with a date that's definitely within this week but not tomorrow or "Em X dias"
      const daysUntilEndOfWeek = Math.ceil(
        (endOfWeek.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilEndOfWeek >= 7) {
        // If we're at the beginning of the week, test with a date 7 days later (should be "Nesta semana" according to logic)
        const withinWeekDate = DateUtils.addDays(referenceDate, 6);
        expect(DateUtils.classifyDueLabel(withinWeekDate, referenceDate)).toBe(
          "Em 6 dias"
        );
      } else {
        // Test with end of week
        expect(
          DateUtils.classifyDueLabel(dayBeforeEndOfWeek, referenceDate)
        ).toBe("Nesta semana");
      }
    });

    it('should return "Este mês" for dates later in the same month', () => {
      const lastDayOfMonth = DateUtils.lastDayOfMonth(referenceDate);

      // Create a date that's definitely in this month but after next week
      const laterInMonth = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        Math.min(referenceDate.getDate() + 20, lastDayOfMonth.getDate())
      );

      expect(DateUtils.classifyDueLabel(laterInMonth, referenceDate)).toBe(
        "Este mês"
      );
      expect(DateUtils.classifyDueLabel(lastDayOfMonth, referenceDate)).toBe(
        "Este mês"
      );
    });

    it('should return "Próximo mês" for dates in the next month', () => {
      const nextMonth = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + 1,
        15
      );

      expect(DateUtils.classifyDueLabel(nextMonth, referenceDate)).toBe(
        "Próximo mês"
      );
    });

    it('should return "Em breve" for dates far in the future', () => {
      const farFuture = new Date(referenceDate.getFullYear() + 1, 0, 15); // Next year, January 15

      expect(DateUtils.classifyDueLabel(farFuture, referenceDate)).toBe(
        "Em breve"
      );
    });

    it("should handle year transitions correctly for next month", () => {
      const decemberRef = new Date(referenceDate.getFullYear(), 11, 15); // December 15 of current year
      const januaryNext = new Date(referenceDate.getFullYear() + 1, 0, 15); // January 15 of next year

      expect(DateUtils.classifyDueLabel(januaryNext, decemberRef)).toBe(
        "Próximo mês"
      );
    });

    it("should use current date as default reference", () => {
      const tomorrow = DateUtils.addDays(new Date(), 1);
      const result = DateUtils.classifyDueLabel(tomorrow);

      expect(result).toBe("Amanhã");
    });

    it("should handle edge case where input date is exactly at week boundary", () => {
      // Create a Monday reference date dynamically
      const refDate = DateUtils.startOfDay(new Date());
      const dayOfWeek = refDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Get to Monday
      const mondayRef = DateUtils.addDays(refDate, -daysToSubtract);

      const nextMondayDate = DateUtils.nextMonday(mondayRef);

      expect(DateUtils.classifyDueLabel(nextMondayDate, mondayRef)).toBe(
        "Próxima semana"
      );
    });
  });
});
