import mongoose, { Schema, model, ObjectId } from "mongoose";
import validator from "validator";

export interface IVideoAnalytics {
  videoId: ObjectId;
  duration: number;
  watchTime: number;
  pausedAt: number[];
  completionRatio: number;
  wasHelpful: boolean;
}

export interface ICustomerSupportMetadata {
  ticketId: string;
  name: string;
  email: string;
  description: string;
}

export interface IAnalytics {
  sessionId: string;
  timeOnSite: number;
  location: string;
  categorySelected: ObjectId;
  productSelected: ObjectId;
  tagsSelected: ObjectId[];
  videosWatched: IVideoAnalytics[];
  customerSupportMetadata: ICustomerSupportMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoAnalyticsSchema = new Schema<IVideoAnalytics>({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: [true, "Video ID is required"],
  },
  duration: {
    type: Number,
    required: [true, "Video duration is required"],
  },
  watchTime: {
    type: Number,
    required: [true, "Video watch time is required"],
  },
  pausedAt: {
    type: [Number],
    required: [true, "Video paused at is required"],
  },
  completionRatio: {
    type: Number,
    required: [true, "Video completion ratio is required"],
    // should not be less than 0 or greater than 1
    min: [0, "Completion ratio should not be less than 0"],
    max: [1, "Completion ratio should not be greater than 1"],
  },
  wasHelpful: {
    type: Boolean,
    default: false,
    required: [true, "Video helpfulness is required"],
  },
});

const customerSupportMetadataSchema = new Schema<ICustomerSupportMetadata>({
  ticketId: {
    type: String,
    required: [true, "Zendesk Ticket ID is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
});

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      validate: [validator.isIP, "Please provide a valid IP address"],
    },
    timeOnSite: {
      type: Number,
      required: [true, "Time on site is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    categorySelected: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    productSelected: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    tagsSelected: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Tag",
      default: [],
      required: [true, "Tags are required"],
    },
    videosWatched: {
      type: [videoAnalyticsSchema],
      default: [],
      required: [true, "Videos watched are required"],
    },
    customerSupportMetadata: {
      type: customerSupportMetadataSchema,
    },
  },
  {
    timestamps: true,
  }
);

// Populate the fields:
AnalyticsSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.populate({
    path: "categorySelected",
    select: "-__v",
  });
  // @ts-ignore
  this.populate({
    path: "productSelected",
    select: "-__v",
  });
  // @ts-ignore
  this.populate({
    path: "tagsSelected",
    select: "-__v",
  });
  next();
});

const Analytics = model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
