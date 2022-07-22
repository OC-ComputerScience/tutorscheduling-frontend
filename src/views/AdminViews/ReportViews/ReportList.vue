
<template>
  <div>
    <v-container>
        <v-toolbar>
            <v-toolbar-title>{{message}}</v-toolbar-title>
        </v-toolbar>
        <br><br>
       
        <br><br>
        <v-row>
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
          <v-col md="4">
            <v-select
              v-model="selectedTopic"
              :items="topics"
              item-text="name"
              item-value="id"
              label="Topic"
            >
            </v-select>
          </v-col>
          <v-col md="4">
            <v-select
              v-model="selectedStatus"
              :items="status"
              label="Status"
            >
            </v-select>
          </v-col>
          <!-- <v-col md="4">
            <v-select
              v-model="selectedType"
              :items="types"
              label="Type"
            >
            </v-select>
          </v-col> -->
          <v-col md="4">
            <v-select
              v-model="selectedTutors"
              :items="tutors"
              item-text="fullName"
              item-value="id"
              chips
              multiple
              label="Tutors"
            >
            </v-select>
          </v-col>
          <v-col md="4">
            <v-select
              v-model="selectedStudents"
              :items="students"
              item-text="fullName"
              item-value="id"
              chips
              multiple
              label="Students"
            >
            </v-select>
          </v-col>
        </v-row>
        <v-btn
            color="success"
            class="mr-4"
            @click="filter()"
        >
            Filter
        </v-btn>
        <br><br>
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
    </v-container>
  </div>
</template>

<script>
import VueJsonToCsv from 'vue-json-to-csv'
import Utils from '@/config/utils.js'
import AppointmentServices from '@/services/appointmentServices.js'
import GroupServices from "@/services/groupServices.js";
import PersonServices from "@/services/personServices.js";
import TopicServices from "@/services/topicServices.js";

  export default {
    name: 'App',
    components: {
        VueJsonToCsv
    },
    data() {
      return {
        message : 'Reports - enter the criteria and click Filter then click Download to create CSV file',
        menu: false,
        dates: [],
        group: {},
        user: {},
        topics: [],
        selectedTopic: -1,
        status: ["available", "booked", "cancelled", "pending", "completed"],
        selectedStatus: '',
        tutors: [],
        selectedTutors: [],
        students: [],
        selectedStudents: [],
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
        this.getTopicsForGroup();
        await this.getAppointmentsForGroup()
        .then(async () => {
          var date = new Date();
          this.today = String(date.getMonth() + 1).padStart(2, '0') + '-'
              + String(date.getDate()).padStart(2, '0') + '-' 
              + date.getFullYear();
          this.fileName = this.user.selectedGroup + " Report for " + this.today;
          await this.setSelectedAppointments();
          this.updatePeople();
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
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      async setSelectedAppointments() {
        this.selectedAppointments = this.appointments;
        for(let i = 0; i < this.appointments.length; i++) {
          this.selectedAppointments[i].topicName = this.appointments[i].topic.name;
          this.selectedAppointments[i].locationName = this.appointments[i].location.name;
          this.selectedAppointments[i].locationBuilding = this.appointments[i].location.building;
        }
       
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
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      },
      getTopicsForGroup() {
        TopicServices.getAllForGroup(this.group.id)
        .then(response => {
          // let temp = response.data
          // temp.push({name:"Any", id: -1})
          this.topics = response.data
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
      //Update the lists of tutors and students
      updatePeople() {
        this.tutors = []
        this.students = []
        PersonServices.getAllForGroup(this.group.id)
        .then(response => {
          let people = response.data;
          console.log(people);
          for(let i = 0; i < people.length; i++) {
            people[i].fullName = people[i].fName + " " + people[i].lName;
            if(people[i].personrole[0].role.type.includes("Tutor")) {
              this.tutors.push(people[i]);
            }
            else if (people[i].personrole[0].role.type.includes("Student")) {
              this.students.push(people[i]);
            }
          }

        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
      filter() {
        // filter appointments by date

        if(this.dates.length > 0) {
          this.selectedAppointments = this.selectedAppointments.filter(appointment => new Date(appointment.date) >= new Date(this.dates[0]) && new Date(appointment.date) <= new Date(this.dates[1]));
        }
        if(this.selectedTopic > 0) {
          this.selectedAppointments = this.selectedAppointments.filter(appointment => appointment.topicId === this.selectedTopic);
        }
        if(this.selectedStatus !== '') {
          this.selectedAppointments = this.selectedAppointments.filter(appointment => appointment.status === this.selectedStatus);
        }
        // need to filter by tutors/students
        // if(this.selectedTutors.length > 0) {
        //   this.selectedAppointments = this.selectedAppointments.filter(appointment => appointment.status === this.selectedStatus);
        // }

      }
    }
  }
</script>

