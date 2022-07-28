<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>

      <v-dialog
        v-model="dialog"
        persistent
        max-width="800"
      >
        <v-card tile>
          <v-card-title>
            <span class="text-h5">Hello, {{this.user.fName}}!</span>
          </v-card-title>
          <v-card-text>
            Tutor Scheduling updates your Google calendar with appointments. You will now be asked to approve that access via Google.
            You will be presented with a Google login and a Tutor Scheduling access request.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              text
              @click="dialog = false; doAuthorization()"
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
          Upcoming Appointments for {{this.user.selectedGroup}} as a tutor
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
        ></v-data-table>
      </v-card>
      <br>
      <v-card>
        <v-card-title>
          Provide Appointment Feedback for {{this.user.selectedGroup}}
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
          :headers="headerFeedback"
          :search="search"
          :items="appointmentsneedingfeedback"
          :items-per-page="50"
          @click:row="provideFeedback"
        ></v-data-table>
      </v-card>
      </v-container>
    <v-container v-else-if="!disabled">
      <h4>Pending supervisor's approval...</h4>
    </v-container>
    <v-container v-else>
      <h4>This role for {{group.name}} has been disabled. Please contact the group admin for further questions.</h4>
    </v-container>
    </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
// import AuthServices from '@/services/authServices'
import PersonRoleServices from "@/services/personRoleServices.js";
import AppointmentServices from '@/services/appointmentServices.js'
import GroupServices from "@/services/groupServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import LocationServices from "@/services/locationServices.js";

  export default {
    props: ["id"],
    name: 'App',
    watch: {
      id: function () {
        this.getTutorRole();
      },
    },
    components: {
    },
    data() {
      return {
        search: '',
        user: {},
        group: {},
        dialog: false,
        currentId: 0,
        approved: false,
        disabled: false,
        appointments: [],
        appointmentsneedingfeedback: [],
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Location', value: 'location'},
                  {text: 'Type', value: 'type'},
                  {text: 'Status', value: 'status'},
                  {text: 'Student(s)', value: 'student'}],
        headerFeedback: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Type', value: 'type'},],
        message : 'Tutor'
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      if(this.id !== 0) {
        this.getTutorRole();
      }
      console.log("selected group = " + this.user.selectedGroup)
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(async () => {
        await this.getAppointments();
        this.getAppointmentsNeedingFeedback();
      })
      .catch ((error) => {
        this.message = error.response.data.message
      })
    },
    methods: {
      checkForAuthorization() {
        var now = new Date();
        if(this.user.refresh_token !== null && this.user.refresh_token !== undefined && this.user.refresh_token !== '') {
          if(now > this.user.expiration_date) {
            this.dialog = true;
          }
        }
        else {
          this.dialog = true;
        }
      },
      doAuthorization() {
        const client = global.google.accounts.oauth2.initCodeClient({
          client_id: process.env.VUE_APP_CLIENT_ID,
          access_type: "offline",
          scope: 'https://www.googleapis.com/auth/calendar',
          ux_mode: 'popup',
          callback: (response) => {
            var code_receiver_uri = (process.env.URL ? process.env.URL : "http://localhost") + '/tutoring-api/authorize/' + this.user.userID;
  
            // Send auth code to your backend platform
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
              if(this.readyState == 4 && this.status == 200) {
                let responseData = JSON.parse(this.responseText);
                let user = Utils.getStore("user");
                user.refresh_token = responseData.refresh_token;
                user.expiration_date = responseData.expiration_date;
                Utils.setStore("user", user);
              }
            }
            xhr.open('POST', code_receiver_uri, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.send('code=' + response.code);
            // After receipt, the code is exchanged for an access token and
            // refresh token, and the platform then updates this web app
            // running in user's browser with the requested calendar info.
          },
        });
        client.requestCode();
      },
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
      async getAppointments() {
        await AppointmentServices.getUpcomingAppointmentForPersonForGroup(this.group.id, this.user.userID)
          .then(async (response) => {
            this.appointments = response.data;
//            this.addDataToAppoints();
            for (let index = 0; index < this.appointments.length; ++index) {
              this.appointments[index].student ='x'
              //  look up students
              await PersonAppointmentServices.findStudentDataForTable(this.appointments[index].id).then((response) => {
                let studentData = response.data;
                if (this.appointments[index].type.includes('Group')){
                  this.appointments[index].student = studentData.length + " Student(s)";
                }
                else if (this.appointments[index].type.includes('Private') && (this.appointments[index].status.includes('booked') || this.appointments[index].status.includes('pending'))){
                  this.appointments[index].student = studentData[0].person.fName + " " + studentData[0].person.lName;
                }
                else {
                  this.appointments[index].student = 'Open'
                }
              })
              // get location info 
              if (this.appointments[index].locationId == null){
                this.appointments[index].location = 'Not Selected'
              }
              else {
                await LocationServices.getLocation(this.appointments[index].locationId).then((response) => {
                  let locationData = response.data;
                  this.appointments[index].location = locationData.name;
                  
                })
              }
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
      async getAppointmentsNeedingFeedback() {
        await AppointmentServices.getPassedAppointmentForPersonForGroupTutor(this.group.id, this.user.userID)
          .then(response => {
            this.appointmentsneedingfeedback = response.data;

            for (let index = 0; index < this.appointmentsneedingfeedback.length; ++index) {
              //format date
              let element = this.appointmentsneedingfeedback[index];
              let formattedDate = element.date.toString().substring(5,10) + "-" + element.date.toString().substring(0,4);
              this.appointmentsneedingfeedback[index].date = formattedDate;
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
              this.appointmentsneedingfeedback[index].startTime = formattedST;
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
              this.appointmentsneedingfeedback[index].endTime = formattedET;
            } 

          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      },      
      provideFeedback: function (item, row) {      
        row.select(true);
        this.$router.push({ name: 'tutorAppointmentFeedback', params: { id: item.id, userId: this.user.userID } });
      },
      
      async getTutorRole() {
        await PersonRoleServices.getPersonRole(this.id)
        .then((response) => {
          if(response.data.status.includes("approved") || response.data.status.includes("Approved"))
          {
            this.approved = true;
          }
          else 
            this.approved = false;
          if(response.data.status.includes('disabled')){
            this.disabled = true;
          }
          else
            this.disabled = false; 
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });

        if(this.approved) {
          this.checkForAuthorization();
        }
      },
      async addDataToAppoints() {
        for (let i = 0; i < this.appointments.length; i++){
          this.appointments[i].student =  i;
          await PersonAppointmentServices.findStudentDataForTable(this.appointments[i].id).then((response) => {
            let studentData = response.data;
            if (this.appointments[i].type.includes('Group')){
              this.appointments[i].student = studentData.length + " Student(s)";
            }
            else if (this.appointments[i].type.includes('Private') && (this.appointments[i].status.includes('booked') || this.appointments[i].status.includes('pending'))){
              this.appointments[i].student = studentData[0].person.fName + " " + studentData[0].person.lName;
            }
            else {
              this.appointments[i].student = 'Open'
            }
          })
          console.log(this.appointments[i].student)
        }
       
      }
    }
  }
</script>

