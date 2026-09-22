declare module 'paynow' {
  export class Paynow {
    constructor(integrationId: string, integrationKey: string);
    
    resultUrl: string;
    returnUrl: string;

    createPayment(reference: string, authEmail: string): Payment;
    send(payment: Payment): Promise<InitResponse>;
    sendMobile(payment: Payment, phone: string, method: string): Promise<InitResponse>;
    // NOTE: the installed SDK's pollTransaction() resolves an InitResponse
    // (status lowercased, e.g. "paid"/"created"/"cancelled") — there is no
    // separate StatusResponse-returning method and no `.paid()` helper.
    pollTransaction(url: string): Promise<InitResponse>;
  }

  export class Payment {
    constructor(reference: string, authEmail: string);
    add(item: string, amount: number): void;
  }

  export interface InitResponse {
    success: boolean;
    hasRedirect: boolean;
    redirectUrl?: string;
    error?: string;
    pollUrl?: string;
    instructions?: string;
    status: string;
  }
}