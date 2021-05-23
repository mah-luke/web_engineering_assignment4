import Vuex from "vuex";
import * as ArtmartService from "@/services/ArtmartService";

export default function buildStore() {
  return new Vuex.Store({
    state: {
      frames: null,       // Map: style -> frame { style, label, slice, cost }
      mats: null,         // Map: color -> mat { color, label, hex }
      destinations: null, // Map: country -> destination { country, displayName, cost }
      cart: []            // Array of cart items
    },
    getters: {
      sortedFrames: state => {
        return Array.from(state.frames.values())
      },
      sortedMats: state => {
        return Array.from(state.mats.values())
      },
      sortedDestinations: state => {
        return Array.from(state.destinations.values())
      },
      cartIsEmpty: state => {
        return state.cart.length == 0
      },
      cartTotal: state => {
        let total = 0;
        for (const item of state.cart) {
          total += item.price;
        }
        return total;
      }
    },
    mutations: {
      setFrames(state, frames) {
        state.frames = frames
      },
      setMats(state, mats) {
        state.mats = mats
      },
      setDestinations(state, destinations) {
        state.destinations = destinations
      },
      setCart(state, cart) {
        state.cart = cart
      }
    },
    actions: {
      async loadFrames(context) {
        const framesList = await ArtmartService.getFrames();
        const frames = new Map();
        for (const frame of framesList) {
          frames.set(frame.style, frame);
        }
        context.commit('setFrames', frames)
      },
      async loadMats(context) {
        const matsList = await ArtmartService.getMats();
        const mats = new Map();
        for (const mat of matsList) {
          mats.set(mat.color, mat);
        }
        context.commit('setMats', mats)
      },
      async loadDestinations(context) {
        const shipping = await ArtmartService.getShipping();
        const destinationsList = shipping.destinations ?? [];
        const destinations = new Map();
        for (const destination of destinationsList) {
          destinations.set(destination.country, destination);
        }
        context.commit('setDestinations', destinations);
      },
      async loadCart(context) {
        const cart = await ArtmartService.getCart()
        context.commit('setCart', cart.reverse())
      },
      async addToCart(context, product) {
        const ok = await ArtmartService.addToCart(product)
        await context.dispatch('loadCart')
        return ok
      },
      async removeFromCart(context, cartItemId) {
        const ok = await ArtmartService.deleteCartItem(cartItemId)
        await context.dispatch('loadCart')
        return ok
      }
    }
  })
}
