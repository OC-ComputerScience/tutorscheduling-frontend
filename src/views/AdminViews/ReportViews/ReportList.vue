
<template>
  <div>
    <v-container>
        <v-toolbar>
            <v-toolbar-title>Reports</v-toolbar-title>
        </v-toolbar>
        <br><br>
        <h4>Filter the table below and then download the csv file.</h4>
        <br><br>
        <v-col md="4">
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRangeText"
                label="Date Range"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dates"
              range
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <v-select
            :items="topics"
            item-text="name"
            item-value="id"
            label="Topic"
            @change="this.selectedTopic = topic"
          >
          </v-select>
        </v-col>
        <br><br>
        <v-card>
            <v-card-title>
                Appointments for {{this.user.selectedGroup}} Reporting
                <v-spacer></v-spacer>
                <vue-json-to-csv
                    :json-data="selectedAppointments"
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
        menu: false,
        dates: [],
        group: {},
        user: {},
        topics: [],
        selectedTopic: '',
        fileName: '',
        today: '',
        appointments: [],
        selectedAppointments: [],
        labels: { date: { title: 'Date' },
                  startTime: { title: 'Start' },
                  endTime: { title: 'End' },
                  type: { title: 'Type' },
                  status: { title: 'Status' },
                  topicName: { title: 'Topic' },
                  locationName: { title: 'Location' },
                  locationBuilding: { title: 'Building' },
                  preSessionInfo: { title: 'Pre Session Notes' },
                  tutorFeedback: { title: 'Tutor Feedback' },
                  studentFeedback: { title: 'Student Feedback' },
                  tutorStart: { title: 'Tutor Start' },
                  tutorEnd: { title: 'Tutor End' }},
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Topic', value: 'topic.name'}]
      }
    },
    computed: {
      dateRangeText () {
        return this.dates.join(' ~ ')
      },
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(async () => {
        await this.getAppointmentsForGroup()
        .then(() => {
          var date = new Date();
          this.today = String(date.getMonth() + 1).padStart(2, '0') + '-'
              + String(date.getDate()).padStart(2, '0') + '-' 
              + date.getFullYear();
          this.fileName = this.user.selectedGroup + " Report for " + this.today;
          this.setSelectedAppointments();
        })
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
      setSelectedAppointments() {
        // filter appointments by date
        if(this.dates.length > 0) {
          this.selectedAppointments = this.appointments.filter(appointment => appointment.date > this.dates[0] && appointment.date < this.dates[1]);
        }
        else  // if no dates are picked, it will add all appointments
          this.selectedAppointments = this.appointments;
        for(let i = 0; i < this.appointments.length; i++) {
          this.selectedAppointments[i].topicName = this.appointments[i].topic.name;
          this.selectedAppointments[i].locationName = this.appointments[i].location.name;
          this.selectedAppointments[i].locationBuilding = this.appointments[i].location.building;
        }
        console.log(this.selectedAppointments);
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
