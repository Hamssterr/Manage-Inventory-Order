import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import type { Express } from "express";

// 1. Giới hạn Request chung cho toàn bộ API (Chống DoS/DDoS cơ bản)
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Khung thời gian: 15 phút
  limit: 100, // Giới hạn tối đa 100 requests / 15 phút / 1 IP
  message: {
    success: false,
    message:
      "Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true, // Trả về thông tin rate limit trong header `RateLimit-*`
  legacyHeaders: false, // Vô hiệu hóa các header `X-RateLimit-*` cũ
});

// 2. Giới hạn Request cực kỳ nghiêm ngặt cho API Đăng nhập (Chống Brute-force mật khẩu)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 10, // Chỉ cho phép tối đa 10 lần thử đăng nhập sai / 15 phút
  message: {
    success: false,
    message:
      "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 15 phút trước khi thử lại.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Hàm tích hợp toàn bộ các lớp bảo mật vào ứng dụng Express
export const applySecurityMiddlewares = (app: Express): void => {
  // Bật Trust Proxy nếu chạy phía sau Nginx, Cloudflare, Load Balancer
  // Để Rate Limit nhận diện đúng IP thực của Client thay vì IP của Proxy
  app.set("trust proxy", 1);

  // Lớp 1: Bảo mật HTTP Headers
  app.use(helmet());

  // Lớp 2: Ngăn chặn NoSQL Injection tương thích hoàn toàn với Express v5
  // Express v5 thiết lập req.query là getter-only, do đó ta gọi hàm sanitize trực tiếp
  // trên từng object để làm sạch (in-place) thay vì gán đè req[key] gây lỗi.
  app.use((req, _res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.query) mongoSanitize.sanitize(req.query);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
  });
};
