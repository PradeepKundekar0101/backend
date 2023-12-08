import { Schema, model } from "mongoose";

export interface ICategory {
  name: string;
  image_url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
    },
    image_url: {
      type: String,
      required: [true, "Category image is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Category = model<ICategory>("Category", CategorySchema);

export default Category;
