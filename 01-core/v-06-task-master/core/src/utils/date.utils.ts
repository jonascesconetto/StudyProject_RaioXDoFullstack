export type DueLabel =
  | "Atrasada"
  | "Hoje"
  | "Amanhã"
  | "Nesta semana"
  | "Próxima semana"
  | "Este mês"
  | "Próximo mês"
  | "Em breve"
  | `Em ${number} dias`;

export class DateUtils {
  static startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  static endOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  static addDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  }

  static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  static lastDayOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  static nextMonday(d: Date): Date {
    const day = d.getDay();
    const delta = (1 - day + 7) % 7 || 7;
    return DateUtils.addDays(d, delta);
  }

  static startOfToday(): Date {
    return DateUtils.startOfDay(new Date());
  }

  static startOfTomorrow(): Date {
    const sod = DateUtils.startOfToday();
    return DateUtils.addDays(sod, 1);
  }

  static endOfToday(): Date {
    return DateUtils.endOfDay(new Date());
  }

  static endOfThisWeek(): Date {
    const startOfToday = DateUtils.startOfToday();
    return DateUtils.endOfDay(DateUtils.addDays(startOfToday, 6));
  }

  static endOfThisMonth(): Date {
    const today = new Date();
    const last = DateUtils.lastDayOfMonth(today);
    return DateUtils.endOfDay(last);
  }

  static startOfNextWeek(): Date {
    const today = new Date();
    const sod = DateUtils.startOfDay(today);
    return DateUtils.startOfDay(DateUtils.nextMonday(sod));
  }

  static parseDate(
    input: string | Date,
    defaultDate: Date = this.startOfToday()
  ): Date {
    if (input instanceof Date) return input;
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) return defaultDate;
    return parsed;
  }

  static classifyDueLabel(input: Date, ref: Date = new Date()): DueLabel {
    const dtRef = DateUtils.startOfDay(ref);
    const dtInput = DateUtils.startOfDay(input);

    if (dtInput < dtRef) return "Atrasada";
    if (DateUtils.isSameDay(dtInput, dtRef)) return "Hoje";

    const tomorrow = DateUtils.addDays(dtRef, 1);
    if (DateUtils.isSameDay(dtInput, tomorrow)) return "Amanhã";

    const diffMs = dtInput.getTime() - dtRef.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays >= 2 && diffDays <= 6) return `Em ${diffDays} dias`;

    const nextMon = DateUtils.startOfNextWeek();
    const nextSun = DateUtils.addDays(nextMon, 6);

    if (dtInput >= nextMon && dtInput <= nextSun) return "Próxima semana";

    const sameMonthAsNow =
      dtInput.getFullYear() === dtRef.getFullYear() &&
      dtInput.getMonth() === dtRef.getMonth();
    if (sameMonthAsNow) return "Este mês";

    const nowYear = dtRef.getFullYear();
    const nowMonth = dtRef.getMonth();
    const nextMonthYear = nowMonth === 11 ? nowYear + 1 : nowYear;
    const nextMonthIndex = (nowMonth + 1) % 12;

    const isNextMonth =
      dtInput.getFullYear() === nextMonthYear &&
      dtInput.getMonth() === nextMonthIndex;
    if (isNextMonth) return "Próximo mês";

    return "Em breve";
  }
}
