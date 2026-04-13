import mongoose from "mongoose";
import { Schema, type Document } from "mongoose";

export interface IStockLog extends Document {
  productId: mongoose.Types.ObjectId;
  type: "IMPORT" | "EXPORT" | "ADJUST"; // Nhập, Xuất, Điều chỉnh (kiểm kê)
  quantity: number;
  reason: string;
  referenceId?: mongoose.Types.ObjectId; // ID của Order hoặc ID của ExportTicket
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockLogSchema = new Schema<IStockLog>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["IMPORT", "EXPORT", "ADJUST"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: { type: String },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const StockLog = mongoose.model<IStockLog>("StockLog", StockLogSchema);
export default StockLog;
