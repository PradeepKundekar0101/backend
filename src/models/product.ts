import mongoose, { Schema, model, ObjectId, Document } from "mongoose";
export interface IProduct extends Document {
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
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
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

// Populate the tags field:
ProductSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.populate({
    path: "tags",
    select: "-__v",
  });

  // @ts-ignore
  this.find({
    $and: [{ is_active: true }, { is_discontinued: false }],
  });
  next();
});

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
