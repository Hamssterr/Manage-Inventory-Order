import { format } from "date-fns";

export const formatCurrency = (
  value: number | string | undefined | null,
): string => {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (isNaN(numericValue)) return "";

  return new Intl.NumberFormat("vi-VN").format(numericValue);
};

export const formatDateTime = (date: string | Date) => {
  if (!date) return "---";
  return format(new Date(date), "HH:mm - dd/MM/yyyy");
};

// Chuyển đổi tiền sang chữ
// src/utils/currency.ts

const readDigit = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const readGroup = (group: number, isFirstGroup: boolean): string => {
  let res = "";
  const c = Math.floor(group / 100); // Hàng trăm
  const ch = Math.floor((group % 100) / 10); // Hàng chục
  const d = group % 10; // Hàng đơn vị

  if (group === 0) return "";

  // 1. Đọc hàng trăm: Chỉ đọc khi không phải nhóm đầu tiên HOẶC nhóm đầu tiên có 3 chữ số
  if (!isFirstGroup || c > 0) {
    res += readDigit[c] + " trăm ";
  }

  // 2. Đọc hàng chục
  if (ch === 0 && d !== 0) {
    if (!isFirstGroup || c > 0) res += "lẻ ";
  } else if (ch === 1) {
    res += "mười ";
  } else if (ch > 1) {
    res += readDigit[ch] + " mươi ";
  }

  // 3. Đọc hàng đơn vị
  if (d === 1 && ch > 1) {
    res += "mốt";
  } else if (d === 5 && ch > 0) {
    res += "lăm";
  } else if (d !== 0) {
    res += readDigit[d];
  }

  return res.trim();
};

export const numberToVietnameseText = (num: number): string => {
  if (num === 0) return "Không đồng";
  if (isNaN(num)) return "Số tiền không hợp lệ";

  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  let tempNum = Math.abs(num);
  let groups: number[] = [];

  // Chia nhóm 3 chữ số
  while (tempNum > 0) {
    groups.push(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }
  if (groups.length === 0) return "Không đồng";

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    // isFirstGroup = true nếu đây là nhóm cao nhất (ví dụ số 1 trong 1.995.000)
    const isFirstGroup = i === groups.length - 1;
    const groupText = readGroup(groups[i], isFirstGroup);

    if (groupText) {
      result += groupText + " " + units[i] + " ";
    }
  }

  const finalResult = result.trim().replace(/\s+/g, " ");
  return finalResult.charAt(0).toUpperCase() + finalResult.slice(1) + " đồng";
};
