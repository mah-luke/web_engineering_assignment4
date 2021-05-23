import { test_, expectText, getComponent, getElement, expectPropValue } from './jest-tuwien';
import { stringify, xrand } from "./jest-tuwien/pretty";
import { shallowMount } from "@vue/test-utils";
import fetchMock from "fetch-mock-jest";
import flushPromises from "flush-promises";
import { cartDescription } from './obf';

import CartItem from "../src/components/CartItem";
import FramedArtwork from "../src/components/FramedArtwork";
import MuseumLabel from "../src/components/MuseumLabel";

function mockArtmart(steps, chance) {
  const cartItem = chance.cartItem();
  const artwork = chance.artwork({ artworkId: cartItem.artworkId });
  const artworkStr = stringify(artwork, { mark: xrand });

  steps.push(
    'start intercepting requests to the Artmart API',
    `The first <code>GET</code> request to <code>/artworks/${xrand(artwork.artworkId)}</code> ` +
    `will return <code>200 OK</code> with the following JSON payload:\n<pre>${artworkStr}</pre>`
  )
  fetchMock.getOnce('glob:*/artworks/' + artwork.artworkId, artwork);
  fetchMock.any(501);

  return { cartItem, artwork };
}

function mountCartItem(steps, cartItem, store = null) {
  const cartItemStr = stringify(cartItem, { mark: xrand, inspect: true })
  steps.push(
    `mount the <code>CartItem</code> component with stubbed child components`,
    `The <code>cartItem</code> prop is set to the following value: <pre>${cartItemStr}</pre>`
  )
  let mocks = store ? { $store: store } : {};
  return shallowMount(CartItem, { stubs: ['router-link'], propsData: { cartItem }, mocks });
}


describe('CartItem', () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  test_(301, 'FramedArtwork subcomponent', async (steps, chance) => {
    const { cartItem, artwork } = mockArtmart(steps, chance);
    const wrapper = mountCartItem(steps, cartItem);
    await flushPromises();

    steps.push('expect to find a <code>FramedArtwork</code> subcomponent')
    const framedArtwork = getComponent(wrapper, FramedArtwork);

    steps.push('expect <code>FramedArtwork</code> props to be bound correctly')
    expectPropValue(framedArtwork, 'artwork.image', artwork.image);
    expectPropValue(framedArtwork, 'artwork.title', artwork.title);
    expectPropValue(framedArtwork, 'config.printSize', cartItem.printSize);
    expectPropValue(framedArtwork, 'config.frameStyle', cartItem.frameStyle);
    expectPropValue(framedArtwork, 'config.matColor', cartItem.matColor);
  });

  test_(302, 'MuseumLabel subcomponent', async (steps, chance) => {
    const { cartItem, artwork } = mockArtmart(steps, chance);
    const wrapper = mountCartItem(steps, cartItem);
    await flushPromises();
    steps.push('expect to find a <code>MuseumLabel</code> subcomponent')
    const museumLabel = getComponent(wrapper, MuseumLabel);
    steps.push('expect <code>MuseumLabel</code> props to be bound correctly')
    expectPropValue(museumLabel, 'artwork.title', artwork.title);
    expectPropValue(museumLabel, 'artwork.artist', artwork.artist);
    expectPropValue(museumLabel, 'artwork.date', artwork.date);
  });

  test_(303, 'Frame description', async (steps, chance) => {
    const { cartItem } = mockArtmart(steps, chance);
    const wrapper = mountCartItem(steps, cartItem);
    await flushPromises();
    steps.push('expect frame description to match cart item')
    expectText(wrapper, cartDescription(cartItem), false);
  });

  test_(304, 'Price', async (steps, chance) => {
    const { cartItem } = mockArtmart(steps, chance);
    const wrapper = mountCartItem(steps, cartItem);
    await flushPromises();
    steps.push('expect price to match cart item')
    expectText(wrapper, '€ ' + (cartItem.price / 100).toFixed(2), false);
  });

  test_(305, 'Remove', async (steps, chance) => {
    const { cartItem } = mockArtmart(steps, chance);
    const storeMock = { dispatch: jest.fn() };
    const wrapper = mountCartItem(steps, cartItem, storeMock);
    await flushPromises();

    steps.push('click remove button')
    const removeButton = getElement(wrapper, 'button.cart-remove');
    await removeButton.trigger('click');

    steps.push('expect the appropiate store action to be dispatched');
    expect(storeMock.dispatch).toHaveBeenCalledWith('removeFromCart', cartItem.cartItemId);

  });

});
