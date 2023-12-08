import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IVideo {
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
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Tag",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Video = model<IVideo>("Video", VideoSchema);

export default Video;
