<template>
    <div class="v-video" ref="video" :style="{cursor:cursor}">
        <video class="v-video-main"  ref="player" :src='src' :preload="preload" :autoplay="autoplay"></video>
        <div v-if="isShowControlbar" class="v-video-controlbar">
            <div class="v-video-controlbar-item v-video-controlbar-restart" v-on:click="restart"></div>
            <div v-if="status !== 'play'" class="v-video-controlbar-item v-video-controlbar-start" v-on:click="play"></div>
            <div v-if="status === 'play'" class="v-video-controlbar-item v-video-controlbar-pause" v-on:click="pause"></div>
            <div class="v-video-controlbar-item v-video-controlbar-stop" v-on:click="reset"></div>
            <div class="v-video-controlbar-time"><span>{{displayCurrentTime}}</span><span>/</span><span>{{displayDuration}}</span></div>
            <div class="v-video-controlbar-progress">
              <div class="v-video-controlbar-progress-slot"></div>
              <div class="v-video-controlbar-progress-buffer" :style="{width:displayBuffered}"></div>
              <div class="v-video-controlbar-progress-active" :style="{width:currentProgress}"></div>
              <div class="v-video-controlbar-progress-dot" :style="{left:currentProgress}"></div>
            </div>
            <div v-if="!muted" class="v-video-controlbar-item v-video-controlbar-volumn" v-on:click="mute"></div>
            <div v-if="muted" class="v-video-controlbar-item v-video-controlbar-muted" v-on:click="mute"></div>
            <div class="v-video-controlbar-setvolumn" v-on:click="setVolume">
              <div class="v-video-controlbar-setvolumn-slot"></div>
              <div class="v-video-controlbar-setvolumn-active" :style="{width:currentVolume}"></div>
              <div v-on:mousedown="startSetVolune" class="v-video-controlbar-setvolumn-dot" :style="{left:currentVolume}"></div>
            </div>
            <div class="v-video-controlbar-item v-video-controlbar-full" v-on:click="fullscreen"></div>
        </div>
        <div v-if="status === 'pause'" class="v-video-pause-ad">
          <slot name="v-video-pause">
            <a v-if="pauseAd" :href="pauserAd.url" target="_blank"><img class="v-video-pause-ad-img" :src="pauseAd.image" /></a>
          </slot>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    src: String,
    autoplay: {
      type: Boolean,
      default: true
    },
    preload: {
      type: Boolean,
      default: true
    },
    pauseAd: String
  },
  data() {
    return {
      currentTime: NaN,
      duration: NaN,
      buffered: NaN,
      status: this.autoplay ? "play" : "stop",
      volume: 0,
      muted: false,
      isFullScreen: false,
      isShowControlbar: true,
      timeoutIndex: null,
      cursor: "default",
      startVolumeX: 0,
      isSetVolume: false
    };
  },
  methods: {
    play() {
      if (this.$refs.player.paused) {
        this.$refs.player.play();
        this.status = "play";
      }
    },
    pause() {
      if (!this.$refs.player.paused) {
        this.$refs.player.pause();
        this.status = "pause";
      }
    },
    timeupdate() {
      this.currentTime = this.$refs.player.currentTime;
      this.duration = this.$refs.player.duration;
    },
    progress() {
      this.buffered = this.$refs.player.buffered;
      this.duration = this.$refs.player.duration;
    },
    displayTime(time) {
      if (Number.isNaN(time)) {
        return "--:--:--";
      } else {
        let h = parseInt(time / 60 / 60);
        let m = parseInt((time - h * 60 * 60) / 60);
        let s = parseInt(time - m * 60);
        if (h > 100) {
          h = 99;
        }
        return `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      }
    },
    fullscreen() {
      if (!this.isFullScreen) {
        let elem = this.$refs.video;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
        document.addEventListener("mouseover", this.hideControlbar.bind(this));
        this.isFullScreen = true;
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.isFullScreen = false;
      }
    },
    hideControlbar() {
      if (this.timeoutIndex !== null) {
        clearTimeout(this.timeoutIndex);
        this.isShowControlbar = true;
        this.cursor = "default";
      }
      this.timeoutIndex = window.setTimeout(() => {
        this.isShowControlbar = false;
        this.cursor = "none";
      }, 10000);
    },
    mute() {
      this.$refs.player.muted = !this.$refs.player.muted;
      this.muted = this.$refs.player.muted;
      if (this.muted) {
        this.volume = 0;
      } else {
        this.volume = this.$refs.player.volume;
      }
    },
    reset() {
      this.$refs.player.autoplay = false;
      this.$refs.player.load();
    },
    restart() {
      this.$refs.player.autoplay = true;
      this.$refs.player.load();
    },
    setVolume(e) {
      console.log(e.offsetX);
      this.volume = e.offsetX / 100;
      console.log(this.currentVolume);
      this.$refs.player.volume = this.volume;
    },
    startSetVolune(e) {
      this.startVolumeX = e.screenX;
      this.isSetVolume = true;
      document.addEventListener("mouseup", this.endSetVolume.bind(this));
      document.addEventListener("mouseover", this.moveSetVolume.bind(this));
    },
    moveSetVolume(e) {
      if (this.isSetVolume) {
        let moveX = e.screenX - this.startVolumeX;
        let newVolume = this.volume + moveX / 100;
        if (newVolume >= 0 && newVolume <= 1) {
          this.volume = newVolume;
          this.$refs.player.volume = this.volume;
        }
        this.startVolumeX = e.screenX;
      }
    },
    endSetVolume(e) {
      this.isSetVolume = false;
    }
  },
  computed: {
    currentProgress() {
      if (!Number.isNaN(this.duration)) {
        return `${this.currentTime / this.duration * 100}%`;
      }
    },
    displayDuration() {
      return this.displayTime(this.duration);
    },
    displayCurrentTime() {
      return this.displayTime(this.currentTime);
    },
    displayBuffered() {
      if (this.buffered && this.buffered.length > 0) {
        let loadime = this.buffered.end(this.buffered.length - 1);
        return `${loadime / this.duration * 100}%`;
      }
    },
    currentVolume() {
      if (!Number.isNaN(this.volume)) {
        return `${parseInt(this.volume / 1 * 100)}%`;
      }
    }
  },
  mounted() {
    this.$refs.player.addEventListener(
      "timeupdate",
      this.timeupdate.bind(this)
    );
    this.$refs.player.addEventListener("progress", this.progress.bind(this));
    this.duration = this.$refs.player.duration;
    this.volume = this.$refs.player.volume;
  }
};
</script>

<style>
.v-video {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  position: relative;
  background: black;
}

.v-video-main {
  display: block;
  height: 100%;
  width: 100%;
}

.v-video-controlbar {
  width: 100%;
  height: 37px;
  background: #191919;
  bottom: 0px;
  left: 0px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  line-height: 37px;
  position: absolute;
}

.v-video-controlbar-item {
  display: inline-block;
  height: 16px;
  width: 16px;
  border: none !important;
  background-size: cover;
  background-color: transparent;
  opacity: 0.5;
  line-height: 37px;
  margin: 0px 9px;
  flex-grow: 0;
  flex-shrink: 0;
  cursor: pointer;
}

.v-video-controlbar-item:hover {
  opacity: 1;
}

.v-video-controlbar-restart {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Eloop%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M4%2010h20v6l8-8-8-8v6h-24v12h4zM28%2022h-20v-6l-8%208%208%208v-6h24v-12h-4z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-start {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Eplay3%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M6%204l20%2012-20%2012z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-stop {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Estop2%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M4%204h24v24h-24z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-volumn {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Evolume-medium%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M22.485%2025.985c-0.384%200-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535%200-2.121%204.094-4.094%204.094-10.755%200-14.849-0.586-0.586-0.586-1.536%200-2.121s1.536-0.586%202.121%200c2.55%202.55%203.954%205.94%203.954%209.546s-1.404%206.996-3.954%209.546c-0.293%200.293-0.677%200.439-1.061%200.439v0zM17.157%2023.157c-0.384%200-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535%200-2.121%202.534-2.534%202.534-6.658%200-9.192-0.586-0.586-0.586-1.536%200-2.121s1.535-0.586%202.121%200c3.704%203.704%203.704%209.731%200%2013.435-0.293%200.293-0.677%200.439-1.061%200.439z%22%3E%3C%2Fpath%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M13%2030c-0.26%200-0.516-0.102-0.707-0.293l-7.707-7.707h-3.586c-0.552%200-1-0.448-1-1v-10c0-0.552%200.448-1%201-1h3.586l7.707-7.707c0.286-0.286%200.716-0.372%201.090-0.217s0.617%200.519%200.617%200.924v26c0%200.404-0.244%200.769-0.617%200.924-0.124%200.051-0.254%200.076-0.383%200.076z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-full {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Eenlarge%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M32%200h-13l5%205-6%206%203%203%206-6%205%205z%22%3E%3C%2Fpath%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M32%2032v-13l-5%205-6-6-3%203%206%206-5%205z%22%3E%3C%2Fpath%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M0%2032h13l-5-5%206-6-3-3-6%206-5-5z%22%3E%3C%2Fpath%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M0%200v13l5-5%206%206%203-3-6-6%205-5z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-pause {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Epause2%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M4%204h10v24h-10zM18%204h10v24h-10z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-muted {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%0A%3Ctitle%3Evolume-mute2%3C%2Ftitle%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M30%2019.348v2.652h-2.652l-3.348-3.348-3.348%203.348h-2.652v-2.652l3.348-3.348-3.348-3.348v-2.652h2.652l3.348%203.348%203.348-3.348h2.652v2.652l-3.348%203.348%203.348%203.348z%22%3E%3C%2Fpath%3E%0A%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M13%2030c-0.26%200-0.516-0.102-0.707-0.293l-7.707-7.707h-3.586c-0.552%200-1-0.448-1-1v-10c0-0.552%200.448-1%201-1h3.586l7.707-7.707c0.286-0.286%200.716-0.372%201.090-0.217s0.617%200.519%200.617%200.924v26c0%200.404-0.244%200.769-0.617%200.924-0.124%200.051-0.254%200.076-0.383%200.076z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A");
}

.v-video-controlbar-time {
  width: 105px;
  flex-grow: 0;
  flex-shrink: 0;
  color: #ffffff;
  font-size: 12px;
  margin: 0px 9px;
}

.v-video-controlbar-time span {
  margin: 0px 2px;
}

.v-video-controlbar-setvolumn {
  width: 80px;
  flex-grow: 0;
  flex-shrink: 0;
  margin: 0px 18px 0px 9px;
  width: 100px;
  position: relative;
  top: -2px;
  cursor: pointer;
}

.v-video-controlbar-setvolumn-slot {
  height: 4px;
  background: #bebebe;
  width: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
}

.v-video-controlbar-setvolumn-active {
  height: 4px;
  background: #60a917;
  width: 0%;
  position: absolute;
  top: 0px;
  left: 0px;
}

.v-video-controlbar-setvolumn-dot {
  width: 16px;
  height: 16px;
  background: #ce352c;
  border-radius: 50%;
  position: absolute;
  top: -6px;
  left: -8px;
  cursor: pointer;
}

.v-video-controlbar-progress {
  flex-grow: 1;
  flex-shrink: 1;
  width: 100px;
  position: relative;
  top: -2px;
  margin: 0px 14px 0px 9px;
}

.v-video-controlbar-progress-slot {
  height: 4px;
  background: #bebebe;
  width: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
}

.v-video-controlbar-progress-buffer {
  height: 4px;
  background: #ffffff;
  width: 0%;
  position: absolute;
  top: 0px;
  left: 0px;
}

.v-video-controlbar-progress-active {
  height: 4px;
  background: #1ba1e2;
  width: 0%;
  position: absolute;
  top: 0px;
  left: 0px;
}

.v-video-controlbar-progress-dot {
  width: 16px;
  height: 16px;
  background: #ce352c;
  border-radius: 50%;
  position: absolute;
  top: -6px;
  left: -8px;
  cursor: pointer;
}
.v-video-pause-ad {
  width: 100%;
  height: calc(100% - 37px);
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-video-pause-ad-img {
  width: 40%;
  height: 40%;
  background: #ffffff;
  display: block;
}
</style>