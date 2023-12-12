import { Schema, model } from "mongoose";

export interface IHelpDesk {
  title: string;
  url:string;
}

const HelpDeskSchema = new Schema<IHelpDesk>({
  title: {
    type: String,
    required: [true, "HelpDesk name is required"],
  },
  url:{
    type:String,
    required:[true,"HelpDesk URL is required"]
  },

});

const HelpDesk = model<IHelpDesk>("HelpDesk", HelpDeskSchema);

export default HelpDesk;
