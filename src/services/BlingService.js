const BLING_BASE_URL = 'https://web-engineering.big.tuwien.ac.at/s21/bling'

/**
 * Confirm a payment intent with Bling to execute a payment transaction.
 * 
 * @param {string} paymentIntentId The identifier of the payment intent.
 * @param {string} clientSecret The client secret of the payment intent.
 * @param {Object} card Customer credit card information.
 * @returns {boolean} Whether the payment succeeded or not.
 */
export async function confirmPaymentIntent(paymentIntentId, clientSecret, card) {
    // TODO
    let body = {
        client_secret: clientSecret,
        cardholder: card.cardholder,
        cardnumber: card.cardnumber,
        exp_month: Number.parseInt(card.cardexpiry.split('/')[0]),
        exp_year: Number.parseInt(card.cardexpiry.split('/')[1]),
        cvc: card.cvc
    }


    const res = await fetch( BLING_BASE_URL + `/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        return null;
    }
    return res.json();
}
