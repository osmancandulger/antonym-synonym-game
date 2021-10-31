<template>
  <div class="container">
    <div class="loading" v-if="isReady === false"><h1>Loading..</h1></div>
    <div class="content-wrapper" v-else>
      <div class="info-header">
        <div class="score-section">
          <div>
            Score: <span>{{ score }}</span>
          </div>
          <div>
            Failed: <span>{{ failedScore }}</span>
          </div>
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
          <p v-if="matchedList.synonym && !isAnswerCorrect && this.text">
            Synonyms:{{ matchedList.synonym.slice(0, 5).join() }}
          </p>
        </div>
        <div class="button-wrapper">
          <button
            v-if="countDown > 0 && isReady === null && !inProgress"
            @click.prevent="getRandomWord()"
            class="random-button"
          >
            Get Random Word
          </button>
          <div v-else class="mic-wrapper">
            <img
              v-if="!inProgress"
              src="../assets/microphone.png"
              alt="microphone"
              class="mic-icon"
              @click="
                !text ? speak() : '';
                !text ? (inProgress = true) : '';
              "
            />
            <div v-else class="loading-spinner"></div>
          </div>
          <button @click.prevent="getRandomWord()" class="random-button">
            Next Please
          </button>
        </div>
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
  countDown: any = 5;
  intervalId: any = 0;
  score = 0;
  failedScore = 0;
  matchedList: any = [];
  synonymsList: any = [];
  myRecognition: any;
  isReady: any = null;
  isPrepared: Boolean = false;
  isAnswerCorrect: Boolean = false;
  inProgress: Boolean = false;
  //!TODO: Add speed option and rate

  /**
   * @description Mounted lifecyle hook
   */
  async mounted() {
    this.getVoicesList().then(voices => {
      this.voicesList = voices;
    });
    if (localStorage.getItem('score'))
      this.score = Number(localStorage.getItem('score'));

    if (localStorage.getItem('failedScore'))
      this.failedScore = Number(localStorage.getItem('failedScore'));
    this.setRecognition();
  }
  /**
   * @description Set SpeechRecognition values
   */
  setRecognition() {
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
    this.inProgress = false;
    fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': process.env.VUE_APP_SERVICE_API,
        'x-rapidapi-key': process.env.VUE_APP_API_KEY,
      },
    }).then(response =>
      response
        .json()
        .then(data => {
          this.getSynonym(data.word);
          this.countDown = 5;
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
        'x-rapidapi-host': process.env.VUE_APP_SERVICE_API,
        'x-rapidapi-key': process.env.VUE_APP_API_KEY,
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
    console.log(this.matchedList.synonym);

    this.myRecognition.start();
    this.myRecognition.onresult = this.onResult;
    this.myRecognition.onspeechend = this.onSpeechEnd;
  }
  /**
   * @desction Toggle inProgress when speech ended
   */
  onSpeechEnd() {
    this.inProgress = false;
  }
  /**
   * @description Set text by speech
   */
  onResult(event: any) {
    this.text = event.results[0][0].transcript;
    if (this.text) {
      this.inProgress = false;
    }
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
      this.isAnswerCorrect = true;
      localStorage.setItem('score', `${this.score}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.$refs.answerText.style.color = 'red';
      this.failedScore += 1;
      this.isAnswerCorrect = false;
      localStorage.setItem('failedScore', `${this.failedScore}`);
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
  height: 380px;
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
    div + div {
      margin-left: 5px;
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
  .button-wrapper {
    display: flex;
    position: absolute;
    flex-direction: column;
    align-items: center;
    bottom: 10px;
    .random-button {
      background: azure;
      outline: none;
      border: 2px solid whitesmoke;
      width: 150px;
      height: 35px;
      border-radius: 35px;
      transition: transform 0.4s ease-in-out;
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
    .mic-icon {
      position: absolute;
      bottom: 50px;
      transition: transform 0.3s ease-in;
      cursor: pointer;
      &:hover {
        transform: scale(1.1);
      }
      &:active {
        transform: scale(0.85);
      }
    }
  }
  .loading {
    margin-top: 25%;
  }
  .mic-icon {
    width: 35px;
    height: 35px;
  }
  .mic-wrapper {
    display: flex;
    justify-content: center;
    width: max-content;
    .loading-spinner {
      position: relative;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 10px solid #f3f3f3;
      border-top: 10px solid rgb(255, 209, 209);
      animation: spin 0.4s linear infinite;
      bottom: 15px;
    }
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
