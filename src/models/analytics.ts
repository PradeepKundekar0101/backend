import mongoose, { Schema, model, ObjectId } from "mongoose";

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
  wasHelpful: boolean;
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
    wasHelpful: {
      type: Boolean,
      default: false,
      required: [true, "Process Helpfulness is required"],
    },
    customerSupportMetadata: {
      type: customerSupportMetadataSchema,
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
