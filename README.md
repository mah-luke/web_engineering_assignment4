# Assignment 4: Frontend with Vue.js

In the fourth and final assignment, you are tasked with using the [Vue.js framework] (version 2) to re-implement the __Artmart__ frontend from A2 and to connect it to the backend API from A3.

In contrast to the other assignments, you are already given a larger portion of partially implemented functionality. It is explicitly part of the assignment for you to **carefully read the existing code structures** to understand the existing functionality. To guide your implementation, we have occasionally added comments with TODO directives.

The application is organized in *Pages*, reflecting the page structure you know from previous assignments: `Search.vue`, `Framing.vue`, `Cart.vue` and `Checkout.vue`. Each page references further components, some of which are already fully implemented, while others have to be implemented by you (specifically, `CartItem.vue` and `WidthSlider.vue`).

We have used [Vue Router] (version 3) to implement in-app routing. Check out `routes.js` to see the routes we provided. You do not need to change anything there.

We have used [Vuex] (version 3) to implement centralized state management. Carefully read through the code in `store.js` and understand how state, getters, mutations, and actions relate to each other, and how the store interacts with the backend API. The proper way to interact with the store from within components is by using the read-only `this.$store.state` and `this.$store.getters` properties or by dispatching asynchronous mutating actions using `this.$store.dispatch`. Check out the [Vuex documentation][Vuex] for more information. Note that you should not modify `store.js`, all necessary functionality is already provided.

[Vue.js framework]: https://vuejs.org
[Vue Router]: https://router.vuejs.org
[Vuex]: https://vuex.vuejs.org

## What you need to do

We already implemented all the functionality of the Search page for you to explore (`Search.vue`). What you need to do is to complete the implementation of the remaining pages and some of their required components.

### Width Slider Component (`src/components/framing/WidthSlider.vue`)

- Implement a reusable, self-contained component that encapsulates the number input / range slider combination used by the *Frame Width* and *Mat Width* options of the Framing page.

- The component expects to receive the following properties on instantiation:

  | Name    | Type   | Description
  |---------|--------|------------
  | `min`   | Number | Lower bound, in millimeters (e.g. 20 for frame width)
  | `max`   | Number | Upper bound, in millimeters (e.g. 100 for mat width)
  | `value` | Number | Initial value, in millimeters
  | `label` | String | The label for the component (e.g. "Frame" or "Mat")

- Uphold the same constraints expressed in A2:
  - Ensure that only valid values can be entered. The width can range from `min` to `max`, with 1 millimeter steps.
  - Connect the number field with the range slider, so that changing the value of the slider changes the value in the number field, and vice versa.

- The component should provide the ability for a two-way binding of its value through `v-model`. For instance, the parent component should be able to set the values of the number field and range slider by establishing a binding to its (the parent's) reactive data fields (e.g. `config.frameWidth`), which should conversely be updated when the number field or range slider values change. This can be accomplished by emitting the appropriate event in the component. See the Vue documentation on [Form Input Bindings](https://vuejs.org/v2/guide/forms.html) and [Using `v-model` on Components](https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components) for more information.

- Hint: *Within* the component, use the `change` event on the number field and the `input` event on the range slider to be notified of changes in their respective values.

- Beware that the unit of the component value is *millimeters*, while the HTML form values (which reflect what the user sees) are in *centimeters*.

### Framing Page (`src/pages/Framing.vue`)

- Insert the missing components of the frame configurator and ensure that everything is functional and bound properly (using `v-model`) to the respective `config` data model properties. In particular, you need to instantiate the following components:
  - `WidthSlider` (for frame width)
  - `FrameStylePicker`
  - `WidthSlider` (for mat width)
  - `MatColorPicker`

- Establish proper bindings for the price (and ensure that it is formatted properly).

- Implement the correct functionality when the "Add to Cart" button is clicked:
  - Update the shopping cart by properly communicating with the Vuex store (using `this.$store`).
  - Redirect to the Cart page using `this.$router`.

### Cart Item Component (`src/components/CartItem.vue`)

- The component expects to receive a `cartItem` object (containing `artworkId`, `price`, `printSize`, `frameWidth`, `frameStyle`, `matWidth`, `matColor`) on instantiation.

- Load the artwork metadata during the appropriate [lifecycle hook](https://vuejs.org/v2/guide/instance.html#Instance-Lifecycle-Hooks) using a function from `ArtmartService.js`.

- Use the `FramedArtwork` and `MuseumLabel` components to display an image of the framed artwork and additional information about the item.

- The framed artwork preview should link back to the correct Framing page. Hint: Use the [`router-link`](https://router.vuejs.org/api/#router-link) component and the provided `framingRoute` computed property.

- Display a description of the artwork (title, artist, date), a textual description of the frame configuration (identical to A2), the price of the item and a remove button. Hint: Use the [slot](https://vuejs.org/v2/guide/components-slots.html) provided by the `MuseumLabel` component to reuse functionality and styling.

- When the remove button is clicked, update the shopping cart by properly communicating with the Vuex store (using `this.$store`).

### Cart Page (`src/pages/Cart.vue`)

- If there are no items in the shopping cart, display the text "There are no items in your shopping cart."

- Use list rendering on the Cart Item component to display all shopping cart items. Properly communicate with the Vuex store (using `this.$store`) to retrieve the current items. Ensure that if the store changes (e.g. when an item has been removed), the Cart page reflects this change.

- Display the properly formatted total price. (Hint: use the store)

- When clicking the "Checkout" button, redirect to the Checkout page using `this.$router`.

### Checkout Page (`src/pages/Checkout.vue`)

- If the shopping cart is empty, redirect to the Cart page using `this.$router`.

- Populate the shipping destination options using list rendering. You can get the available shipping destinations from the Vuex store (using `this.$store`).

- Display the correctly formatted subtotal, shipping cost and total price, depending on the state of the shopping cart and the currently selected shipping destination.

- Bind the form inputs to your data model. Hint: choose a data model that is already close to what you need to communicate with the Artmart and Bling APIs.

- Implement the client side of the [Bling payment flow](https://web-engineering.big.tuwien.ac.at/s21/bling/#overview):

  - Complete the implementation of `BlingService.js`. Note: Use the JavaScript [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

  - When the form is submitted, use the `checkout` function from `ArtmartService.js` to begin the payment process and the `confirmPaymentIntent` function from `BlingService.js` to complete it. Be sure to handle both client and server errors gracefully.

  - During processing of the payment, display only the block marked `PROCESSING` in the template code. (Specifically, do not display the checkout form during this time.) Hint: You can use your browser's developer tools to artificially slow down network requests, which gives you time to see what happens during processing.
  
  - After a successful payment, display only the block marked `SUCCESS` in the template code. (Again, do not display the checkout form anymore.)

  - If there was an error, show the checkout form again (with all previously filled-in data) and above it display the block marked `ERROR` in the template code.

  - Make sure to eventually trigger the `loadCart` action from the Vuex store to ensure the shopping cart is still in sync with the backend.

## Additional notes

- In the provided template code, you will need to introduce certain Vue directives to establish bindings and events, e.g. `v-bind`, `v-model`, `v-on` or their shortened versions. Do not directly manipulate the DOM in any way! Always use appropriate bindings to model the relationship between data and output.

- Do not modify `package.json` or install any additional packages. You are not allowed to use any third-party libraries, beyond the ones we have provided. (This also means you can't use TypeScript. Sorry.)

- **Keep it simple.** Try the simplest solution that could possibly work. There is no need to do anything fancy.

- **The tests are part of the specification.** If you think your implementation works and is correct but the tests fail, then your implementation is, by definition, not correct.

- If something is not covered by the tests, *but specified in the assignment*, then we expect you to implement it. We might run additional tests on our end. Inversely, if something is not specified in the assignment, *but expected by the tests*, then we also expect you to implement it.

- As this is a group exercise, we expect all team members to contribute in roughly equal amounts. The git history reflects each team member's individual contributions, so keep that in mind.

- Please **do not use real credit card numbers**.

## Local development and tests

> :warning: **Do not modify `package.json` or anything in the `test` folder.** For the final assessment, we will copy your `src` folder into our own test environment (which also might include additional tests). If your code depends on modifications outside the `src` folder (no matter how trivial!) it will not pass the final tests.

1. You need to have [Node.js](https://nodejs.org) installed. Unfortunately, due to some hairy dependency issues, `node v15.x` is required, `node v16.x` will likely not work!

2. Make sure you are in the top-level directory of this project (viz. the directory this README file is in).

3. If this is the first time, install the required dependencies using `npm install`. You only need to do this once.

4. Now you can start a development server using `npm run serve`. This uses the [Vue CLI service](https://cli.vuejs.org/guide/) to compile your Vue components. It will helpfully complain if you have errors in your code.

5. You can run the tests with `npm test`. As always, the tests will print out your point total and generate a detailed `report.html` file.

Also note the following points:

- It is not necessary, but we recommend installing the [Vue.js devtools](https://github.com/vuejs/vue-devtools) for Chrome or Firefox to aid in debugging and development.

- We are providing a full [reference implementation of the Artmart API](https://web-engineering.big.tuwien.ac.at/s21/a4/), running on our servers. This is what `ArtmartService.js` uses by default (see `ARTMART_BASE_URL`). If you want, you can change this and reuse your own server from A3. The tests will remain unaffected.

- Since the reference Artmart API runs on our servers, and you will develop on localhost, any cookies set by the backend will be seen as cross-site cookies. This can lead to some issues, which you should be aware of:

  - It is not possible to edit or delete cross-site cookies via JavaScript. This means that if the backend server expires your session, the client will be stuck trying to send an invalid session ID. You will have to manually clear the session cookie from the browser cache if this happens.

  - Privacy protection measures like Safari's [Intelligent Tracking Prevention](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/) also prevent some cross-site cookies by default. Additionally, due to [various bugs](https://www.chromium.org/updates/same-site/incompatible-clients), some browsers and browser versions don't handle cross-site cookies correctly at all. We strongly recommend that you use the latest version of Chrome for local development.
