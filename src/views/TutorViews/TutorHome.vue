<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>Tutor</v-toolbar-title>
      </v-toolbar>
      <v-container v-if="approved">
      <v-row>
        <v-col>
          <v-card 
            :to="{ name: 'mainCalendar' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="#196CA2"
          >
            <v-card-title class="justify-center white--text">
                  View Calendar
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card 
            :to="{ name: 'availabilityAdd' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="#63BAC0"
          >
            <v-card-title class="justify-center white--text">
                  Manage Availability
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-card>
        <v-card-title>
          Upcoming Appointments
          <v-spacer></v-spacer>
          <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :search="search"
          :items="appointments"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>
      </v-container>
    <v-container v-else>
      <h4>Pending supervisor's approval...</h4>
    </v-container>
    </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
import PersonRoleServices from "@/services/personRoleServices.js";

  export default {
    props: ["id"],
    name: 'App',
    watch: {
      id: function () {
        console.log(this.id);
        this.getTutorRole();
      },
    },
    components: {
    },
    data() {
      return {
        search: '',
        user: {},
        currentId: 0,
        approved: false,
        appointments: [],
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'EndTime'},
                  {text: 'Topic', value: 'topicId'}]
      };
    },
    created() {
      this.user = Utils.getStore('user');
      console.log(this.id);
      this.getTutorRole();
    },
    methods: {
      rowClick: function (item, row) {      
        row.select(true);
        //this.$router.push({ name: 'appointmentView', params: { id: item.id } });
      },
      async getTutorRole() {
        await PersonRoleServices.getPersonRole(this.id)
        .then((response) => {
          console.log(response);
          if(response.data.status.includes("approved"))
          {
            this.approved = true;
            console.log(this.approved)
          }
          else 
            this.approved = false;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      }
    }
  }
</script>