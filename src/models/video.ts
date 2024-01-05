import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IVideo {
  _id: string;
  videoId: string;
  productId: ObjectId;
  tags: ObjectId[];
  is_discontinued: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    videoId: {
      type: String,
      required: [true, "Video ID is required"],
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
    is_discontinued: {
      type: Boolean,
      default: false,
    },
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

  // @ts-ignore
  this.find({ is_discontinued: false });
  next();
});

const Video = model<IVideo>("Video", VideoSchema);

export default Video;
