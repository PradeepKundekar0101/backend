import axios from "axios";
import AppError from "../utils/AppError";

// Get the subdomain, email and token from the environment variables
const subdomain = process.env.ZENDESK_SUBDOMAIN;
const email = process.env.ZENDESK_ACCESS_EMAIL;
const token = process.env.ZENDESK_ACCESS_TOKEN;
const auth = Buffer.from(`${email}/token:${token}`).toString("base64");

type TResponseTicket = {
  id: number;
  url: string;
  status: string;
  subject: string;
  description: string;
};

class ZendeskService {
  async createTicket(
    name: string,
    email: string,
    description: string
  ): Promise<TResponseTicket> {
    try {
      const res = await axios.post(
        `https://${subdomain}.zendesk.com/api/v2/tickets.json`,
        {
          ticket: {
            subject: `Support Request by ${name}`,
            comment: { body: description },
            requester: { email, name },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
        }
      );

      if (res.status === 201) {
        const { ticket } = res.data;
        const response: TResponseTicket = {
          id: ticket.id,
          url: ticket.url,
          status: ticket.status,
          subject: ticket.subject,
          description: ticket.description,
        };
        return response;
      } else {
        throw new AppError(500, "Something went wrong while creating ticket!");
      }
    } catch (err) {
      throw new AppError(500, "Something went wrong while creating ticket!");
    }
  }
}

export default new ZendeskService();
