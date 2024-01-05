import { Schema, model } from "mongoose";

export interface IHelpDesk {
  title: string;
  url: string;
  is_discontinued: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  image_name: string;
  image_url: string;
}

const HelpDeskSchema = new Schema<IHelpDesk>(
  {
    title: {
      type: String,
      required: [true, "HelpDesk name is required"],
    },
    url: {
      type: String,
      required: [true, "HelpDesk URL is required"],
    },
    is_discontinued: {
      type: Boolean,
      default: false,
    },
    image_name: {
      type: String,
      required: [true, "HelpDesk Image Name is required"],
    },
    image_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const HelpDesk = model<IHelpDesk>("HelpDesk", HelpDeskSchema);

export default HelpDesk;
