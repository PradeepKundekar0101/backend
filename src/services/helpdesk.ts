import { Document } from "mongoose";
import HelpDesk, { IHelpDesk } from "../models/helpdesk";
import { Document } from "mongoose";

type IUpdatedHelpDesk = Document<unknown, {}, IHelpDesk>;

class HelpDeskService {
  async createHelpDesk(helpdeskData: IHelpDesk): Promise<IHelpDesk> {
    const helpdesk = await HelpDesk.create(helpdeskData);
    return helpdesk;
  }

  async getAllHelpDesk(): Promise<IHelpDesk[]> {
    const helpdesks = await HelpDesk.find();
    return helpdesks;
  }

  async getHelpDeskById(helpdeskId: string): Promise<IHelpDesk | null> {
    const helpdesk = await HelpDesk.findById(helpdeskId);
    return helpdesk;
  }

  async updateHelpDesk(
    helpdeskId: string,
    helpdeskData: IHelpDesk
  ): Promise<IUpdatedHelpDesk | null> {
    const helpdesk = await HelpDesk.findByIdAndUpdate(
      helpdeskId,
      helpdeskData,
      { new: true }
    ).exec();

    return helpdesk;
  }

  async deleteHelpDesk(helpdeskId: string): Promise<IUpdatedHelpDesk | null> {
    const helpdesk = await HelpDesk.findByIdAndDelete(helpdeskId);
    return helpdesk;
  }
}

export default new HelpDeskService();
