<template>
  <div>
    <artmart-header />
    <router-view v-if="loaded"></router-view>
  </div>
</template>

<script>
import Header from "@/components/Header";

export default {
  name: "App",
  components: {
    "artmart-header": Header
  },
  computed: {
    loaded() {
      return (
        this.$store.state.frames &&
        this.$store.state.mats &&
        this.$store.state.destinations
      );
    }
  },
  beforeCreate() {
    this.$store.dispatch("loadFrames");
    this.$store.dispatch("loadMats");
    this.$store.dispatch("loadDestinations");
    this.$store.dispatch("loadCart");
  }
};
</script>

<style>
</style>
