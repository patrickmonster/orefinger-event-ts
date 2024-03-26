export interface Card {
    cardNumber: string;
    cardExpirationYear: string;
    cardExpirationMonth: string;
    cardPassword: string;
    customerIdentityNumber: string;
    cardName: string;
}

export interface AuthorizationsCard {
    mId: string;
    customerKey: string;
    authenticatedAt: string;
    method: string;
    billingKey: string;
    cardCompany: string;
    cardNumber: string;
    card: {
        issuerCode: string;
        acquirerCode: string;
        number: string;
        cardType: string;
        ownerType: string;
    };
}
