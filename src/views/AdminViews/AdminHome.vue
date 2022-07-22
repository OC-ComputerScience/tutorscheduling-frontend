<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <v-container v-if="!disabled">
      <v-row justify="center">
        <v-col md="4">
          <v-card 
            :to="{ name: 'mainCalendar' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Appointments
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'requestList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Requests
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'personList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View People
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'topicList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Topics
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'roleList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Roles
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'locationList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Locations
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'pendingList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Applications
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card 
            :to="{ name: 'reportList' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
                  View Reports
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <br><br>
      <v-card>
        <v-card-title>
          Upcoming Appointments for {{this.user.selectedGroup}}
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
      <h4>This role for {{group.name}} has been disabled. Please contact the group admin for further questions.</h4>
    </v-container>
    </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
import AppointmentServices from '@/services/appointmentServices.js'
import GroupServices from "@/services/groupServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

  export default {
    props: ["id"],
    name: 'App',
    watch: {
      id: function () {
        console.log(this.id);
      },
    },
    components: {
    },
    data() {
      return {
        search: '',
        user: {},
        group: {},
        appointments: [],
        disabled: false,
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Topic', value: 'topic.name'}],
        message :'Admin'
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getAdminRole();
        if(!this.disabled)
          this.getAppointmentsForGroup();
      })
      .catch ((error)=>{
        this.message = error.response.data.message
      })
    },
    methods: {
      async getGroup(name) {
        await GroupServices.getGroupByName(name)
        .then((response) => {
          this.group = response.data[0];
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      async getAppointmentsForGroup() {
        await AppointmentServices.getUpcomingAppointmentForGroup(this.group.id)
          .then(response => {
            this.appointments = response.data;

            for (let index = 0; index < this.appointments.length; ++index) {
              //format date
              let element = this.appointments[index];
              let formattedDate = element.date.toString().substring(5,10) + "-" + element.date.toString().substring(0,4);
              this.appointments[index].date = formattedDate;
              // format start time
              let modST = element.startTime.toString().substring(0,2) % 12;
              let formattedST = modST + ":" + element.startTime.toString().substring(3,5);
              if (element.startTime.toString().substring(0,2) > 12){
                formattedST = formattedST + " P.M.";}
              else if(modST == 0 && element.startTime.toString().substring(0,2) == "12"){
                formattedST = "12:" + element.startTime.toString().substring(3,5) + " P.M.";
              }
              else if(modST == 0){
                formattedST = "12:" + element.startTime.toString().substring(3,5) + " A.M.";
              }
              else{
                formattedST = formattedST + " A.M.";
              }
              this.appointments[index].startTime = formattedST;
              // format end time
              let modET = element.endTime.toString().substring(0,2) % 12;
              let formattedET = modET + ":" + element.endTime.toString().substring(3,5);
              if (element.endTime.toString().substring(0,2) > 12){
                formattedET = formattedET + " P.M.";}
              else if(modET == 0 && element.endTime.toString().substring(0,2) == "12"){
                formattedET = "12:" + element.endTime.toString().substring(3,5) + " P.M.";
              }
              else if(modET == 0){
                formattedET = "12:" + element.endTime.toString().substring(3,5) + " A.M.";
              }
              else{
                formattedET = formattedET + " A.M.";
              }
              this.appointments[index].endTime = formattedET;
            } 

          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      },
      rowClick: function (item, row) {      
        row.select(true);
        //this.$router.push({ name: 'appointmentView', params: { id: item.id } });
      },
      async getAdminRole() {
        await PersonRoleServices.getPersonRole(this.id)
        .then((response) => {
          if(response.data.status.includes('disabled')){
            this.disabled = true;
          }
          else
            this.disabled = false; 
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      }
    }
  }
</script>
