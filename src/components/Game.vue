<template>
  <div class="container">
    <input type="text" v-model="text" />
    <button @click.prevent="this.speakSomeBlaBla(selectedVoice)">Say</button>
    <button @click.prevent="this.speak(selectedVoice)">Speak It</button>
    <button @click.prevent="getRandomWord()">Get Random Word</button>
    <h3>Result: {{ text }}</h3>
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
import env from '@/config/env';
export default class Game extends Vue {
  @Prop({ required: true }) private selectedVoice: Object | any;

  synth = window.speechSynthesis;
  voicesList: any = null;
  text = '';
  word = '';
  matchedList: any = [];
  myRecognition: any;
  //!TODO: Add speed option and rate
  async mounted() {
    console.log(env);
    this.getVoicesList().then(voices => {
      this.voicesList = voices;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this.myRecognition = new webkitSpeechRecognition();
    this.myRecognition.lang = 'tr';
    this.myRecognition.onresult = this.text;
  }
  getRandomWord() {
    fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': env.serviceApi,
        'x-rapidapi-key': env.apiKey,
      },
    }).then(response =>
      response
        .json()
        .then(data => this.getSynonym(data.word))
        .catch(err => {
          console.error(err);
        }),
    );
  }

  getSynonym(word: string) {
    fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': env.serviceApi,
        'x-rapidapi-key': env.apiKey,
      },
    }).then(response =>
      response
        .json()
        .then(data => {
          if (data.synonyms.length > 0) {
            this.matchedList = { synonym: data.synonyms, word: data.word };
            console.log(this.matchedList);
          } else {
            this.getRandomWord();
          }
        })
        .catch(err => {
          console.error(err);
        }),
    );
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
  speak(event: any) {
    this.myRecognition.start();
    this.myRecognition.onresult = this.onResult;
  }

  onResult(event: any) {
    this.text = event.results[0][0].transcript;
  }

  // @Watch('text', { immediate: true, deep: true })
  // onSelectedChanged() {}
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
