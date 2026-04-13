import mongoose, { type Model } from "mongoose";
import { Schema, type Document } from "mongoose";

export interface IStock extends Document {
  productId: mongoose.Types.ObjectId;
  totalQuantity: number;
  lastUpdated: Date;
}

const StockSchema = new Schema<IStock>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  totalQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Stock: Model<IStock> = mongoose.model<IStock>("Stock", StockSchema);
export default Stock;
