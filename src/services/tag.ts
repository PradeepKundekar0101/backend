import Tag, { ITag } from "../models/tag";

class TagService {
  async updateTag(tagId: string, name: string): Promise<ITag | null> {
    const tag = await Tag.findByIdAndUpdate(
      tagId,
      { name },
      { new: true }
    ).exec();

    return tag;
  }
}

export default new TagService();
