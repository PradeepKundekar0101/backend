import { Schema, model } from "mongoose";

export interface ICategory {
  name: string;
  image_url: string;
  is_discontinued: boolean;
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
    is_discontinued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.find({ is_discontinued: false });

  next();
});

const Category = model<ICategory>("Category", CategorySchema);

export default Category;
