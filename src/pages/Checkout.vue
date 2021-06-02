<template>
  <main>
    <div v-if="status == 'processing'">
      <h2>Processing payment...</h2>
      <img src="@/assets/images/spinner.gif" width="50" height="50" />
    </div>

    <div v-if="status == 'success'">
      <div>Your payment was completed successfully.</div>
      <h2>Thank you for your purchase!</h2>
      <div>
        <router-link to="/search">&larr; Back to Search</router-link>
      </div>
    </div>

    <div v-if="status == 'ready'">
      <div class="error-message" v-if="error == true">An error occurred during payment. Please try again.</div>

      <form class="checkout-form" id="checkout-form">
      <fieldset>
        <legend>Contact information</legend>
        <div class="grid">
          <label for="email">Email</label>
          <input type="email" name="email" id="email" v-model="options.email" required />
        </div>
      </fieldset>

      <fieldset>
        <legend>Shipping address</legend>
        <div class="grid">
          <label for="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            v-model="options.name"
            required
          />

          <label for="address">Address</label>
          <input
            type="text"
            name="address"
            id="address"
            v-model="options.address"
            required
          />

          <label for="city">City</label>
          <input
            type="text"
            name="city"
            id="city"
            v-model="options.city"
            required
          />

          <label for="country">Country</label>
          <select name="country" id="country" v-model="options.selDest">
            <!-- TODO: render bind destination options here -->
            <option v-for="dest in destinations" v-bind:value="dest" v-bind:key="dest.country">
              {{ dest.displayName }}
            </option>
          </select>

          <label for="postalcode">Postal code</label>
          <input
            type="text"
            name="postalcode"
            id="postalcode"
            v-model="customer.shipping_address.postal_code"
            required
          />

          <label for="phone">Phone (optional)</label>
          <input type="tel" name="phone" id="phone" v-model="customer.shipping_address.phone" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Card details</legend>
        <div class="grid">
          <label for="cardholder">Name on card</label>
          <input type="text" name="cardholder" id="cardholder" v-model="card.cardholder" required />

          <label for="cardnumber">Card number</label>
          <input type="text" name="cardnumber" id="cardnumber" v-model="card.cardnumber" required />

          <label for="cardexpiry">Expiration</label>
          <input
            type="text"
            name="cardexpiry"
            id="cardexpiry"
            v-model="options.cardexpiry"
            pattern="\d{2}/\d{4}"
            placeholder="MM/YYYY"
            required
          />

          <label for="cardcvc">CVC</label>
          <input
            name="cardcvc"
            id="cardcvc"
            v-model.number="card.cvc"
            type="text"
            pattern="\d{3}"
            required
          />
        </div>
      </fieldset>

      <div>
        <div>
          Subtotal: €
          <span id="price-subtotal">{{ displayMoney(this.cartTotal) }}</span>
        </div>
        <div>
          Shipping Costs: €
          <span id="price-shipping">{{ displayMoney(this.options.selDest.cost) }}</span>
        </div>
      </div>

      <div>
        <div class="checkout-total">
          Total: €
          <span id="price-total">{{displayMoney(this.cartTotal + this.options.selDest.cost)}}</span>
        </div>
      </div>

      <div class="button-row">
        <router-link to="/cart">&larr; Back to Cart</router-link>
        <button type="submit" id="pay-button">Pay</button>
      </div>
    </form>
    </div>
  </main>
</template>


<script>

export default {
  name: "Checkout",

  data: function() {
    return {
      card: {
        cvc: 'asdf',
        cardnumber: 'sadf',
        cardholder: 'max muster',
      },
      customer: {
        shipping_address: {
          postal_code: 'at03',
          phone: '1234'
        }
      },
      options: {
        name: 'tstName',
        email: 'tst@gmail.com',
        selDest: {
          country: String,
          cost: Number,
          displayName: String
        },
        cardexpiry: '03/2003',
        city: 'hochausen',
        address: 'hauptstr 1'

      },
      status: 'ready',
      error: false
    }
  },

  computed: {
    destinations() {
      return this.$store.getters.sortedDestinations;
    },
    cartTotal() {
      return this.$store.getters.cartTotal;
    }
  },

  mounted() {
    let newCart = this.$store.dispatch('loadCart');

    if (newCart == null) {
      this.$router.push({ path: "/cart" })
          .catch(e => console.log(e));
    }

    this.options.selDest = this.destinations[0];
  },

  methods: {
    displayMoney: function(value) {
      return (value/100).toFixed(2);
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
}

.checkout-form > div {
  margin: 1rem 0;
  text-align: right;
}

/* this is a workaround for a Chrome bug that disallows display:grid on fieldset elements */
.checkout-form div.grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 0.5em 1em;
  align-items: center;
}

.checkout-form fieldset {
  border: none;
  margin: 2rem 0;
  padding: 0;
}

.checkout-form fieldset legend {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 0.5rem;
}

.checkout-form input {
  -moz-appearance: textfield;
  font-family: inherit;
  font-size: 1em;
  height: 1.25rem;
  line-height: 1.25rem;
  padding: 3px;
  text-indent: 1.25px;
  border: 1px solid rgba(0, 0, 0, 0.10);
}

.checkout-total {
  font-size: 1.5rem;
  font-weight: bold;
}

.checkout-form .button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 600px) {
  .checkout-form {
    width: 100%;
  }
  .checkout-form label {
    margin-bottom: -0.25em;
    margin-top: 0.25em;
  }
  .checkout-form input {
    margin: 0;
  }
  .checkout-form select {
    width: 100%;
  }
  .checkout-form div.grid {
    grid-template-columns: 1fr;
  }

  .checkout-form .button-row {
    flex-direction: column-reverse;
    align-items: flex-start;
  }

  .checkout-form .button-row button {
    width: 100%;
    margin-bottom: 1em;
  }
}
</style>