<template>
  <div class="loading" v-if="isReady === false"><h1>Loading..</h1></div>
  <div class="container" v-else>
    <div class="info-header">
      <div class="score-section">
        Score: <span>{{ score }}</span>
      </div>
      <div class="time-section">
        <span
          >Remaning Time:
          <span class="count-text">00:0{{ countDown }}</span></span
        >
      </div>
    </div>
    <div class="interactive-section">
      <div class="text-wrapper">
        <h1 class="interactive-text">Word:{{ questionWord }}</h1>
        <h3 class="interactive-text">Your Answer: {{ text }}</h3>
      </div>
      <button
        @click.prevent="getRandomWord()"
        :disabled="countDown > 0 && isReady === true"
        class="random-button"
      >
        Get Random Word
      </button>
      <!-- <h6>Synonym:{{ matchedList.synonym }}</h6> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import env from '@/config/env';
export default class Game extends Vue {
  @Prop({ required: true }) private selectedVoice: Object | any;

  synth = window.speechSynthesis;
  voicesList: any = null;
  text = '';
  word = '';
  questionWord = '';
  countDown: any = 10;
  score = 0;
  matchedList: any = [];
  synonymsList: any = [];
  myRecognition: any;
  isReady: any = null;
  isPrepared: Boolean = false;
  //!TODO: Add speed option and rate
  async mounted() {
    this.getVoicesList().then(voices => {
      this.voicesList = voices;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this.myRecognition = new webkitSpeechRecognition();
    this.myRecognition.lang = 'en';
    this.myRecognition.onresult = this.text;
  }
  getRandomWord() {
    this.text = '';
    fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': env.serviceApi,
        'x-rapidapi-key': env.apiKey,
      },
    }).then(response =>
      response
        .json()
        .then(data => {
          this.getSynonym(data.word);
          this.countDown = 10;
        })
        .catch(err => {
          console.error(err);
        }),
    );
  }

  getSynonym(word: string) {
    this.isReady = false;
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
            this.isReady = true;

            this.matchedList = {
              synonym: data.synonyms,
              word: data.word,
            };
            this.resolveProxy();
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
  speakSomeBlaBla(selected: any, text: string) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selected;
    this.synth.speak(utterance);
  }
  speak() {
    this.myRecognition.start();
    this.myRecognition.onresult = this.onResult;
  }
  /**
   * @description Set text by speech
   */
  onResult(event: any) {
    this.text = event.results[0][0].transcript;
    this.setResult();
  }
  setResult() {
    if (this.synonymsList.includes(this.text.toLowerCase())) {
      this.score += 1;
      localStorage.setItem('score', `${this.score}`);
    } else {
      console.error('error');
    }
  }

  resolveProxy() {
    const handler = {};
    if (this.isReady) {
      const proxy = new Proxy(this.matchedList, handler); // Proxy {name: "Proxy", test: true}
      const originalTarget = JSON.parse(JSON.stringify(proxy)); // {name: 'Proxy', test: true}
      this.questionWord = originalTarget.word;
      this.synonymsList = originalTarget.synonym;
      console.log(originalTarget.synonym);
      this.startCountDown();
      return originalTarget;
    }
  }
  startCountDown() {
    let intervalID = setInterval(() => {
      this.countDown -= 1;
      if (this.countDown === 0) {
        this.isPrepared = true;
        clearInterval(intervalID);
      }
    }, 1000);
  }

  @Watch('countDown', { immediate: true, deep: true })
  async onTimeIsUp() {
    if (this.isPrepared && this.countDown == 0) {
      this.speakSomeBlaBla(this.voicesList[41], this.questionWord);
      this.speak();
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  position: relative;
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
    margin: 5px 10px;
    font-weight: 500;

    span {
      font-weight: 600;
    }
  }
  .time-section {
    margin-top: 5px;
    margin-right: 10px;
    font-weight: 500;
    .count-text {
      font-weight: 600;
    }
  }
  .word-container {
    position: relative;
    margin-top: 23%;
  }
  .interactive-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 70%;
    margin-top: 40px;

    .interactive-text + .interactive-text {
      margin-bottom: 30px;
    }
    .text-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      width: 65%;
    }
  }
  .random-button {
    background: azure;
    outline: none;
    border: 2px solid #4e4e4e00;
    width: 150px;
    height: 35px;
    border-radius: 35px;
    box-shadow: 2px 2px 5px rgb(40, 41, 40);
    transition: transform 0.4s ease-in-out;
    &:active {
      transform: scale(0.7);
    }
    &:hover {
      color: rgb(80, 80, 80);
      cursor: pointer;
    }
  }
}
</style>
