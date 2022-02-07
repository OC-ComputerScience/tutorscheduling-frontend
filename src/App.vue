<template>
  <v-app>
    <v-card class="overflow-hidden">
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-app-bar-title class="title">
        <div>Tutoring</div>    
      </v-app-bar-title>

      <template v-slot:extension v-if="this.$store.state.loginUser === null">
        <v-tabs align-with-title>
          <v-tab @click="navLogin">Login</v-tab>
          <v-tab @click="navGroups">Groups</v-tab>
          <v-tab @click="navPeople">People</v-tab>
          <v-tab @click="navTopic">Topics</v-tab>

        </v-tabs>
      </template>

      <template v-slot:extension v-else>
        <v-tabs align-with-title>
          <v-tab @click="navAdvHome">Home</v-tab>
          <v-tab @click="navGroups">Groups</v-tab>
          <v-tab @click="navPeople">People</v-tab>
          <v-tab @click="navTopic">Topics</v-tab>
          <v-tab @click="logout">Logout</v-tab>
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
            navHome() {
              this.$router.push({ name: "home"});
            },
            navLogin() {
              this.$router.push({ name: "login"});
            },
            navGroups() {
              this.$router.push({ name: "groupList"});
            },
            navPeople() {
              this.$router.push({ name: "personList"});
            },
            navTopic() {
              this.$router.push({ name: "topicList"});
            },
            logout () {
              router.push('/login')
            }
  },
};
</script>
