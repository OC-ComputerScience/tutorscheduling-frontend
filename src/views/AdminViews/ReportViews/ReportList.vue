
<template>
  <div>
    <v-container>
        <v-toolbar>
            <v-toolbar-title>{{message}}</v-toolbar-title>
        </v-toolbar>
        <br><br>
        <br><br>
        <v-dialog
       v-model="noApptDialog"
       max-width="600px"
     >
       <v-card>
         <v-card-title>
           <span class="text-h5">Warning:</span>
         </v-card-title>
         <v-card-text> 
           <h2>There are no appointments that meet this criteria.</h2>
         </v-card-text>
         <v-card-actions>
           <v-spacer></v-spacer>
           <v-btn
             color="blue darken-1"
             text
             @click="noApptDialog = false"
           >
             Close
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
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
              item-text="name"
              item-value="id"
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
              item-value="fullName"
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
              item-value="fullName"
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
                :disabled="!isFiltered"
                @click="isFiltered = false"
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
        isFiltered: false,
        noApptDialog: false,
        menu: false,
        dates: [],
        group: {},
        user: {},
        topics: [],
        selectedTopic: -1,
        status: [{id: 0, name: "available"}, 
                {id: 1, name: "pending"},
                {id: 2, name: "booked"},
                {id: 3, name: "complete"},
                {id: 4, name: "studentCancel"},
                {id: 5, name: "tutorCancel"},
                {id: 6, name: "no-show"}],
        selectedStatus: -1,
        selectedTutors: [],
        tutors: [],
        selectedStudents: [],
        students: [],
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
                  preSessionInfo: { title: 'Pre Session Notes' }},
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
        await this.getAllAppointmentsForGroup()
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
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
        let biggestTutors = 0;
        let biggestStudents = 0;

        for(let i = 0; i < this.appointments.length; i++) {
          let appoint = this.appointments[i]
          appoint.students = []
          appoint.tutors = []
          if(appoint.topic !== undefined && appoint.topic !== null && appoint.topic !== '')
            this.selectedAppointments[i].topicName = appoint.topic.name;
          else
            this.selectedAppointments[i].topicName = "";

          if(appoint.location !== undefined && appoint.location !== null && appoint.location !== '')
            this.selectedAppointments[i].locationName = appoint.location.name;
          else
            this.selectedAppointments[i].locationName = "";

          if(appoint.location !== undefined && appoint.topic !== null && appoint.location !== '')
            this.selectedAppointments[i].locationBuilding = appoint.location.building;
          else
            this.selectedAppointments[i].locationBuilding = "";

          if(appoint.preSessionInfo === undefined || appoint.preSessionInfo === null) {
            this.selectedAppointments[i].preSessionInfo = ""
          }

          // need to fix this for all undefined columns
          if(appoint.personappointment === undefined || appoint.personappointment === null) {
            this.selectedAppointments[i].tutor1 = ""
            this.selectedAppointments[i].tutor1Feedback = ""
            this.selectedAppointments[i].student1 = ""
            this.selectedAppointments[i].student1Feedback = ""
          }
          else {
            let tutIndex = 0, stuIndex = 0;
            for(let j = 0; j < appoint.personappointment.length; j++) {
              let pa = appoint.personappointment[j];
              if(pa.isTutor === true) {
                appoint.tutors[tutIndex] = {};
                appoint.tutors[tutIndex].title = "Tutor " + (tutIndex+1)
                appoint.tutors[tutIndex].name = pa.person.fName + ' ' + pa.person.lName;
                appoint.tutors[tutIndex].feedbacknumber = pa.feedbacknumber; 
                appoint.tutors[tutIndex].feedbacktext = pa.feedbacktext;
                
                tutIndex++;
              }
              else {
                appoint.students[stuIndex] = {};
                appoint.students[stuIndex].title = "Student " + (stuIndex+1)
                appoint.students[stuIndex].name = pa.person.fName + ' ' + pa.person.lName;
                appoint.students[stuIndex].feedbacknumber = pa.feedbacknumber;
                appoint.students[stuIndex].feedbacktext = pa.feedbacktext;
                
                stuIndex++;
              }
            }
          }

          if(biggestTutors < appoint.tutors.length)
            biggestTutors = appoint.tutors.length
          
          if(biggestStudents < appoint.students.length)
            biggestStudents = appoint.students.length
          
          // dynamically adds columns to the csv file depending on how many tutors/students were in the appointment
          for(let j = 0; j < appoint.tutors.length; j++) {
            this.selectedAppointments[i][`tutor${j+1}`] = appoint.tutors[j].name;
            if(appoint.tutors[j].feedbacknumber === undefined || appoint.tutors[j].feedbacknumber === null)
              this.selectedAppointments[i][`tutor${j+1}Feedback`] = ""
            else  
              this.selectedAppointments[i][`tutor${j+1}Feedback`] = appoint.tutors[j].feedbacknumber

            if(appoint.tutors[j].feedbacktext !== undefined && appoint.tutors[j].feedbacktext !== null && appoint.tutors[j].feedbacktext !== '')
              this.selectedAppointments[i][`tutor${j+1}Feedback`] += ": " + appoint.tutors[j].feedbacktext;
            // else if(appoint.tutors[j].feedbacknumber !== undefined && appoint.tutors[j].feedbacknumber !== null)
            //   this.selectedAppointments[i][`tutor${j+1}Feedback`] += "";

            if(this.labels[`tutor${j+1}`] === undefined || this.labels[`tutor${j+1}`] === null) {
              this.labels[`tutor${j+1}`] = {};
              this.labels[`tutor${j+1}`].title = appoint.tutors[j].title;

              this.labels[`tutor${j+1}Feedback`] = {};
              this.labels[`tutor${j+1}Feedback`].title = appoint.tutors[j].title + " Feedback";
            }
          }

          for(let j = 0; j < appoint.students.length; j++) {
            this.selectedAppointments[i][`student${j+1}`] = appoint.students[j].name;

            if(appoint.students[j].feedbacknumber === undefined || appoint.students[j].feedbacknumber === null)
              this.selectedAppointments[i][`student${j+1}Feedback`] = ""
            else  
              this.selectedAppointments[i][`student${j+1}Feedback`] = appoint.students[j].feedbacknumber

            if(appoint.students[j].feedbacktext !== undefined && appoint.students[j].feedbacktext !== null && appoint.students[j].feedbacktext !== '')
              this.selectedAppointments[i][`student${j+1}Feedback`] += ": " + appoint.students[j].feedbacktext;
            // else if(appoint.students[j].feedbacknumber !== undefined && appoint.students[j].feedbacknumber !== null)
            //   this.selectedAppointments[i][`student${j+1}Feedback`] += "";

            if(this.labels[`student${j+1}`] === undefined || this.labels[`student${j+1}`] === null) {
              this.labels[`student${j+1}`] = {};
              this.labels[`student${j+1}`].title = appoint.students[j].title;

              this.labels[`student${j+1}Feedback`] = {};
              this.labels[`student${j+1}Feedback`].title = appoint.students[j].title + " Feedback";
            }
          }
        }

        // set any undefined variables as empty strings
        for(let i = 0; i < this.selectedAppointments.length; i++) {
          let appoint = this.selectedAppointments[i]
          for(let j = 0; j < biggestTutors; j++) {
            if(appoint[`tutor${j+1}`] === undefined || appoint[`tutor${j+1}`] === null) {
              appoint[`tutor${j+1}`] = ''
              appoint[`tutor${j+1}Feedback`] = ''
            }
          }
          for(let j = 0; j < biggestStudents; j++) {
            if(appoint[`student${j+1}`] === undefined || appoint[`student${j+1}`] === null) {
              appoint[`student${j+1}`] = ''
              appoint[`student${j+1}Feedback`] = ''
            }
          }
        }
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
      async getAllAppointmentsForGroup() {
        await AppointmentServices.getAllForGroup(this.group.id)
          .then(async response => {
            this.appointments = response.data;

            // put appointments in date and time order
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
              //format date, start time, and end time
              let element = this.appointments[index];
              this.appointments[index].date = this.formatDate(element.date);
              this.appointments[index].startTime = this.formatTime(element.startTime);
              this.appointments[index].endTime = this.formatTime(element.endTime);
            }

            var date = new Date();
            this.today = String(date.getMonth() + 1).padStart(2, '0') + '-'
                + String(date.getDate()).padStart(2, '0') + '-' 
                + date.getFullYear();
            this.fileName = this.user.selectedGroup + " Report for " + this.today;
            await this.setSelectedAppointments();
            this.updatePeople();
          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      },
      getTopicsForGroup() {
        TopicServices.getAllForGroup(this.group.id)
        .then(response => {
          this.topics = response.data
          this.topics.push({name:"Any", id: -1})
          this.status.push({name: "Any", id: -1})
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
          this.selectedAppointments = this.selectedAppointments.filter(appointment => 
              appointment.date >= this.formatDate(this.dates[0]) && 
              appointment.date <= this.formatDate(this.dates[1]));
        }
        // filter by topic
        if(this.selectedTopic > 0) {
          this.selectedAppointments = this.selectedAppointments.filter(appointment => appointment.topicId === this.selectedTopic);
        }
        // filter by status, >= 0 since the array starts at 0
        if(this.selectedStatus >= 0) {
          this.selectedAppointments = this.selectedAppointments.filter(appointment => appointment.status === this.status[this.selectedStatus].name);
        }
        // filter by tutors
        if(this.selectedTutors.length > 0) {
          let tempTutors = this.selectedTutors
          this.selectedAppointments = this.selectedAppointments.filter(function (appoint) {
            for(let i = 0; i < appoint.tutors.length; i++) {
              for(let j = 0; j < tempTutors.length; j++) {
                return appoint.tutors[i].name === tempTutors[j]
              }
            }
          })
        }
        // filter by students
        if(this.selectedStudents.length > 0) {
          let tempStudents = this.selectedStudents
          this.selectedAppointments = this.selectedAppointments.filter(function (appoint) {
            for(let i = 0; i < appoint.students.length; i++) {
              for(let j = 0; j < tempStudents.length; j++) {
                return appoint.students[i].name === tempStudents[j]
              }
            }
          })
        }

        // makes sure we're not trying to create an empty csv file
        if(this.selectedAppointments.length === 0) {
          this.noApptDialog = true;
          this.getAllAppointmentsForGroup();
        }
        else {
          this.isFiltered = true;
        }
      }
    }
  }
</script>

