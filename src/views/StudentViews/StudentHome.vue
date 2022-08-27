<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <v-container v-if="!disabled">
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
import PersonAppointmentServices from "@/services/personAppointmentServices.js";

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
        disabled: false,
        appointments: [],
        appointmentsneedingfeedback: [],
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Topic', value: 'topic.name'},
                  {text: 'Location', value: 'location.name'},
                  {text: 'Type', value: 'type'},
                  {text: 'Tutor', value: 'tutor'}],
        headerFeedback: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  {text: 'Type', value: 'type'},],
        message : 'Student'
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getStudentRole();
        if (!this.disabled) {
          this.getAppointments();
          this.getAppointmentsNeedingFeedback();
        }
      })
      .catch ((error) => {
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
              this.appointments[index].tutor ='x'
              //  look up students
              await PersonAppointmentServices.findTutorDataForTable(this.appointments[index].id).then((response) => {
                let tutorData = response.data;
                if (this.appointments[index].type.includes('Group')){
                  this.appointments[index].tutor = tutorData.length + " Tutor(s)";
                }
                else if (this.appointments[index].type.includes('Private') && (this.appointments[index].status.includes('booked') || this.appointments[index].status.includes('pending'))){
                  this.appointments[index].tutor = tutorData[0].person.fName + " " + tutorData[0].person.lName;
                }
                else {
                  this.appointments[index].tutor = 'Open'
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
        await AppointmentServices.getPassedAppointmentForPersonForGroupStudent(this.group.id, this.user.userID)
          .then(response => {
            this.appointmentsneedingfeedback = response.data;
            console.log(this.appointmentsneedingfeedback);
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
        this.$router.push({ name: 'studentAppointmentFeedback', params: { id: item.id, userId: this.user.userID }});
      },
      async getStudentRole() {
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
