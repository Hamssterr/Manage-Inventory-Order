import { Schema, type Document, type Model } from "mongoose";
import mongoose from "mongoose";

export interface IOrderItem {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  skuSnapshot: string;
  productNameSnapshot: string;
  unitNameSnapshot: string;
  exchangeValueSnapshot: number;
  quantity: number;
  deliveredQuantity?: number;
  priceUnit: number;
  subTotal: number;
  isGift: boolean;
  promotionId?: mongoose.Types.ObjectId; // ID chương trình khuyến mãi (nếu có)
}

export interface IOrder extends Document {
  orderCode: string;
  customerId: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;

  // Snapshot thông tin khách hàng để lưu lịch sử
  customerNameSnapshot: string;
  customerPhoneSnapshot: string;
  deliveryAddressSnapshot: string;
  routeId: mongoose.Types.ObjectId;
  customerTaxCodeSnapshot: string;

  items: IOrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  note?: string;
  exportTicketId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  skuSnapshot: { type: String, required: true },
  productNameSnapshot: { type: String, required: true },
  unitNameSnapshot: { type: String, required: true },
  exchangeValueSnapshot: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  deliveredQuantity: { type: Number, min: 0 },
  priceUnit: { type: Number, required: true, min: 0 },
  subTotal: { type: Number, required: true },
  isGift: { type: Boolean, default: false },
  promotionId: { type: Schema.Types.ObjectId, ref: "Promotion" },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    saleId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    customerNameSnapshot: { type: String, required: true },
    customerPhoneSnapshot: { type: String, required: true },
    deliveryAddressSnapshot: { type: String, required: true },
    routeId: { type: Schema.Types.ObjectId, ref: "Route" },
    customerTaxCodeSnapshot: { type: String },

    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    note: { type: String },
    exportTicketId: { type: Schema.Types.ObjectId, ref: "ExportTicket" },
  },
  { timestamps: true },
);

OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
