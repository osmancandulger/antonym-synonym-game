<template>
  <div class="container">
    <h1>Antonym and Synonym Game</h1>
    <label class="label" for="select">Please select a person: </label>
    <select name="select" id="select" v-model="selectedOption">
      <option v-for="(item, index) in test" :key="index">{{ item }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({})
export default class OptionHeader extends Vue {
  selectedOption: Object = {};
  test: String[] = ['1', '2', '3'];
}
</script>

<style scoped lang="scss">
.label {
  font-weight: 500;
  font-size: 1em;
}
#select {
  width: 90px;
  border: 2px solid rgb(159, 197, 255);
  border-radius: 6px;
  outline: none;
  transition: all 0.4s ease;
}
#select:hover {
  transform: scale(1.06);
}
</style>
