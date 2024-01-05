import { Document } from "mongoose";
import { deleteObject, getObjectURL, putObjectURL } from "../aws/s3";
import HelpDesk, { IHelpDesk } from "../models/helpdesk";

type IUpdatedHelpDesk = Document<unknown, {}, IHelpDesk>;

class HelpDeskService {
  async createHelpDesk(
    helpdeskData: Partial<IHelpDesk>,
    helpdeskImage: Express.Multer.File
  ): Promise<IHelpDesk> {
    const imageName = await putObjectURL(helpdeskImage, "helpdesk");
    const helpdesk = await HelpDesk.create({
      title: helpdeskData.title,
      url: helpdeskData.url,
      image_name: imageName,
    });
    return helpdesk;
  }

  async getAllHelpDesk(): Promise<IHelpDesk[]> {
    const helpdesks = await HelpDesk.find();
    for (const helpdesk of helpdesks) {
      const image_name = helpdesk.image_name;
      helpdesk.image_url = await getObjectURL(image_name);
    }
    return helpdesks;
  }

  async getHelpDeskById(helpdeskId: string): Promise<IHelpDesk | null> {
    const helpdesk = await HelpDesk.findById(helpdeskId);
    if (!helpdesk) return null;
    const image_name = helpdesk?.image_name;
    helpdesk.image_url = await getObjectURL(image_name);

    return helpdesk;
  }

  async updateHelpDesk(
    helpdeskId: string,
    helpdeskData: IHelpDesk,
    helpdeskImage: Express.Multer.File | undefined
  ): Promise<IUpdatedHelpDesk | null> {
    let imageName: string | undefined;
    if (helpdeskImage) {
      imageName = await putObjectURL(helpdeskImage, "helpdesk");
    }
    if (imageName) {
      helpdeskData.image_name = imageName;
    }
    const helpdesk = await HelpDesk.findByIdAndUpdate(
      helpdeskId,
      helpdeskData,
      { new: true }
    );
    return helpdesk;
  }

  async deleteHelpDesk(helpdeskId: string): Promise<IUpdatedHelpDesk | null> {
    //Delete the Image from s3
    const helpdeskFound = await HelpDesk.findById(helpdeskId);
    if (!helpdeskFound) return null;
    await deleteObject(helpdeskFound.image_name);
    const helpdesk = await HelpDesk.findByIdAndDelete(helpdeskId);
    return helpdesk;
  }
}

export default new HelpDeskService();
