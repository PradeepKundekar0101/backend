import { Schema, model } from "mongoose";

export interface ICategory {
  name: string;
  image_name:string;
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
    //It is the name by which the image will be stored in the s3
    image_name:{
      type: String,
      required: [true, "Category image name is required"],
    },
    //This field will be dynamically generated (pre signed url)
    image_url: {
      default:"",
      type: String,
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

  // @ts-ignore
  this.select("-__v -is_discontinued");

  next();
});

const Category = model<ICategory>("Category", CategorySchema);

export default Category;
