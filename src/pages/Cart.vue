<template>
  <main>
    <section class="cart">
      <cart-item/>
      <!-- TODO: render and bind cart items here -->
      <div class="cart-total">
        <div class="price">Total: € 0</div>
        <!-- TODO: insert checkout button here -->
      </div>
    </section>
  </main>
</template>

<script>
import CartItem from "@/components/CartItem";
export default {
  name: "Cart",
   components: {
  //   CartItem
  }
};
</script>

<style scoped>
.cart {
  display: flex;
  flex-direction: column;
}

.cart-total {
  align-self: flex-end;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem;
  text-align: right;
}

.cart-checkout {
  align-self: flex-end;
  margin-top: 1em;
  font-size: 1rem;
}

@media (max-width: 600px) {
  .cart-total {
    align-self: stretch;
    text-align: center;
  }

  .cart-checkout {
    align-self: stretch;
    width: 100%;
  }
}

</style>