<template>
  <div class="cart-item" v-if="artwork">

      <div class="cart-preview">
        <framed-artwork v-bind:artwork="this.artwork" v-bind:config="this.config"/>
        <p>Textttt</p> <!-- TODO: establish proper bindings -->
      </div>

    <!-- TODO: complete this and slot it into a museum label
      <div class="cart-frame-description"></div>
      <div class="cart-price">€ 0</div>
      <button class="cart-remove"></button>
    -->
  </div>
</template>

<script>
import FramedArtwork from "@/components/FramedArtwork";
import MuseumLabel from "@/components/MuseumLabel";
import ArtmartService from "@/services/ArtmartService.js";

export default {
  name: "CartItem",
  components: {
    FramedArtwork
  },
  props: {
    cartItem: {
      artworkId: Number,
      price: Number,
      printSize: String,
      frameWidth: Number,
      frameStyle: String,
      matWidth: Number,
      matColor: String
    }
  },
  data() {
    return {
      artwork: null
    };
  },
  mounted() {
    ArtmartService.getArtwork(this.artworkId).then(response =>{
      this.artwork = response;
    });
  },
  computed: {
    framingRoute() {
      return {
        path: "/framing/" + this.cartItem.artworkId,
        query: {
          printSize: this.cartItem.printSize,
          frameWidth: this.cartItem.frameWidth,
          frameStyle: this.cartItem.frameStyle,
          matWidth: this.cartItem.matWidth,
          matColor: this.cartItem.matColor
        }
      };
    },
    config() {
      return {
        printSize: this.cartItem.printSize,
        matColor: this.cartItem.matColor,
        frameStyle: this.cartItem.frameStyle
      }
    }
  }
};
</script>

<style scoped>
.cart-item {
  margin: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.cart-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 250px;
  height: 250px;
  justify-content: center;
  flex-shrink: 0;
}

.cart-preview img {
  border: 0px solid black; /* necessary for Chrome & Firefox */
  box-shadow: 0 7px 15px 0 rgba(0, 0, 0, 0.5);
}

.cart-item .museum-label {
  margin-left: 2rem;
  position: relative;
  flex-grow: 1;
  max-width: 500px;
}

.cart-item .museum-label .price {
  font-weight: bold;
  text-align: right;
  margin-top: 1rem;
}

.cart-remove {
  width: 1.5em;
  height: 1.5em;
  padding: 0;
  margin: 0;
  border-radius: 50%;

  position: absolute;
  top: -0.75em;
  right: -0.75em;

  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-remove::before {
  content: "✕";
  font-family: sans-serif;
}

.cart-frame-description {
  margin-top: 1em;
}

.cart-price {
  font-weight: bold;
  text-align: right;
  margin-top: 1em;
}

@media (max-width: 600px) {
  .cart-item {
    flex-direction: column;
  }

  .cart-preview {
    justify-content: flex-end;
  }

  .cart-item .museum-label {
    margin: 0;
    margin-top: 2rem;
  }
}
</style>