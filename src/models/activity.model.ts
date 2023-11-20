import { Schema, model } from "mongoose";

// Interfaces:
export interface IVideosWatched {
  videoId: string;
  plays: number;
  pauses: number;
  timeWatched: number;
  completed: boolean;
}

export interface IActivity {
  category: string;
  product: string;
  tags: string[];
  videosWatched: IVideosWatched[];
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideosWatched>({
  videoId: {
    type: String,
    required: true,
  },
  plays: {
    type: Number,
    required: true,
  },
  pauses: {
    type: Number,
    required: true,
  },
  timeWatched: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
});

const ActivitySchema = new Schema<IActivity>(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    product: {
      type: String,
      required: [true, "Product is required"],
    },
    tags: {
      type: [String],
      default: [],
      trim: true,
      lowercase: true,
      minlength: 1,
      validate: {
        validator: (value: string[]) => value.length > 0 && value.length <= 6,
        message: "Selected tags must be between 1 and 6",
      },
    },
    videosWatched: {
      type: [videoSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Activity = model<IActivity>("Activity", ActivitySchema);

export default Activity;
