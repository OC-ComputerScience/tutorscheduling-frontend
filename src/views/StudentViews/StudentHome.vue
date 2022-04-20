<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>Student</v-toolbar-title>
      </v-toolbar>
      <v-row>
        <v-col>
          <v-card 
            :to="{ name: 'mainCalendar' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="#EE5044"
          >
            <v-card-title class="justify-center white--text">
                  View Calendar
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card 
            :to="{ name: 'requestAdd' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="#F8C545"
          >
            <v-card-title class="justify-center white--text">
                  Make A Request
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
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
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
import AppointmentServices from '@/services/appointmentServices.js'
import GroupServices from "@/services/groupServices.js";

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
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Topic', value: 'topic.name'}]
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getAppointments();
      })
    },
    methods: {
      async getGroup(name) {
        await GroupServices.getGroupByName(name)
        .then((response) => {
          this.group = response.data[0];
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      },
      async getAppointments() {
        await AppointmentServices.getUpcomingAppointmentForPersonForGroup(this.group.id, this.user.userID)
          .then(response => {
            this.appointments = response.data;
            console.log(response);

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
            console.log("There was an error:", error.response)
          });
      },
      rowClick: function (item, row) {      
        row.select(true);
        //this.$router.push({ name: 'appointmentView', params: { id: item.id } });
      }
    }
  }
</script>