
<template>
  <div>
    <v-container>
        <v-toolbar>
            <v-toolbar-title>Reports</v-toolbar-title>
        </v-toolbar>
        <br><br>
        <h4>Filter the table below and then download the csv file.</h4>
        <br><br>
        <v-card>
            <v-card-title>
                Appointments for {{this.user.selectedGroup}} Report
                <v-spacer></v-spacer>
                <vue-json-to-csv
                    :json-data="appointments"
                    :labels="labels"
                    :csv-title="fileName"
                >
                    <v-btn
                        color="success"
                        class="mr-4"
                    >
                        Download CSV
                    </v-btn>
                </vue-json-to-csv>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="appointments"
                :items-per-page="50"
            ></v-data-table>
        </v-card>
    </v-container>
  </div>
</template>

<script>
import VueJsonToCsv from 'vue-json-to-csv'
import Utils from '@/config/utils.js'
import AppointmentServices from '@/services/appointmentServices.js'
import GroupServices from "@/services/groupServices.js";

  export default {
    name: 'App',
    components: {
        VueJsonToCsv
    },
    data() {
      return {
        search: '',
        group: {},
        user: {},
        fileName: '',
        today: '',
        appointments: [],
        labels: { date: { title: 'Date' },
                  startTime: { title: 'Start' },
                  endTime: { title: 'End' },
                  type: { title: 'Type' },
                  status: { title: 'Status' },
                  `topic.name`: { title: 'Pre Session Notes' },
                  preSessionInfo: { title: 'Pre Session Notes' },
                  tutorFeedback: { title: 'Tutor Feedback' },
                  studentFeedback: { title: 'Student Feedback' }},
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Topic', value: 'topic.name'}]
      }
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getAppointmentsForGroup();
        var date = new Date();
        this.today = String(date.getMonth() + 1).padStart(2, '0') + '-'
            + String(date.getDate()).padStart(2, '0') + '-' 
            + date.getFullYear();
        this.fileName = this.user.selectedGroup + " Report for " + this.today;
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
      async getAppointmentsForGroup() {
        await AppointmentServices.getAppointmentForGroup(this.group.id)
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
      addRole() {
        this.$router.push({ name: 'roleAdd'});
      },
      cancel() {
        this.$router.go(-1);
      }
    }
  }
</script>
