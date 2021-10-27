<template>
  <div id="container">
    <div class="component">
      <OptionHeader @releaseSelected="setVoice($event)" />
    </div>
    <div class="component">
      <div></div>
      <Game :selectedVoice="selectedVoice" />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import OptionHeader from './components/OptionHeader.vue';
import Game from './components/Game.vue';
@Options({
  components: {
    OptionHeader,
    Game,
  },
})
export default class App extends Vue {
  selectedVoice: any = null;
  setVoice(event: any) {
    this.selectedVoice = event;
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#container {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.component + .component {
  margin-top: 40px;
}
</style>
