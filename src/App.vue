<template>
  <v-app>
    <MenuBar/>
    <!-- <v-card class="overflow-hidden">
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

      <template v-slot:extension v-else-if="this.admin">
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

      <template v-slot:extension v-else-if="this.student">
        <v-tabs align-with-title>
          <v-tab @click="navCalendar">Calendar</v-tab>
          <v-tab @click="logout">Logout</v-tab>
        </v-tabs>
      </template>

      <template v-slot:extension v-else-if="this.tutor">
        <v-tabs align-with-title>
          <v-tab @click="navAvailability">Availability</v-tab>
          <v-tab @click="navCalendar">Calendar</v-tab>
          <v-tab @click="logout">Logout</v-tab>
        </v-tabs>
      </template>

    </v-app-bar>
  </v-card> -->
  <v-main>
      <router-view />
  </v-main>
  </v-app>
</template>

<script>
import Utils from '@/config/utils'
import MenuBar from '@/components/MenuBar.vue'
import PersonServices from '@/services/personServices.js'
import RoleServices from '@/services/roleServices.js'

export default {
  name: 'App',
  components: {
    MenuBar
  },
  data() {
      return {
        person: {},
        roles: [],
        admin: false,
        student: false,
        tutor: false
      }
  },
  created() {

  },
  async mounted() {
    await this.getPerson()
    .then(() => {
      this.getPersonRoles();
    })
    .catch(error => {
      console.log("There was an error:", error.response)
    });
  },
  methods: {
    async getPerson() {
      if (this.$store.state.loginUser !== null) {
        await PersonServices.getPerson(this.$store.state.loginUser.userID)
          .then(response => {
            this.person = response.data;
            console.log(this.person);
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
      }
    },
    async getPersonRoles() {
      await RoleServices.getRoleForPerson(this.person.id)
      .then((response) => {
        console.log(response.data);
        for (let i = 0; i < response.data.length; i++) {
          let role = response.data[i];
          console.log(role);
          this.roles.push(role);
          // sets what the nav bar will show
          if(role.type.toLowerCase() === "admin")
            this.admin = true;
          else if(role.type.toLowerCase() === "student")
            this.student = true;
          else if(role.type.toLowerCase() === "tutor")
            this.tutor = true;
        }
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
      console.log(this.roles)
    },
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
