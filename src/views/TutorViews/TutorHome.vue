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
import PersonRoleServices from "@/services/personRoleServices.js";
import AppointmentServices from '@/services/appointmentServices.js'
import PersonAppointmentServices from "@/services/personAppointmentServices.js";

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
                  {text: 'Topic', value: 'topic.name'},
                  {text: 'Location', value: 'location.name'},
                  {text: 'Type', value: 'type'},
                  {text: 'Status', value: 'status'},
                  {text: 'Student(s)', value: 'student'}],
        headerFeedback: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Type', value: 'type'},],
        message : 'Tutor',
        url :''
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      if(this.id !== 0) {
        this.getTutorRole();
      }
      await this.getGroupByPersonRoleId()
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
        // console.log("doAuth")
        // console.log("url:"+process.env.VUE_APP_SITE_URL)

//        this.url = (process.env.VUE_APP_SITE_URL ? process.env.VUE_APP_SITE_URL : "http://localhost") + '/tutoring-api/authorize/' + this.user.userID;
       this.url = '/tutoring-api/authorize/' + this.user.userID;
        // console.log(this.url)
        const client = global.google.accounts.oauth2.initCodeClient({
          client_id: process.env.VUE_APP_CLIENT_ID,
          access_type: "offline",
          scope: 'https://www.googleapis.com/auth/calendar',
          ux_mode: 'popup',
          callback: (response) => {
   
            var code_receiver_uri =  this.url;
  
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
      async getGroupByPersonRoleId() {
        await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      formatDate(date) {
        let formattedDate = date.toString().substring(5,10) + "-" + date.toString().substring(0,4);
        return formattedDate;
      },
      formatTime(time) {
        let modST = time.toString().substring(0,2) % 12;
        let formattedTime = modST + ":" + time.toString().substring(3,5);

        if (time.toString().substring(0,2) > 12){
          formattedTime = formattedTime + " P.M.";}
        else if(modST == 0 && time.toString().substring(0,2) == "12"){
          formattedTime = "12:" + time.toString().substring(3,5) + " P.M.";
        }
        else if(modST == 0){
          formattedTime = "12:" + time.toString().substring(3,5) + " A.M.";
        }
        else{
          formattedTime = formattedTime + " A.M.";
        }

        return formattedTime;
      },
      async getAppointments() {
        await AppointmentServices.getUpcomingAppointmentForPersonForGroup(this.group.id, this.user.userID)
          .then(async (response) => {
            this.appointments = response.data;
            let temp = this.appointments.length
            for(let i = 0; i < temp; i++){
                for(let j = 0; j < temp - i - 1; j++){
                    if(this.appointments[j + 1].date < this.appointments[j].date){
                        [this.appointments[j + 1],this.appointments[j]] = [this.appointments[j],this.appointments[j + 1]]
                    }
                    else if(this.appointments[j + 1].date === this.appointments[j].date){
                      if(this.appointments[j + 1].startTime < this.appointments[j].startTime)
                        [this.appointments[j + 1],this.appointments[j]] = [this.appointments[j],this.appointments[j + 1]]
                    } 
                }
            }
            for (let index = 0; index < this.appointments.length; ++index) {
              this.appointments[index].student ='x'

              //  look up students
              await PersonAppointmentServices.findStudentDataForTable(this.appointments[index].id)
              .then((response) => {
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
              .catch(error => {
                this.message = error.response.data.message
                console.log("There was an error:", error.response)
              });

              // set null location info 
              if (this.appointments[index].locationId === null){
                this.appointments[index].location = {
                  name: 'Not Selected'
                }
              }

              // set null topic info 
              if (this.appointments[index].topicId === null){
                this.appointments[index].topic = {
                  name: 'Not Selected'
                }
              }
  
              //format date, start time, and end time
              let element = this.appointments[index];
              this.appointments[index].date = this.formatDate(element.date);
              this.appointments[index].startTime = this.formatTime(element.startTime);
              this.appointments[index].endTime = this.formatTime(element.endTime);
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
                //format date, start time, and end time
              let element = this.appointmentsneedingfeedback[index];
              this.appointmentsneedingfeedback[index].date = this.formatDate(element.date);
              this.appointmentsneedingfeedback[index].startTime = this.formatTime(element.startTime);
              this.appointmentsneedingfeedback[index].endTime = this.formatTime(element.endTime);
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
    }
  }
</script>

