import { Schema, model } from "mongoose";

export interface IHelpDesk {
  title: string;
  url: string;
  is_discontinued: boolean;
}

const HelpDeskSchema = new Schema<IHelpDesk>({
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
});

const HelpDesk = model<IHelpDesk>("HelpDesk", HelpDeskSchema);

export default HelpDesk;
