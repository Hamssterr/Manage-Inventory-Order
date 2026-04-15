export const formatCurrency = (
  value: number | string | undefined | null,
): string => {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (isNaN(numericValue)) return "";

  return new Intl.NumberFormat("vi-VN").format(numericValue);
};
