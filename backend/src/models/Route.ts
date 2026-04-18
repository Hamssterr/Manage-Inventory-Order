import mongoose, { type Model } from "mongoose";
import { Schema, type Document } from "mongoose";

export interface IRoute extends Document {
  routeName: string;
  description?: string;
  responsibleSale: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    routeName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    responsibleSale: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true },
);

const Route: Model<IRoute> = mongoose.model<IRoute>("Route", RouteSchema);
export default Route;
