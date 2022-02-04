<template>
  <v-app>
    <v-card class="overflow-hidden">
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-app-bar-title class="title">
        <div>OC Tutoring</div>    
      </v-app-bar-title>

      <template v-slot:extension v-if="this.$store.state.loginUser === null">
        <v-tabs align-with-title>
          <v-tab @click="navLogin">Login</v-tab>
        </v-tabs>
      </template>

    </v-app-bar>
  </v-card>
  <v-main>
      <router-view />
  </v-main>
  </v-app>
</template>

<script>
import router from '@/router'
import Utils from '@/config/utils'

export default {
  name: 'App',

  components: {
  },
  data() {
      return {
      }
  },
  created() {
  },
  methods: {
            navLogin() {
              this.$router.push({ name: "login"});
            },
            logout() {
              Utils.removeItem('user')
              router.push('/login')
            }
  },
};
</script>
