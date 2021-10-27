<template>
  <div class="container">
    <input type="text" v-model="text" />
    <button @click.prevent="this.speakSomeBlaBla(selectedVoice)"></button>
    <div class="info-header">
      <h1 v-if="selectedVoice">
        {{ selectedVoice.name + selectedVoice.lang }}
      </h1>
      <div class="score-section">Score:0</div>
      <div class="time-section">00:00</div>
    </div>
    <div class="word-container">WORD COMES HERE</div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Prop, PropSync, Watch } from 'vue-property-decorator';
export default class Game extends Vue {
  @Prop({ required: true }) private selectedVoice: Object | any;

  synth = window.speechSynthesis;
  voicesList: any = null;
  text = '';

  async mounted() {
    this.getVoicesList().then(voices => {
      this.voicesList = voices;
    });
  }

  async getVoicesList() {
    return new Promise(resolve => {
      setTimeout(() => {
        return resolve(this.synth.getVoices());
      }, 150);
    });
  }
  speakSomeBlaBla(selected: any) {
    let utterance = new SpeechSynthesisUtterance(this.text);
    utterance.voice = selected;

    this.synth.speak(utterance);
  }

  // @Watch('selectedVoice', { immediate: true, deep: true })
  // onSelectedChanged() {
  //   this.speakSomeBlaBla(this.selectedVoice);
  // }
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
