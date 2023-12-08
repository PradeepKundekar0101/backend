import mongoose, { Schema, model, ObjectId } from "mongoose";

export interface IProduct {
  name: string;
  image_url: string;
  category: ObjectId;
  tags: ObjectId[];
  is_active: boolean;
  is_discontinued: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
    },
    image_url: {
      type: String,
      required: [true, "Product image is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Tag",
      default: [],
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    is_discontinued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
