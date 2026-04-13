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
