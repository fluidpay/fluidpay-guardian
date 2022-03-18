<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({})
</script>

<style lang="scss">
  @import './scss/_variables.scss';

  .header {
    display: flex;
    flex-direction: column;
    width: 100%;
    .title {
      font-size: 42px;
      font-weight: bold;
      color: $color-white;
      text-align: center;
      padding: $spacing-half 0 $spacing-quarter 0;
    }
    .menu {
      display: flex;
      flex-direction: row;
      justify-content: center;
      padding: $spacing;
      a {
        color: $color-white;
        font-size: 16px;
        font-weight: bold;
        margin: 0 $spacing-half 0 $spacing-half;
      }
    }
  }
</style>

<template>
  <div class="header">
    <div class="title">FluidPay Guardian</div>
    <div class="menu">
      <a target="_blank" href="http://github.com/fluidpay/fluidpay-guardian">
        <img height="20" alt="Github Logomark" :src="'./src/docs/images/github.png'" />
      </a>
    </div>
  </div>
</template>