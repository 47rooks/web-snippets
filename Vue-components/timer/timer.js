/*
 * timer.js v0.1
 * Copyright 47rooks.com 2017
 * Release under MIT License.
 *
 * Timer requires Vue.js to be loaded before it.
 */
Vue.component('f7-timer', {
  template: '<label>{{ displayString }}</label>',
  data: function() {
    return {
      milliseconds: 0,
      intervalTimer: null
    }
  },
  computed: {
    displayString: function() {
        seconds = Math.floor(this.milliseconds / 1000);
        minutes = Math.floor(this.milliseconds  / 60000);
        hours = Math.floor(this.milliseconds / 3600000);
        return ('0' + hours).slice(-2) + ":" +
               ('0' + minutes % 60).slice(-2) + ":" +
               ('0' + seconds % 60).slice(-2);
      }
  },
  methods: {
    start: function() {
      var self = this;   // required for the timer function to see the
                         //  data.milliseconds variable

      if (this.intervalTimer) {
        return;
      }
      this.intervalTimer = setInterval(function() {
                                         self.$data.milliseconds += 1000
                                       },
                                       1000);
    },
    stop: function() {
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
      }
    },
    reset: function() {
      this.stop();
      this.milliseconds = 0;
    }
  }
});
