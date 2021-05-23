import { test_, expectText, getElement } from './jest-tuwien';
import { stringify, xrand, xrandkeys, rows } from "./jest-tuwien/pretty";
import { shallowMount, createLocalVue } from "@vue/test-utils";
import fetchMock from "fetch-mock-jest";
import flushPromises from "flush-promises";
import VueRouter from 'vue-router'

import routes from '../src/routes';
import Checkout from "../src/pages/Checkout";

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter({ routes })

const BLING_BASE_URL = 'https://web-engineering.big.tuwien.ac.at/s21/bling'

function mountCheckoutPage(steps, chance, { cart = null } = {}) {
  cart = cart ?? chance.cart()
  const destinations = new Map();
  for (const destination of chance.nn(chance.shippingDestination, 3, 5)) {
    destinations.set(destination.country, destination);
  }
  const store = {
    state: {
      destinations: destinations,
      cart: cart
    },
    getters: {
      sortedDestinations: Array.from(destinations.values()),
      cartIsEmpty: cart.length == 0,
      cartTotal: cart.reduce((z, x) => z + x.price, 0)
    },
    commit: () => { },
    dispatch: () => { }
  }
  const stateStr = stringify(store.state, { mark: xrand, inspect: true });
  steps.push(
    `mount the <code>Checkout</code> page with stubbed child components and a mock store`,
    `The mocked store contains the following initial state: <pre>${stateStr}</pre>`
  )
  const wrapper = shallowMount(Checkout, {
    localVue,
    router,
    stubs: ['router-link'],
    mocks: {
      $store: store
    }
  });
  return wrapper;
}

function fillForm(steps, chance, wrapper) {
  const customer = chance.customer();
  customer.shipping_address.country = chance.pickone(wrapper.vm.$store.getters.sortedDestinations).country;
  const card = chance.creditCard();
  const fillings = [
    ['#email', customer.email],
    ['#name', customer.shipping_address.name],
    ['#address', customer.shipping_address.address],
    ['#city', customer.shipping_address.city],
    ['#country', customer.shipping_address.country, 'change'],
    ['#postalcode', customer.shipping_address.postal_code],
    ['#phone', customer.shipping_address.phone ?? ""],
    ['#cardholder', card.cardholder],
    ['#cardnumber', card.cardnumber],
    ['#cardexpiry', String(card.exp_month).padStart(2, 0) + '/' + String(card.exp_year).padStart(2, 0)],
    ['#cardcvc', card.cvc]
  ]
  let fillingsTable = '<table style="width: auto; margin-top: 1em;">';
  for (let filling of fillings) {
    fillingsTable += '<tr>';
    fillingsTable += '<td style="padding: 0.5em 1em;"><code>' + filling[0] + '</code></td> ';
    fillingsTable += '<td style="padding: 0.5em 1em;"><x-rand>' + filling[1] + '</x-rand></td>';
    fillingsTable += '</tr>\n';
  }
  fillingsTable += '</table>'

  steps.push(
    'fill out form with random data', `${fillingsTable}`
  )
  for (let filling of fillings) {
    const elem = getElement(wrapper, filling[0]);
    elem.element.value = filling[1];
    elem.trigger(filling[2] ?? 'input');
  }
  return { customer, card }
}

function mockCheckout(steps, chance, customer) {
  const checkoutRequest = {
    email: customer.email,
    shipping_address: { phone: '', ...customer.shipping_address }
  };
  const checkoutResponse = {
    payment_intent_id: chance.blingPaymentIntentId(),
    client_secret: chance.blingClientSecret(),
    amount: chance.integer({ min: 100, max: 200000 }),
    currency: 'eur'
  }

  const checkoutResponseStr = stringify(checkoutResponse, { mark: xrandkeys(['currency'], false) });
  steps.push(
    'start intercepting requests to the Artmart API',
    `The first <code>POST</code> request to <code>/cart/checkout</code> ` +
    `will return <code>200 OK</code> ` +
    `with the following JSON payload:\n<pre>${checkoutResponseStr}</pre>`
  )
  fetchMock.postOnce(/\/cart\/checkout/, checkoutResponse)

  return { checkoutRequest, checkoutResponse }
}

function mockPayment(steps, chance, card, checkoutResponse, status = 'succeeded') {
  const blingEndpoint = BLING_BASE_URL + '/payment_intents/' + checkoutResponse.payment_intent_id + '/confirm';
  const blingRequest = { client_secret: checkoutResponse.client_secret, ...card };
  const blingResponse = {
    id: checkoutResponse.payment_intent_id,
    client_secret: checkoutResponse.client_secret,
    amount: checkoutResponse.amount,
    currency: 'eur',
    created_at: new Date(),
    status: status,
    card: {
      cardholder: card.cardholder,
      last4: card.cardnumber.slice(-4),
      exp_month: card.exp_month,
      exp_year: card.exp_year
    }
  }
  if (status == 'failed') {
    blingResponse.payment_error = chance.pickone(['card_expired', 'card_declined']);
  }

  const blingEndpointStr = BLING_BASE_URL + '/payment_intents/' + xrand(checkoutResponse.payment_intent_id) + '/confirm';
  const blingResponseStr = stringify(blingResponse, { mark: xrandkeys(['currency', 'created_at', 'status'], false) })
  steps.push(
    'start intercepting requests to the Bling API',
    `The first <code>POST</code> request to <code>${blingEndpointStr}</code> ` +
    `will return <code>${status == 'failed' ? '402 Payment Required' : '200 OK'}</code> ` +
    `with the following JSON payload:\n<pre>${blingResponseStr}</pre>`
  )
  fetchMock.postOnce(blingEndpoint, { status: status == 'failed' ? 402 : 200, body: blingResponse })

  return { blingEndpoint, blingRequest, blingResponse }
}

async function submitForm(steps, wrapper) {
  steps.push('submit form')
  await getElement(wrapper, '#checkout-form').trigger('submit');
  await flushPromises()
}

function expectPostRequest(url) {
  try {
    expect(fetchMock).toHavePosted(url);
  } catch (e) {
    let urlStr = 'to ' + url;
    if (url instanceof RegExp) {
      urlStr = 'matching the regular expression ' + url.source;
    }
    const postReqs = fetchMock.calls('*', 'POST').map(x => x[0]);
    throw Error(
      `Expected a POST request ${urlStr}\n\n` +
      `The following POST requests were intercepted:\n` + rows(postReqs)
    )
  }
}

function expectPayload(url, payload, expectedPayload) {
  try {
    expect(payload).toEqual(expectedPayload);
  } catch (e) {
    throw Error(
      `The payload sent to ${url} was incorrect.\n\n` +
      `Expected payload:\n  ${stringify(expectedPayload, { margin: 2 })}\n\n` +
      `Intercepted payload:\n  ${stringify(payload, { margin: 2 })}`
    )
  }
}

function expectTotalNumberOfRequests(steps, n) {
  steps.push('expect no further requests')
  if (fetchMock.calls().length > n) {
    throw Error('There were more requests than expected:\n' + JSON.stringify(fetchMock.calls(), null, 2))
  }
}

describe('Checkout', () => {

  afterEach(() => {
    fetchMock.reset();
  });

  test_(501, 'Empty cart redirect', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance, { cart: [] })
    steps.push('wait for redirect to <code>/cart</code>');
    await wrapper.vm.$nextTick();
    try {
      expect(wrapper.vm.$route.path).toBe('/cart');
    } catch (e) {
      throw Error(
        'Expected path of current route: /cart\n' +
        'Actual path of current route: ' + wrapper.vm.$route.path
      );
    }
  });

  test_(502, 'Subtotal', (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    const expectedSubtotal = (wrapper.vm.$store.getters.cartTotal / 100).toFixed(2);
    steps.push('expect page to show correct subtotal');
    const subtotalElem = getElement(wrapper, '#price-subtotal');
    expectText(subtotalElem, expectedSubtotal);
  });

  test_(503, 'Shipping costs', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    for (const destination of wrapper.vm.$store.getters.sortedDestinations) {
      const expectedCost = (destination.cost / 100).toFixed(2);
      steps.push(`select ${xrand(destination.displayName)} and expect the displayed shipping costs to be € ${xrand(expectedCost)}`)
      const countryDropdown = getElement(wrapper, '#country')
      countryDropdown.element.value = destination.country;
      await countryDropdown.trigger('change');
      const priceElem = getElement(wrapper, '#price-shipping');
      expectText(priceElem, expectedCost);
    }
  });

  test_(504, 'Total price', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    for (const destination of wrapper.vm.$store.getters.sortedDestinations) {
      const expectedTotal = ((wrapper.vm.$store.getters.cartTotal + destination.cost) / 100).toFixed(2);
      steps.push(`select ${xrand(destination.displayName)} and expect the displayed total price to be € ${xrand(expectedTotal)}`)
      const countryDropdown = getElement(wrapper, '#country')
      countryDropdown.element.value = destination.country;
      await countryDropdown.trigger('change');
      const priceElem = getElement(wrapper, '#price-total');
      expectText(priceElem, expectedTotal);
    }
  });

  test_(505, 'Successful payment', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    const { customer, card } = fillForm(steps, chance, wrapper);

    const { checkoutRequest, checkoutResponse } = mockCheckout(steps, chance, customer);
    const { blingEndpoint, blingRequest } = mockPayment(steps, chance, card, checkoutResponse);
    fetchMock.any(501);

    await submitForm(steps, wrapper);

    steps.push('expect request to Artmart with correct payload');
    expectPostRequest(/\/cart\/checkout/)
    const userPayload1 = JSON.parse(fetchMock.calls()[0][1].body);
    expectPayload('Artmart', userPayload1, checkoutRequest);

    steps.push('expect request to Bling with correct payload')
    expectPostRequest(blingEndpoint)
    const userPayload2 = JSON.parse(fetchMock.calls()[1][1].body);
    expectPayload(blingEndpoint, userPayload2, blingRequest)

    expectTotalNumberOfRequests(steps, 2);

    steps.push('expect success message to be shown');
    expectText(wrapper, 'Your payment was completed successfully. Thank you for your purchase!', false)
  });

  test_(506, 'Failed payment (1)', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    fillForm(steps, chance, wrapper);

    steps.push(
      'start intercepting requests to the Artmart API',
      `The first <code>POST</code> request to <code>/cart/checkout</code> ` +
      `will return <code>400 Bad Request</code>.`
    )
    fetchMock.postOnce(/\/cart\/checkout/, 400)
    fetchMock.any(501)

    await submitForm(steps, wrapper);

    steps.push('expect request to Artmart');
    expectPostRequest(/\/cart\/checkout/)
    expectTotalNumberOfRequests(steps, 1);

    steps.push('expect error message to be shown');
    expectText(wrapper, 'An error occurred during payment. Please try again.', false)
  });

  test_(507, 'Failed payment (2)', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    const { customer, card } = fillForm(steps, chance, wrapper);

    const { checkoutRequest, checkoutResponse } = mockCheckout(steps, chance, customer);
    const { blingEndpoint, blingRequest } = mockPayment(steps, chance, card, checkoutResponse, 'failed');
    fetchMock.any(501);

    await submitForm(steps, wrapper);

    steps.push('expect request to Artmart with correct payload');
    expectPostRequest(/\/cart\/checkout/)
    const userPayload1 = JSON.parse(fetchMock.calls()[0][1].body);
    expectPayload('Artmart', userPayload1, checkoutRequest);

    steps.push('expect request to Bling with correct payload')
    expectPostRequest(blingEndpoint)
    const userPayload2 = JSON.parse(fetchMock.calls()[1][1].body);
    expectPayload(blingEndpoint, userPayload2, blingRequest)

    expectTotalNumberOfRequests(steps, 2);

    steps.push('expect error message to be shown');
    expectText(wrapper, 'An error occurred during payment. Please try again.', false)
  });

  test_(508, 'Payment in progress (1)', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    fillForm(steps, chance, wrapper);

    steps.push(
      'start intercepting requests to the Artmart API',
      `The first <code>POST</code> request to <code>/cart/checkout</code> ` +
      `will take 10 seconds to return <code>400 Bad Request</code>.`
    )
    fetchMock.postOnce(/\/cart\/checkout/, 400, { delay: 10000 });
    fetchMock.any(501);

    await submitForm(steps, wrapper);

    steps.push('expect processing message to be shown')
    expectText(wrapper, 'Processing payment...', false)

    wrapper.destroy();
  });

  test_(509, 'Payment in progress (2)', async (steps, chance) => {
    const wrapper = mountCheckoutPage(steps, chance)
    const { customer } = fillForm(steps, chance, wrapper);

    const { checkoutResponse } = mockCheckout(steps, chance, customer);

    const blingEndpoint = BLING_BASE_URL + '/payment_intents/' + checkoutResponse.payment_intent_id + '/confirm';
    const blingEndpointStr = BLING_BASE_URL + '/payment_intents/' + xrand(checkoutResponse.payment_intent_id) + '/confirm';
    steps.push(
      'start intercepting requests to the Bling API',
      `The first <code>POST</code> request to <code>${blingEndpointStr}</code> ` +
      `will take 10 seconds to return <code>402 Payment Required</code>.`
    )
    fetchMock.postOnce(blingEndpoint, 402, { delay: 10000 })
    fetchMock.any(501);

    await submitForm(steps, wrapper);

    steps.push('expect processing message to be shown')
    expectText(wrapper, 'Processing payment...', false)

    wrapper.destroy();
  });

});