import { Schema, model } from "mongoose";

export interface ITag {
  name: string;
}

const TagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: [true, "Tag name is required"],
  },
});

const Tag = model<ITag>("Tag", TagSchema);

export default Tag;
