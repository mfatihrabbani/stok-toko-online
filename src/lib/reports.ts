export interface ReportPeriod {
  from: string;
  to: string;
}

export function defaultReportPeriod(): ReportPeriod {
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return { from: today.slice(0, 8) + "01", to: today };
}

export function formatReportDate(date: string) {
  return new Date(date + "T00:00:00+07:00").toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
  });
}
