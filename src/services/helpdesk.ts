import HelpDesk, { IHelpDesk } from "../models/helpdesk";

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
  ): Promise<IHelpDesk | null> {
    const result = await HelpDesk.findByIdAndUpdate(helpdeskId, helpdeskData, {
      new: true,
    });
    if (!result) return null;
    const helpdesk: IHelpDesk = { ...result.toObject() };
    return helpdesk;
  }

  async deleteHelpDesk(helpdeskId: string): Promise<IHelpDesk | null> {
    const helpdesk = await HelpDesk.findByIdAndDelete(helpdeskId);
    return helpdesk;
  }
}

export default new HelpDeskService();
