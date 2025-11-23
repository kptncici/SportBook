declare module "resend" {
  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(options: {
        from: string;
        to: string;
        subject: string;
        html?: string;
        attachments?: { filename: string; content: string }[];
      }): Promise<any>;
    };
  }
}
