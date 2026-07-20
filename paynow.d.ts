declare module 'paynow' {
  export class Paynow {
    constructor(integrationId: string, integrationKey: string);
    
    resultUrl: string;
    returnUrl: string;

    createPayment(reference: string, authEmail: string): Payment;
    send(payment: Payment): Promise<InitResponse>;
    sendMobile(payment: Payment, phone: string, method: string): Promise<InitResponse>;
    pollTransactionStatus(url: string): Promise<StatusResponse>;
  }

  export class Payment {
    constructor(reference: string, authEmail: string);
    add(item: string, amount: number): void;
  }

  export interface InitResponse {
    success: boolean;
    hasRedirectUrl: boolean;
    redirectUrl?: string;
    error?: string;
    pollUrl?: string;
    status?: string;
  }

  export interface StatusResponse {
    reference: string;
    amount: string;
    status: string;
    pollUrl: string;
    paynowReference: string;
  }
}