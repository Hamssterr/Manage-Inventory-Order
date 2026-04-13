import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductUnit {
  unitName: string;
  exchangeValue: number;
  priceDefault?: number;
  isDefault: boolean;
}

export interface IProductComponent {
  productId: mongoose.Types.ObjectId;
  quantityPerBaseUnit: number;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  baseUnit: string;
  isSale: boolean;
  isGift: boolean;
  isCombo: boolean;
  components?: IProductComponent[];
  units: IProductUnit[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductUnitSchema = new Schema<IProductUnit>({
  unitName: {
    type: String,
    required: true,
    trim: true,
  },
  exchangeValue: {
    type: Number,
    required: true,
    min: 1,
  },
  priceDefault: {
    type: Number,
    default: 0,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const ProductComponentSchema = new Schema<IProductComponent>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantityPerBaseUnit: { type: Number, required: true, min: 1 },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    baseUnit: {
      type: String,
      required: true,
      lowercase: true,
    },
    isSale: {
      type: Boolean,
      default: true,
    },
    isGift: {
      type: Boolean,
      default: true,
    },
    isCombo: {
      type: Boolean,
      default: false,
    },
    components: [ProductComponentSchema],
    units: [ProductUnitSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text" });

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
);

export default Product;
