declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
    verify(): Promise<boolean>;
    close(): void;
  }

  export function createTransport(
    options?: any
  ): Transporter;
}
