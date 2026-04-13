import mongoose from "mongoose";
import { Schema, type Document } from "mongoose";

export interface IAggregatedItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  unitName: string;
  totalQuantity: number;
  baseQuantityToExport: number;
  displayQuantity: string;
}

export interface IExportTicket extends Document {
  ticketCode: string;
  routeId: mongoose.Types.ObjectId;
  orderIds: mongoose.Types.ObjectId[];
  aggregatedItems: IAggregatedItem[];
  status: "draft" | "exported" | "completed";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AggregatedItemSchema = new Schema<IAggregatedItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  unitName: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  baseQuantityToExport: { type: Number, required: true },
  displayQuantity: { type: String },
});

const ExportTicketSchema = new Schema<IExportTicket>(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    routeId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    orderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],
    aggregatedItems: [AggregatedItemSchema],
    status: {
      type: String,
      enum: ["draft", "exported", "completed"],
      default: "exported", // Mặc định tạo ra là xe chuẩn bị xuất bến
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

ExportTicketSchema.index({ status: 1 });

const ExportTicket = mongoose.model<IExportTicket>(
  "ExportTicket",
  ExportTicketSchema,
);

export default ExportTicket;
