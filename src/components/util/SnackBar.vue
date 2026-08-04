<template>
  <div>
    <v-snackbar
      v-if="snackbar"
      v-model="snackbar.visible"
      :timeout="snackbar.timeout"
      :multi-line="snackbar.multiline === true"
      :color="snackbar.color"
      style="position: fixed;"
    >
      <v-layout align-center>
        <v-icon class="pr-4" color="white" large>
          {{ snackbar.icon }}
        </v-icon>
        <v-layout column>
          <div class="white--text" v-html="snackbar.text"></div>
        </v-layout>
        <v-btn fab color="white" text @click="closeAlert">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-layout>
    </v-snackbar>
  </div>
</template>
<script>

  export default {
    data() {
      return {
        snackbar: null,
      }
    },
    mounted() {
      this.snackbar = this.$store.state.snackbar
    },
    methods: {
      closeAlert() {
        this.$store.commit('closeAlert')
      },
    },
  }
</script>