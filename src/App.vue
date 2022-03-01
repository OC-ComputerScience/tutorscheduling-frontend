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
          <v-tab @click="logout">Logout</v-tab>
        </v-tabs>
      </template>

      <template v-slot:extension v-else>
        <v-tabs align-with-title>
          <v-tab @click="navGroups">Groups</v-tab>
          <v-tab @click="navPeople">People</v-tab>
          <v-tab @click="navTopic">Topics</v-tab>
          <v-tab @click="navLocation">Locations</v-tab>
          <v-tab @click="navRole">Roles</v-tab>
          <v-tab @click="navAvailability">Availability</v-tab>
          <v-tab @click="navCalendar">Calendar</v-tab>
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
import Utils from '@/config/utils'

export default {
  name: 'App',

  components: {
  },
  data() {
      return {
        // person: {},
        // roles: [],
        // admin: false
      }
  },
  created() {
    //this.getPerson();
  },
  methods: {
    // getPerson() {
    //   if (this.$store.state.loginUser !== null) {
    //     PersonServices.getPerson(this.$store.state.loginUser.userID)
    //       .then(response => {
    //         this.person = response.data;
    //         this.getPersonRoles();
    //       })
    //       .catch(error => {
    //         console.log("There was an error:", error.response)
    //       });
    //   }
    // },
    // getPersonRoles() {
    //   PersonRoleServices.getAllForPerson(this.person.id)
    //     .then((response) => {
    //       // this only sets the number of roles the person has
    //       this.roles = response.data;
    //       this.findAdminRole();
    //     })
    //     .catch((error) => {
    //       console.log("There was an error:", error.response);
    //     });
    // },
    // findAdminRole() {
    //   this.roles.forEach(role => {
    //     if(role.type.toLowerCase() === "admin")
    //       this.admin = true;
    //     console.log(this.admin);
    //   })
    // },
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
    navLocation() {
      this.$router.push({ name: "locationList"});
    },
    navRole() {
      this.$router.push({ name: "roleList"});
    },
    navAvailability() {
      this.$router.push({ name: "availabilityAdd"});
    },
    navCalendar() {
      this.$router.push({ name: "mainCalendar"});
    },
    logout () {
      Utils.removeItem('user')
      this.$router.push({ name: "login"})
    }
  },
};
</script>
