export const getDateRangeQuery = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return {};

  const query: any = {};
  if (startDate) {
    query.$gte = new Date(startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query.$lte = end;
  }
  return query;
};

export const formatLocalYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const buildChartConfig = (filter: string | any) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (filter === "Tháng") {
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    return {
      type: "month",
      startDate: new Date(currentYear, currentMonth, 1),
      endDate,
      dateFormat: "%Y-%m-%d",
      periodCount: endDate.getDate(),
      currentYear,
    };
  }

  if (filter === "Năm") {
    return {
      type: "year",
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31, 23, 59, 59, 999),
      dateFormat: "%Y-%m",
      periodCount: 12,
      currentYear,
    };
  }

  // Mặc định là Tuần
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const startDate = new Date(
    currentYear,
    currentMonth,
    diffToMonday,
    0,
    0,
    0,
    0,
  );
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 6,
    23,
    59,
    59,
    999,
  );

  return {
    type: "week",
    startDate,
    endDate,
    dateFormat: "%Y-%m-%d",
    periodCount: 7,
    currentYear,
  };
};

export const fillChartDataGaps = (
  chartResult: any[],
  config: ReturnType<typeof buildChartConfig>,
) => {
  const { type, startDate, periodCount, currentYear } = config;
  const finalChartData = [];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  for (let i = 0; i < periodCount; i++) {
    let key = "";
    let displayLabel = "";

    if (type === "week") {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      key = formatLocalYYYYMMDD(d);
      displayLabel = dayNames[d.getDay()];
    } else if (type === "month") {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      key = formatLocalYYYYMMDD(d);
      displayLabel = `${d.getDate()}`;
    } else {
      key = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      displayLabel = `T${i + 1}`;
    }

    const match = chartResult.find((item) => item._id === key);
    finalChartData.push({
      label: displayLabel,
      value: match ? match.revenue : 0,
    });
  }

  return finalChartData;
};
