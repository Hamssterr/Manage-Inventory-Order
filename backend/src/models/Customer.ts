import { Schema, type Document, type Model } from "mongoose";
import mongoose from "mongoose";

export interface IAddress {
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  routeId?: mongoose.Types.ObjectId;
}

export interface ICustomer extends Document {
  taxCode?: string;
  name: string;
  phoneNumber: string;
  addresses: IAddress;
  saleRep: mongoose.Types.ObjectId; //Nhân viên phụ trách khách hàng
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  addressDetail: {  
    type: String,
    required: true,
  },
  ward: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: "Route",
  },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    taxCode: {
      type: String,
      sparse: true, //sparse để cho phép nhiều khách ko có MST
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    addresses: AddressSchema,

    saleRep: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

CustomerSchema.index({ name: "text", phoneNumber: 1 });

const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema,
);

export default Customer;
