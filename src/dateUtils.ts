import { MONTH_NAMES } from './colors';

export function daysUntilBirthday(day: number, month: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  let bday = new Date(year, month - 1, day);
  bday.setHours(0, 0, 0, 0);

  if (bday < today) {
    bday = new Date(year + 1, month - 1, day);
    bday.setHours(0, 0, 0, 0);
  }

  return Math.round((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatBirthdayDate(day: number, month: number, year?: number): string {
  const monthName = MONTH_NAMES[month - 1];
  if (year) return `${day} de ${monthName} de ${year}`;
  return `${day} de ${monthName}`;
}

export function getAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

export function getDaysInMonth(month: number): number {
  return new Date(2024, month, 0).getDate(); // 2024 is leap year
}

export function sortByUpcoming(
  a: { day: number; month: number },
  b: { day: number; month: number },
): number {
  return daysUntilBirthday(a.day, a.month) - daysUntilBirthday(b.day, b.month);
}

export function getDayBeforeMonthDay(month: number, day: number): { month: number; day: number } {
  if (day > 1) return { month, day: day - 1 };
  const prevMonth = month === 1 ? 12 : month - 1;
  return { month: prevMonth, day: getDaysInMonth(prevMonth) };
}
