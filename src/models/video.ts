import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IVideo {
  _id: string;
  videoId: string;
  productId: ObjectId;
  tags: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    videoId: {
      type: String,
      required: [true, "Video ID is required"],
      unique: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// VideoSchema.index({ productId: 1, tags: 1 });

VideoSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.populate({
    path: "tags",
    select: "-__v",
  });
  next();
});

const Video = model<IVideo>("Video", VideoSchema);

export default Video;
