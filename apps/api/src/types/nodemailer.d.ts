declare module 'nodemailer' {
  export function createTransport(
    options?: any
  ): {
    sendMail: (options: any) => Promise<any>;
    close: () => void;
  };
}
