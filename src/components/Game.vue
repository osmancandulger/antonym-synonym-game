<template>
  <div class="container">
    <div class="info-header">
      <div class="score-section">Score:0</div>
      <div class="time-section">00:00</div>
    </div>
    <div class="word-container">WORD COMES HERE</div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
export default class Game extends Vue {
  synth = window.speechSynthesis;
  voicesList: any = null;
  selectedVoice: any = null;
  async mounted() {
    this.getVoicesList().then(voices => {
      this.voicesList = voices;
    });
  }

  async getVoicesList() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(this.synth.getVoices());
      }, 150);
    });
  }
}
</script>
<style lang="scss" scoped>
.container {
  width: 600px;
  height: 350px;
  border: 2px solid aquamarine;
  border-radius: 6px;
  .info-header {
    display: flex;
    position: relative;
    margin-top: 5px;
  }
  .score-section {
    display: flex;
    flex: 1;
  }
  .word-container {
    position: relative;
    margin-top: 23%;
  }
}
</style>
