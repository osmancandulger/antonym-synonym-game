<template>
  <div class="container">
    <h1>Synonym Game</h1>
    <!-- <label class="label" for="select">Please select a person: </label>
    <select
      v-model="selectedVoice"
      @change="$emit('releaseSelected', selectedVoice)"
      name="select"
      id="select"
    >
      <option v-for="(item, index) in voicesList" :value="item" :key="index">
        {{ item.name + item.lang }}
      </option>
    </select> -->
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({})
export default class OptionHeader extends Vue {
  selectedVoice: Object = {};
  voicesList: any = null;
  async mounted() {
    this.getVoicesList().then(voices => {
      this.voicesList = voices;
    });
  }
  releaseSelected() {
    return this.selectedVoice;
  }

  async getVoicesList() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(window.speechSynthesis.getVoices());
      }, 150);
    });
  }
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
