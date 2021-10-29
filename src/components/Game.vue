<template>
  <div class="container">
    <div class="loading" v-if="isReady === false"><h1>Loading..</h1></div>
    <div class="content-wrapper" v-else>
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
          <h3 class="interactive-text" ref="answerText">
            Your Answer: {{ text }}
          </h3>
        </div>
        <button
          @click.prevent="getRandomWord()"
          :disabled="countDown > 0 && isReady === true"
          class="random-button"
        >
          Get Random Word
        </button>
        <button @click.prevent="getRandomWord()" class="random-button">
          Next Please
        </button>
        <!-- <h6>Synonym:{{ matchedList.synonym }}</h6> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
export default class Game extends Vue {
  @Prop({ required: true }) private selectedVoice: Object | any;

  synth = window.speechSynthesis;
  voicesList: any = null;
  text = '';
  questionWord = '';
  countDown: any = 10;
  intervalId: any = 0;
  score = 0;
  matchedList: any = [];
  synonymsList: any = [];
  myRecognition: any;
  isReady: any = null;
  isPrepared: Boolean = false;
  //!TODO: Add speed option and rate

  /**
   * @description Mounted lifecyle hook
   */
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

  /**
   * @description Get a random word from WordsAPI
   */
  getRandomWord() {
    clearInterval(this.intervalId);
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

  /**
   * @description Get request for Synonym of providen random word
   * @param {word}:String
   */
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

  /**
   * @description Get voice list from speechSynthesis
   */
  async getVoicesList() {
    return new Promise(resolve => {
      setTimeout(() => {
        return resolve(this.synth.getVoices());
      }, 150);
    });
  }

  /**
   * @description Say providen word from selected voice
   * @param {selected}:any Selected voice
   * @param {text}:string text script to say it
   */
  speakSomeBlaBla(selected: any, text: string) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selected;
    this.synth.speak(utterance);
  }

  /**
   * @description Start the recognition to get speech result
   */
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
  /**
   * @description Set score of answer by voice input
   */
  setResult() {
    let string = this.text.toLowerCase().replace(/ /g, '');
    let formattedItem: string[] = [];
    this.synonymsList.forEach((item: any) => {
      formattedItem.push(item.toLowerCase().replace(/ /g, ''));
    });
    if (formattedItem.includes(string)) {
      this.score += 1;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.$refs.answerText.style.color = 'green';
      localStorage.setItem('score', `${this.score}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.$refs.answerText.style.color = 'red';
    }
  }

  /**
   * @description Resolve Word List as word and synonym
   * @return {originalTarget}:Object
   */

  resolveProxy(): any {
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

  /**
   * @description Start Count down after all related arguments to play has been ready
   */
  startCountDown() {
    let intervalID = setInterval(() => {
      this.countDown -= 1;
      if (this.countDown === 0) {
        this.isPrepared = true;
        clearInterval(intervalID);
      }
      this.intervalId = intervalID;
    }, 1000);
  }
  /**
   * @description Say related text and activate speech recognition feature to user
   */
  @Watch('countDown', { immediate: true, deep: true })
  async onTimeIsUp() {
    if (this.isPrepared && this.countDown == 0) {
      this.speakSomeBlaBla(this.voicesList[0], this.questionWord);
      setTimeout(() => {
        this.speak();
      }, 750);
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
    border: 2px solid whitesmoke;
    width: 150px;
    height: 35px;
    border-radius: 35px;
    transition: transform 0.4s ease-in-out;
    margin-top: 15px;
    &:active {
      transform: scale(0.7);
    }
    &:hover {
      color: rgb(80, 80, 80);
      cursor: pointer;
    }
    & + .random-button {
      margin-top: 10px;
    }
  }
  .loading {
    margin-top: 25%;
  }
}
</style>
