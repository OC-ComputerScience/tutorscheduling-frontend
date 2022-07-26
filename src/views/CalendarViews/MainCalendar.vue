<template>
  <div>
    <v-container>
    <v-toolbar>
      <v-toolbar-title>{{this.message}}</v-toolbar-title>
    </v-toolbar>
    <br>
    <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
      <v-toolbar
      flat
      >
      <!-- Sets focus to current date -->
      <v-btn
        outlined
        class="mr-4"
        color="grey darken-2"
        @click="viewMonth()"
      >
      Reset
      </v-btn>
      <!-- Navigates calendar forward and back -->
      <v-btn
        fab
        text
        small
        color="grey darken-2"
        @click="prev"
      >
      <v-icon small>
      mdi-chevron-left
      </v-icon>
      </v-btn>
      <v-btn
        fab
        text
        small
        color="grey darken-2"
        @click="next"
      >
      <v-icon small>
      mdi-chevron-right
      </v-icon>
      </v-btn>
      <!-- Shows current month and year displayed on calendar -->
      <v-toolbar-title v-if="$refs.calendar">
          {{ $refs.calendar.title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-col cols="3" align-self="start">
        <v-select
        dense
        v-model="selectedTopic"
        :items="topics"
        item-text="name"
        item-value="id"
        label="Topic"
        outlined
        @change="loadAppointments()"
        ></v-select>
      </v-col>
      <v-col cols="3" align-self="start">
        <v-select
        dense
        v-model="selectedTutor"
        :items="tutorSelect"
        item-text="name"
        item-value="id"
        label="Tutor"
        outlined
        @change="loadAppointments()"
        ></v-select>
      </v-col>
      <v-btn
          outlined
          class="mr-4"
          color="grey darken-2"
          @click="viewKey()"
          right
        >
        Key
      </v-btn>
      <!-- Dropdown menu to select format -->
      <!-- Will modify to only include relevant formats -->
      <v-menu

        bottom
        right
      >
        <template v-slot:activator="{ on, attrs }">
        <v-btn
          outlined
          color="grey darken-2"
          v-bind="attrs"
          v-on="on"
        >
        <span>{{ typeToLabel[type] }}</span>
        <v-icon right>
        mdi-menu-down
        </v-icon>
        </v-btn>
        </template>
        <v-list>
        <v-list-item @click="type = 'day'">
          <v-list-item-title>Day</v-list-item-title>
        </v-list-item>
        <v-list-item @click="type = 'week'">
          <v-list-item-title>Week</v-list-item-title>
        </v-list-item>
        <v-list-item @click="type = 'month'">
          <v-list-item-title>Month</v-list-item-title>
        </v-list-item>
        <v-list-item @click="type = '4day'">
          <v-list-item-title>4 days</v-list-item-title>
        </v-list-item>
        </v-list>
      </v-menu>
      </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <!--Calendar element needs a list of events to show -->
        <!--Type determines calendar format -->
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :event-overlap-mode="mode"
          :event-overlap-threshold="30"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
        ></v-calendar>

        <!--Pop-up that appears when an event is selected -->

        <!-- add another v-menu for group session v private-->
        <v-menu
        v-model="selectedOpen"
        :open-on-click="false"
        :close-on-content-click="false"
        :activator="selectedElement"
        offset-x
        >
        <v-card
          color="grey lighten-4"
          min-width="350px"
          flat
        >
        <v-toolbar
        :color="selectedEvent.color"
        dark
        >
        <v-btn icon>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
        </v-toolbar>
        <!--TODO: Clean this up, allow signing up for timeslot -->
        <!-- How to show tutor? -->
        <v-card-text v-if="selectedAppointment != null">
          <b>Time slot:</b>
          {{calcTime(selectedAppointment.startTime)}}-{{calcTime(selectedAppointment.endTime)}}
          <br>
          <b>Tutors: </b>
          <span v-if="tutors.length > 0">
            <span v-for="tutor in tutors" :key="tutor.id">
              <span v-if="tutor == tutors[tutors.length - 1]">{{tutor.fName}} {{tutor.lName}}</span>
              <span v-else>{{tutor.fName}} {{tutor.lName}}, </span>
            </span>
          </span>
          <span v-else>
            <span>None</span>
          </span>
          <br>
          <b>Students: </b>
          <span v-if="students.length > 0">
            <span v-for="student in students" :key="student.id">
              <span v-if="student == students[students.length - 1]">{{student.fName}} {{student.lName}}</span>
              <span v-else>{{student.fName}} {{student.lName}}, </span>
            </span>
          </span>
          <span v-else>
            <span>None</span>
          </span>

          <!-- make location and topic changable if the appointment type is private-->
          <span  v-if="appointmentType.includes('Private')">
          <v-container>
          <v-select 
            v-model="selectedAppointment.locationId"
            :items="locations"
            item-text="name"
            item-value="id"
            label="Location"
            required
            dense
            :disabled="checkStatus('pending') || (checkRole('Tutor') && !checkStatus('booked')) || ((checkRole('Student') || checkRole('Admin')) && (checkStatus('booked')) || selectedAppointment.status.includes('Cancel'))"
            @change="saveChanges = true"
          >
          </v-select>

          <v-select 
            v-model="selectedAppointment.topicId"
            :items="currentTopics"
            item-text="name"
            item-value="id"
            label="Topic"
            required
            dense
            :disabled="!checkStatus('available') || checkRole('Tutor')"
          >
          </v-select>
          </v-container>
          </span>
          <!-- slots for locaiton and topic to be unchangable if the session type is group-->
          <span  v-else>
          <v-container>
          <v-select 
            v-model="selectedAppointment.locationId"
            :items="locations"
            item-text="name"
            item-value="id"
            label="Location"
            required
            dense
            :readonly="!isTutorEvent || (isTutorEvent && checkRole('Admin'))"
            @change="saveChanges = true"
          >
          </v-select>

          <v-select 
            v-model="selectedAppointment.topicId"
            :items="currentTopics"
            item-text="name"
            item-value="id"
            label="Topic"
            required
            dense
            :readonly="!isTutorEvent || (students.length > 0 && isTutorEvent) || (isTutorEvent && checkRole('Admin'))"
            @change="saveChanges = true"
          >
          </v-select>

          </v-container>
          </span>
          <!-- show time ad an changeable value for private lessons-->
          <v-container v-if="checkStatus('available')">
          
          <span v-if="appointmentType.includes('Private')">
            <v-select
              v-model="newStart"
              :items="startTimes"
              item-text="timeText"
              item-value="time"
              label="Booked Start"
              required
              @change="updateTimes()"
              :disabled="checkRole('Tutor')"
              dense
            >
            </v-select>
          </span>
          <!-- show time as an unchangeable value -->
          <span v-else>
             <v-text-field
                v-model="newStart"
                label="Booked Start"
                type="time"
                required
                dense
                readonly
              >
             </v-text-field>
          </span>
          </v-container>
          <v-container v-if="checkStatus('available')">
          <span v-if="appointmentType.includes('Private')">
          <v-select 
            v-model="newEnd"
            :items="endTimes"
            item-text="timeText"
            item-value="time"
            label="Booked End"
            required
            @change="updateTimes()"
            :disabled="checkRole('Tutor')"
            dense
          >
          </v-select>
          </span>
          <span v-else>
          <v-text-field
                v-model="newEnd"
                label="Booked End"
                type="time"
                required
                dense
                readonly
              >
             </v-text-field>
          </span>
          </v-container>
          <!-- put in presession-info for appointment for private appointments/ add a readonly if  group-->
          <span v-if="appointmentType.includes('Private')">
            <v-textarea
              v-model="selectedAppointment.preSessionInfo"
              id="preSession"
              :counter="130"
              label="Pre-Session Info"
              hint="Enter Info About What You Need Help With..."
              persistent-hint
              required
              auto-grow
              rows="1"
              :disabled="(!checkRole('Student') && !checkStatus('available')) || (checkRole('Student') && checkStatus('pending')) || checkRole('Tutor')"
              @change="saveChanges = true"
            ></v-textarea>
          </span>
          <span v-else>
            <v-textarea
              v-model="selectedAppointment.preSessionInfo"
              :counter="130"
              label="Pre-Session Info"
              hint="Enter Info About What You Need Help With..."
              persistent-hint
              required
              auto-grow
              rows="1"
              :readonly="!isTutorEvent"
              @change="saveChanges = true"
            ></v-textarea>
          </span>
          <!-- admin signing a student up -->
          <span v-if="adminAddStudent">
            <v-text-field 
              v-model="studentEmail"
              label="Student's Email"
              required
              dense
              max-width="300px"
              :rules="[rules.required, rules.email]"
            >
            </v-text-field>
            <v-row>
            <v-btn
              color="green"
              text
              @click="findEmail()"
              :disabled="!validateEmail()"
            >
              Search
            </v-btn>
            <v-text-field
              v-if="emailStatus != ''"
              v-model="emailStatus"
              readonly
              dense
            ></v-text-field>
            </v-row>
          </span>
          <span v-if="studentNameInput">
            <v-text-field 
              v-model="studentfName"
              label="Student's First Name"
              required
              dense
              max-width="300px"
            >
            </v-text-field>
            <v-text-field 
              v-model="studentlName"
              label="Student's Last Name"
              required
              dense
              max-width="300px"
            >
            </v-text-field>
          </span>
          <!-- User sign up here -->
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="!isTutorEvent || checkRole('Student') || checkRole('Admin')"
            color="primary"
            @click="bookAppointment(); selectedOpen = false;"
            :disabled="!checkStatus('available') || isGroupBook || ((studentfName == '' || studentlName == '') && !emailFound && checkRole('Admin')) ||
                        (checkRole('Admin') && selectedAppointment.type.includes('Group') && !adminAddStudent) || selectedAppointment.topicId == null 
                        || selectedAppointment.locationId == null || (isTutorEvent && !checkRole('Admin'))"
          >
          Book
          </v-btn>
        <v-btn v-if="checkRole('Tutor') && !appointmentType.includes('Group')"
          color="#12f000"
          @click="confirmAppointment(true)"
          :disabled="!checkStatus('pending')"
        >
        Confirm
        </v-btn>
        <v-btn v-if="checkRole('Tutor') && !appointmentType.includes('Group')"
          color="error"
          @click="confirmAppointment(false)"
          :disabled="!checkStatus('pending')"
        >
        Reject
        </v-btn>
        <v-btn
          color="accent"
          @click="selectedOpen = false"
        >
        Close
        </v-btn>
        <v-btn v-if="(isTutorEvent || isPrivateBook) && saveChanges && checkRole('Tutor')"
          color="accent"
          @click="editAppointment(); selectedOpen = false;"
        >
        Save Changes
        </v-btn>
        
        <v-btn v-if="(checkStatus('booked') && !checkRole('Admin')) || (isGroupBook && !adminAddStudent) || (isTutorEvent && (checkStatus('available') || checkStatus('booked'))) || 
                    (checkRole('Student') && checkStatus('pending'))"
          color="red"
          @click="cancelAppointment(); selectedOpen = false;"
        >
        Cancel Appointment
        </v-btn>

        <v-btn v-if="checkRole('Admin') && checkStatus('available')"
          color="green"
          @click="adminAddStudent = true"
          :disabled="adminAddStudent"
        >
        Sign Up Student
        </v-btn>
        </v-card-actions>
        </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
    </v-row>
    </v-container>
    <v-dialog v-model="keyVisible" max-width="600px">
    <v-card
    >
      <v-card-title class="text-h5">Color Meanings</v-card-title>
      <v-card-text class="text-h6">
        <v-btn
        elevation="0"
        color="grey darken-1"
        class="white--text"
        width="100"
        > 
        Grey
        </v-btn>
        <span> - This event marks an open timeslot that is available to be booked by any student.</span>
        <br>
        <v-btn
        elevation="0"
        color="yellow"
        class="white--text"
        width="100"
        > 
        Yellow
        </v-btn>
        <span> - This event marks that a set time has been requested and is pending tutor approval.</span>
        <br>
        <v-btn
        elevation="0"
        color="red"
        class="white--text"
        width="100"
        > 
        Red
        </v-btn>
        <span> - This event marks a requested timeslot that has been cancelled by the tutor.</span>
        <br>
        <v-btn
        elevation="0"
        color="blue"
        class="white--text"
        width="100"
        > 
        Blue
        </v-btn>
        <span> - This event marks a timeslot that has been booked and notes an upcoming meeting.</span>
        <br>
        <v-btn
        elevation="0"
        color="green"
        class="white--text"
        width="100"
        > 
        Green
        </v-btn>
        <span> - This event marks a timeslot that for a meeting that has been completed, 
          and is used for keeping track of user reviews.</span>
        <br>
        <v-btn
        elevation="0"
        color="purple"
        class="white--text"
        width="100"
        > 
        Purple
        </v-btn>
        <span> - This event marks a timeslot that for a group session that allows both students
          and tutors to sign up for it.</span><br>
        <v-card-title class="text-h5">Event Name Meanings</v-card-title>
        <span> G (Group session): {Topic name}</span><br>
        <span> P (Private session): {Tutor of session / Student who booked the session} <br></span>
        <span v-if="checkRole('Admin')">S (Cancelled session): {Status of cancelled session}<br></span>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="hideKey">Close</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>


<script>
//For info on appointments
import AppointmentServices from '@/services/appointmentServices.js'
import PersonAppointmentServices from '@/services/personAppointmentServices.js'
//For info on people and their associated roles
import PersonServices from "@/services/personServices.js"
import PersonTopicServices from "@/services/personTopicServices.js"
import PersonRoleServices from "@/services/personRoleServices.js"
import RoleServices from "@/services/roleServices.js"
//For info to be shown with appointments
import GroupServices from "@/services/groupServices.js"
import LocationServices from "@/services/locationServices.js"
import TopicServices from "@/services/topicServices.js"
//Plugin functions
import TwilioServices from "@/services/twilioServices.js"
import Utils from '@/config/utils.js'

  export default {
  props: ["id"],

  data: () => ({
    message : 'Schedule',
    mode: 'stack',
    //appointment info
    appointments: [],
    appointmentType: "",
    personAppointments: [],
    selectedAppointment: {},
    //info related to current appointment
    group: {},
    person: {},
    tutors: [],
    students: [],
    currentTopics: [],
    locations: [],
    //used for generating time slots
    startTimes: [],
    endTimes: [],
    newStart: null,
    newEnd: null,
    //data for calendar function
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    keyVisible: false,
    topics: [],
    tutorSelect: [],
    selectedTopic: -1,
    selectedTutor: -1,
    isTutorEvent: null,
    isGroupBook: null,
    //event data for calendar events
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    groupColor: false,
    studentGroupColor: false, 
    //current user data
    role: {},
    user: {},
    //admin adding a student
    adminAddStudent: false,
    studentEmail: "",
    emailStatus: "",
    studentNameInput: false,
    emailFound: false,
    studentfName: "",
    studentlName: "",
    walkInStudent: {},
    rules: {
          required: value => !!value || 'Required.',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          }},
    //student and tutor names
    studentName: '',
    tutorName: '',
    //editing appointment
    saveChanges: false,
    isPrivateBook: false,
    personApt : [],
    allPersonApt : [],
    allTopics : null,
    allPeople : null

  }),
  created() {
    this.user = Utils.getStore('user')
    this.getGroupByName(this.user.selectedGroup.replace(/%20/g, " "))
    this.getRole()
    this.getAppointments()
    this.loadTopics()
    this.loadPeople()
    this.isTutorOfSelectedEvent()
  },
  methods: {
    //Initialize data for calendar
   async getAppointments() {
    let group;
    await GroupServices.getGroupByName(this.user.selectedGroup.replace(/%20/g, " "))
      .then((response) => {
        group = response.data;
      })
      await AppointmentServices.findAppointmentsForGroup(group[0].id)
      .then(async (response) => {
        this.appointments = response.data
        await PersonAppointmentServices.getAllPersonAppointments()
        .then(async (response) => {
          this.personAppointments = response.data;
          await this.loadPersonApt();
          await this.loadAllPersonApt();
          await this.loadAppointments();
        })
      })
      .catch(error => {
       this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },
    getGroupByName(name) {
      GroupServices.getGroupByName(name)
      .then((response) => {
        this.group = response.data[0]
        this.getTopicsForGroup()
        this.getTutorsForGroup()
        this.getLocations()
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getTopicsForGroup() {
      TopicServices.getAllForGroup(this.group.id)
      .then(response => {
        let temp = response.data
        temp.push({name:"Any", id: -1})
        this.topics = temp
      })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },
    getTutorsForGroup() {
      PersonServices.getApprovedTutorsForGroup(this.group.id)
      .then(response => {
        let temp = response.data
        this.tutorSelect.push({name:"Any", id: -1})
        for (var i = 0; i < temp.length; i++){ 
            temp[i].name = temp[i].fName + " " + temp[i].lName
            this.tutorSelect.push(temp[i])
          }
        })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response.data)
      });
    },
    async getRole() {
     await PersonRoleServices.getPersonRole(this.id).then(async(response) => {
       await RoleServices.getRole(response.data.roleId).then((result) => {
         this.role = result.data
       })
     })
    },
    // Check to see if the tutor in question is the tutor of the selected event
    async isTutorOfSelectedEvent(){
      await PersonAppointmentServices.getPersonAppointmentForPerson(this.user.userID)
      .then(response => {
        let temp = response.data
        for (let i = 0; i < temp.length; i++){
          if (temp[i].appointmentId == this.selectedAppointment.id && temp[i].isTutor && temp[i].personId == this.user.userID){
            this.isTutorEvent = true
            return
          }
        }        
          this.isTutorEvent = false
        })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response.data)
      });
    },
    //Check if student has already signed up for group appointment
    async checkGroupBoooking() {
      if(this.adminAddStudent) {
        await PersonAppointmentServices.getPersonAppointmentForPerson(this.walkInStudent.id)
        .then(response => {
          let temp = response.data
          for (let i = 0; i < temp.length; i++){
            if (temp[i].appointmentId == this.selectedAppointment.id && this.selectedAppointment.type.includes('Group')){
              this.isGroupBook = true
              return 
            }
          }
          this.isGroupBook = false
          })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response.data)
        });
      }
      else {
       await PersonAppointmentServices.getPersonAppointmentForPerson(this.user.userID)
        .then(response => {
          let temp = response.data
          for (let i = 0; i < temp.length; i++){
            if (temp[i].appointmentId == this.selectedAppointment.id && this.selectedAppointment.type.includes('Group')){
              this.isGroupBook = true
              return 
            }
          }
          this.isGroupBook = false
          })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response.data)
        });
      }
    },
    async isStudentofAppointment() {
      await PersonAppointmentServices.getPersonAppointmentForPerson(this.user.userID)
        .then(response => {
          let temp = response.data
          for (let i = 0; i < temp.length; i++){
            if (temp[i].appointmentId == this.selectedAppointment.id && this.selectedAppointment.type.includes('Private')
             && this.checkRole('Student')){
              this.isPrivateBook = true
              return 
            }
          }
          this.isPrivateBook = false
      })
    },
    //Update on a session being booked
    async bookAppointment() {
      await AppointmentServices.getAppointment(this.selectedAppointment.id).then(async response => {
        if(response.data.status == "available" && response.data.type.includes('Private') && !this.checkRole('Admin')) {
          await this.splitAppointment().then(() => {
            this.getAppointments()
            this.selectedEvent.color = 'yellow'
          })
        }
        else if (this.adminAddStudent && !this.studentNameInput && response.data.type.includes('Private')) {
          await this.splitAppointmentForAdminAdd().then(() => {
            this.getAppointments()
            this.selectedEvent.color = 'blue'
          })
        }
        else if (this.adminAddStudent && this.studentNameInput && response.data.type.includes('Private')) {
          await this.adminAdd().then(() => {
            this.splitAppointmentForAdminAdd().then(() => {
              this.getAppointments()
              this.selectedEvent.color = 'blue'
            })
          })
        }
        else if (response.data.type.includes('Group')) {
            this.bookGroupSession()
        } 
        else {
          alert("This appointment has already been booked - Try a different slot")
          this.getAppointments()
          this.selectedOpen = false
        }
      })
    },
    //Update on tutor confirming booking
    async confirmAppointment(confirm) {
      if(confirm) {
        if(this.appointmentType.includes("Private")){
          this.selectedAppointment.status = "booked"
          await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment)
          .then(async () =>{
            await this.tutorConfirmMessage(this.students[0], this.user.fName, this.user.lName, this.selectedAppointment.id)
            this.getAppointments()
            this.selectedEvent.color = 'blue'
          })
          .catch (error => {
            this.message = error.response.data.message
          })
        }
      } else {
        // don't need to update google cal because it's not even on there yet
        this.selectedAppointment.status = "cancelled"
        await AppointmentServices.updateAppointment(this.selectedAppointment.id, this.selectedAppointment).then(() =>{
          this.getAppointments()
          this.selectedEvent.color = 'red'
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
    },
    //Add personAppointments from Group Sessions
    async bookGroupSession() {
      //Load person info
      if (this.adminAddStudent && this.studentNameInput) {
        await this.adminAdd().then(async () => {
          this.person.isTutor = false
          this.person.appointmentId = this.selectedAppointment.id
          this.person.personId = this.walkInStudent.id
          await PersonAppointmentServices.addPersonAppointment(this.person).then(() => {
            this.getAppointments()
          })
          .catch (error => {
            this.message = error.response.data.message
           })
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
      else if (this.adminAddStudent && !this.studentNameInput) {
        this.person.isTutor = false
        this.person.appointmentId = this.selectedAppointment.id
        this.person.personId = this.walkInStudent.id
        await PersonAppointmentServices.addPersonAppointment(this.person).then(() => {
          this.getAppointments()
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
      else {
        if(this.checkRole('Tutor')){
          this.person.isTutor = true
        }
        else{
          this.person.isTutor = false
          }
        this.person.appointmentId = this.selectedAppointment.id
        this.person.personId = this.$store.state.loginUser.userID
        //Update stored data
        await PersonAppointmentServices.addPersonAppointment(this.person).then(() => {
          this.getAppointments()
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
      // need to update group session in google
      await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment)
      .catch (error => {
          this.message = error.response.data.message
      })
    },
    
    //Split appointments into more availablity slots when part of slot is booked by an Admin
    async splitAppointmentForAdminAdd() {
      if(!this.checkStatus('available')) {
        return;
      }
      //If the start of the booked slot isn't the start of the slot, generate an open slot
      if(this.selectedAppointment.startTime < this.newStart) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.selectedAppointment.startTime,
          endTime: this.newStart,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        }
        await AppointmentServices.addAppointment(temp).then(async (response)=> {
          this.tutors.forEach(async(t) => {
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: t.id
            }
            await PersonAppointmentServices.addPersonAppointment(pap)
          })
          .catch (error => {
            this.message = error.response.data.message
          })
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
      //If the end of the booked slot isn't the end of the slot, generate an open slot
      if(this.selectedAppointment.endTime > this.newEnd) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.newEnd,
          endTime: this.selectedAppointment.endTime,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        }
        await AppointmentServices.addAppointment(temp).then((response)=> {
          this.tutors.forEach(async(t) => {
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: t.id
            }
            await PersonAppointmentServices.addPersonAppointment(pap)
            .catch (error => {
               this.message = error.response.data.message
             })
          })
          .catch (error => {
          this.message = error.response.data.message
        })
        })
      }
      //Load appointment info
      this.selectedAppointment.status = "booked"
      this.selectedAppointment.endTime = this.newEnd
      this.selectedAppointment.startTime = this.newStart
      //Load person info
      this.person.isTutor = false
      this.person.appointmentId = this.selectedAppointment.id
      this.person.personId = this.walkInStudent.id
      //Update stored data
      await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment)
      .catch (error => {
        this.message = error.response.data.message
      })
      await PersonAppointmentServices.addPersonAppointment(this.person)
      .catch (error => {
        this.message = error.response.data.message
      })
      this.adminAddStudent = false
    },

    //Split appointments into more availablity slots when part of slot is booked
    async splitAppointment() {
      if(!this.checkStatus('available')) {
        return;
      }
      //If the start of the booked slot isn't the start of the slot, generate an open slot
      if(this.selectedAppointment.startTime < this.newStart) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.selectedAppointment.startTime,
          endTime: this.newStart,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        }
        await AppointmentServices.addAppointment(temp).then((response)=> {
          this.tutors.forEach(async(t) => {
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: t.id
            }
            await PersonAppointmentServices.addPersonAppointment(pap)
          })
          .catch (error => {
          this.message = error.response.data.message
          })
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
      //If the end of the booked slot isn't the end of the slot, generate an open slot
      if(this.selectedAppointment.endTime > this.newEnd) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.newEnd,
          endTime: this.selectedAppointment.endTime,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        }
        await AppointmentServices.addAppointment(temp).then((response)=> {
          this.tutors.forEach(async(t) => {
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: t.id
            }
            await PersonAppointmentServices.addPersonAppointment(pap)
            .catch (error => {
              this.message = error.response.data.message
            })
          })
        })
        .catch (error => {
          this.message = error.response.data.message
        })
      }
      //Load appointment info
      this.selectedAppointment.status = "pending"
      this.selectedAppointment.endTime = this.newEnd
      this.selectedAppointment.startTime = this.newStart
      //Load person info
      this.person.isTutor = false
      this.person.appointmentId = this.selectedAppointment.id
      this.person.personId = this.$store.state.loginUser.userID
      //Update stored data
      await AppointmentServices.updateAppointment(this.selectedAppointment.id, this.selectedAppointment)
      .catch (error => {
          this.message = error.response.data.message
      })
      await PersonAppointmentServices.addPersonAppointment(this.person)
      .catch (error => {
          this.message = error.response.data.message
      })
      this.sendMessage(this.tutors[0], this.user.fName, this.user.lName, this.selectedAppointment.id)
    },

    //Formats time to be more user friendly
    calcTime(time) {
      if(time == null)
      {
        return null;
      }
      let temp = time.split(":")
      let milHours = parseInt(temp[0])
      let minutes = temp[1]
      let hours = milHours % 12
      if (hours == 0) {
        hours = 12
      }
      let dayTime = (~~(milHours / 12) > 0 ? "PM":"AM")
      return "" + hours + ":" + minutes + " " + dayTime
    },
    //Create time slots for users to select from
    generateTimes(start, end) {
      let startInfo = start.split(":")
      let endInfo = end.split(":")
      let loop = (parseInt(endInfo[0]) - parseInt(startInfo[0])) * 2 + 1
      let hours = parseInt(startInfo[0])
      let minutes = startInfo[1]
      let seconds = "00"

      let newTime = start
      let newTimeText = ""
      let j = 0

      let times = []

      if(startInfo[1] == "30") {
        loop -= 1
        j = 1
      }
      if(endInfo[1] == "30") {
        loop += 1
      }
      let temp
      for(let i = 0; i < loop; i++) {
        temp = (hours + Math.floor((i + j)/2))
        if(temp < 10)
        {
          temp = "0" + temp
        }
        newTime = temp + ":" + minutes + ":" + seconds
        newTimeText = this.calcTime(newTime)
        minutes = (minutes == "00" ? "30":"00")
        times.push({
          time: newTime,
          timeText: newTimeText
        })
      }
      return times
    },
    updateTimes() {
      this.startTimes = this.generateTimes(this.selectedAppointment.startTime, this.newEnd);
      // adding this to make sure that you can't start an appointment at the end time
      this.startTimes.pop();
      this.endTimes = this.generateTimes(this.newStart, this.selectedAppointment.endTime);
      // adding this to make sure you can't end an appointment at the start time
      this.endTimes.shift();
    },
    //Load data for info associated with events
    getTopic(topicId) {
      TopicServices.getTopic(topicId)
        .then((response) => {
          this.topic = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    getLocations() {
      LocationServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.locations = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
    },
    async getTopicsForTutor(tutor) {
      this.currentTopics = []
      await TopicServices.getTopicByGroupForPerson(this.group.id, tutor.id).then(response => {
        let personTopics = response.data
        personTopics.forEach(async(topic) => {
            this.currentTopics.push(topic)
        })
      })
    },
    // validate email function
    validateEmail() {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      let email = pattern.test(this.studentEmail)
      if (email){
        if (this.studentEmail.includes('oc.edu') || this.studentEmail.includes('eagles.oc.edu')){
          return true;
        }
      }
      else return false;
    },
    //Functions that run calendar functionality
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
    },
    viewMonth () {
      this.focus = ''
      this.type = 'month'
    },
    getEventColor (event) {
      return event.color
    },
    setToday () {
      this.focus = ''
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    viewKey() {
      this.keyVisible = true;
    },
    hideKey() {
      this.keyVisible = false;
    },
    sendMessage(tutor, fName, lName, appointId) {
      AppointmentServices.getAppointment(appointId).then((response) => {
        let appoint = response.data
        let temp = tutor
        let start = this.calcTime(this.selectedAppointment.startTime)
        let date = this.selectedAppointment.date.toString().substring(5,10) + "-" + this.selectedAppointment.date.toString().substring(0,4)
        temp.message = "Your " + appoint.type + " appointment on " + date + " at " + start + 
          " has been booked by " + fName + " " + lName + ".\nPlease view this pending appointment at http://tutorscheduling.oc.edu/"
        TwilioServices.sendMessage(temp);
      })
    },
    cancelMessage(tutor, fName, lName, appointId) {
      AppointmentServices.getAppointment(appointId).then((response) => {
        let appoint = response.data
        let temp = tutor
        let start = this.calcTime(this.selectedAppointment.startTime)
        let date = this.selectedAppointment.date.toString().substring(5,10) + "-" + this.selectedAppointment.date.toString().substring(0,4)
        temp.message = "Your " + appoint.type + " appointment on " + date + " at " + start + 
          " has been canceled by " + fName + " " + lName + ". This appointment is now open again for booking."
        TwilioServices.sendMessage(temp);
      })
    },
    tutorCancelMessage(student, fName, lName, appointId){
      AppointmentServices.getAppointment(appointId).then((response) => {
        let appoint = response.data
        let temp = student
        let start = this.calcTime(this.selectedAppointment.startTime)
        let date = this.selectedAppointment.date.toString().substring(5,10) + "-" + this.selectedAppointment.date.toString().substring(0,4)
        temp.message = "Your " + appoint.type + " appointment on " + date + " at " + start + 
          " has been canceled by " + fName + " " + lName + ". We apologize for the inconvenience."
        TwilioServices.sendMessage(temp);
      })
    },
    async tutorConfirmMessage(student, fName, lName, appointId){
      AppointmentServices.getAppointment(appointId).then((response) => {
        let appoint = response.data
        let temp = student
        let start = this.calcTime(this.selectedAppointment.startTime)
        let date = this.selectedAppointment.date.toString().substring(5,10) + "-" + this.selectedAppointment.date.toString().substring(0,4)
        temp.message = "The " + appoint.type + " appointment you booked on " + date + " at " + start + 
          " has been confirmed by " + fName + " " + lName + ".\nPlease review this appointment at http://tutorscheduling.oc.edu/"
        TwilioServices.sendMessage(temp);
      })
    },
    tutorEditMessage(student, fName, lName, type) {
      let temp = student
      let start = this.calcTime(this.selectedAppointment.startTime)
      let date = this.selectedAppointment.date.toString().substring(5,10) + "-" + this.selectedAppointment.date.toString().substring(0,4)
      temp.message = "Your " + type + " appointment with " + fName + " " + lName + " on " + date + " at " + start + 
        " has been edited. \nPlease check changes at http://tutorscheduling.oc.edu/"
      TwilioServices.sendMessage(temp);
    },
    //Animates Event card popping up
    showEvent ({ nativeEvent, event }) {
    
      const open = () => {
        this.selectedEvent = event
        AppointmentServices.getAppointment(event.appointmentId).then(async (response) => {
          this.selectedAppointment = response.data
          this.newStart = this.selectedAppointment.startTime
          this.newEnd = this.selectedAppointment.endTime
          this.appointmentType = this.selectedAppointment.type
          this.isTutorOfSelectedEvent()
          this.checkGroupBoooking()
          this.updateTimes()
          this.updatePeople()
          this.isStudentofAppointment()
          this.selectedElement = nativeEvent.target
         requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        })
        .catch(error => {
          this.message = error.response.data.message
        })
        ;
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
        this.saveChanges = false
        this.adminAddStudent = false
        this.studentEmail = ''
        this.emailStatus = ''
        this.studentfName = ''
        this.studentlName = ''
        this.studentNameInput = false
      }
      nativeEvent.stopPropagation()
    },
    //Update the lists of tutors and students
    async updatePeople() {
      this.tutors = []
      this.students = []
      let tutorFound = false
      this.personAppointments.forEach(async (person) => {
        if(person.appointmentId == this.selectedAppointment.id) {
          await PersonServices.getPerson(person.personId).then((response) => {
            if(person.isTutor) {
              this.tutors.push(response.data)
              if(!tutorFound) {
                this.getTopicsForTutor(response.data)
                tutorFound = true
              }
            } else {
              this.students.push(response.data)
            }
          })
          .catch(error => {
            this.message = error.response.data.message
          })
        }
      })
    },

    async loadAllPersonApt() {
      await PersonAppointmentServices.getAllPersonAppointments().then(async(response) => {
        this.allPersonApt = response.data
      })
      .catch(error => {
          this.message = error.response.data.message
      })
    },

    isStudentInGroupAppoint(appointId) {
      this.studentGroupColor =  false;
        for (let i = 0; i < this.allPersonApt.length;i++){
          if(this.allPersonApt[i].appointmentId == appointId) {
            if(!this.allPersonApt[i].isTutor) {
              this.studentGroupColor =  true;
              return 
            }
          }
        }
      return 
    },
    //Checks if the current session matches the given status, for hiding certain elements
    checkStatus(status) {
      if(this.selectedAppointment != null && this.selectedAppointment.status == status) {
        return true;
      }
      else {
        return false;
      }
    },
    async checkTopic(appoint) {
      let check=false;
      var tutorId;
      if (this.selectedTopic == null) return true;
      if (this.selectedTopic == appoint.topicId) return true;
      if (appoint.topicId != null && this.selectedTopic != appoint.topicId) return false;
      await AppointmentServices.getTutorForAppointment(appoint.id)
      .then ((response)=> {
        tutorId = response.data.id;
      })
      .catch((error) => {
        console.log("There was an error:" + error.response);
      });
      if (tutorId !=null) {
        await PersonTopicServices.getTopicForPersonGroup(this.group.id, tutorId)
        .then ((response)=> {
          let topics = response.data;
          for ( let i=0; i < topics.length; i++) {
            if (topics[i].id == this.selectedTopic)
              check = true;
            }
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        })
        return check;
      }
      else
        return check;
    },
    async checkTutor(appointId) {
      let found = false
     
      this.personAppointments.forEach((p) => {
        
        if(p.personId == this.selectedTutor && p.appointmentId == appointId && p.isTutor) {
          found = true
        }
      })

      return found
    },
    checkRole(type) {
      if(this.role != null && this.role.type == type) {
        return true;
      }
      else {
        return false;
      }
    },
    checkUserInAppointment(appId) {
      let found = false
      this.personAppointments.forEach((p) => {
        if(p.personId == this.user.userID && p.appointmentId == appId) {
          found = true
        }
      })
      return found
    },
    getPersonName(id){
      return this.allPeople.get(id).fName+" "+this.allPeople.get(id).lName
    },
    //Get the name of the student for the appointments
    async getStudentNameForAppointment(appointId){
      var found = false
      var studentId 
      for (var i = 0;i < this.personAppointments.length;i++){
        if (this.personAppointments[i].appointmentId == appointId.id && this.personAppointments[i].isTutor == '0'){
          found = true
          studentId = this.personAppointments[i].personId
        }
      }
      if(found){
        this.studentName = this.getPersonName(studentId)
        // await PersonServices.getPerson(studentId).then((response) => {
        //   this.studentName = response.data.fName + " " + response.data.lName
        // })
        // .catch(error => { 
        //   this.message = error.response.data.message
        // })
      }
      else{
        this.studentName = 'Open'
      }
    },
    //Get the name of the tutor for the appointments
    async getTutorNameForAppointment(appointId){
      var tutorId 
      for (var i = 0;i < this.personAppointments.length;i++){
        if (this.personAppointments[i].appointmentId == appointId.id && this.personAppointments[i].isTutor == '1'){
          tutorId = this.personAppointments[i].personId
          this.tutorName= this.getPersonName(tutorId)
        //   await PersonServices.getPerson(tutorId).then((response) => {
        //     this.tutorName = response.data.fName + " " + response.data.lName
        //   })
        //   .catch(error => { 
        //     this.message = error.response.data.message
        // })
        }
      }
    },
    async loadTopics () {
      this.allTopics = new Map()
      TopicServices.getAllTopics().then((response) => {
        let tempTopics = response.data;
        tempTopics.forEach(topic => {
          this.allTopics.set(topic.id,topic.name)
        });
      })
      .catch(error => { 
          this.message = error.response.data.message
      })
    },

    getTopicName(id){
      return this.allTopics.get(id)
    },
    async loadPeople () {
      this.allPeople = new Map()
      PersonServices.getAllPersons().then((response) => {
        let tempPersons = response.data;
        tempPersons.forEach(person => {
          this.allPeople.set(person.id,person)
        });
      })
      .catch(error => { 
          this.message = error.response.data.message
      })
    },


    //Load all appointments in backend into calendar events
    async loadAppointments() {
      const events = []
      let filtered
      for(let i = 0; i < this.appointments.length; i++) {
         this.groupBookColor(this.appointments[i].id)
         this.isStudentInGroupAppoint(this.appointments[i].id)
        //filter events to only add appropriate events
        filtered = true
        //only add appointments from the current group
        if(this.appointments[i].groupId != this.group.id) {
          filtered = false;
        }
        //filter away canceled appointments
        if(!this.checkRole('Admin') && (this.appointments[i].status.includes('studentCancel') || 
            this.appointments[i].status.includes('tutorCancel'))) {
          filtered = false;
        }
        //filter by topic
        let checkedtopic = await this.checkTopic(this.appointments[i])
        if(this.selectedTopic != -1 && !checkedtopic) {
          filtered = false;
        }
        //filter by tutor
        let checkedTutor = await this.checkTutor(this.appointments[i].id)
        if(this.selectedTutor != -1 && 
          !checkedTutor) 
        {
          filtered = false;
        }
        if(!this.checkRole('Admin'))
        {
          if(!(this.appointments[i].status == "available") || this.checkRole("Tutor")) {
          //only add if user is associated with event
            if(!this.checkTutor(this.appointments[i].id)){
              filtered = false;
            }
            if(this.appointments[i].type.includes('Group') 
                && !(this.appointments[i].status.includes('tutorCancel') || this.appointments[i].status.includes('studentCancel'))){
              filtered = true
            }
            if (this.appointments[i].type.includes('Group') 
                && !(this.appointments[i].status.includes('tutorCancel') || this.appointments[i].status.includes('studentCancel')) 
                && this.selectedTopic != -1 && !checkedtopic) {
                  filtered = false
            }
            if (this.appointments[i].type.includes('Group') 
                && !(this.appointments[i].status.includes('tutorCancel') || this.appointments[i].status.includes('studentCancel')) 
                && this.selectedTutor != -1 && !checkedTutor) {
                  filtered = false
            }
          }
        }
        if(filtered) {
        //Set color for each event
        let color = 'grey darken-1'
        switch (this.appointments[i].status) {
          case "pending":
            color = 'yellow'
            break
          case "studentCancel":
            color = 'red'
            break
          case "tutorCancel":
            color = 'red'
            break
          case "booked":
            color = 'blue'
            break
          case "complete":
            color = 'green'
            break
          default:
            color = 'grey darken-1'
            break
        }
        if (this.appointments[i].type.includes('Group') && this.groupColor && !(this.appointments[i].status.includes('tutorCancel') || this.appointments[i].status.includes('studentCancel'))){
          color = 'blue'
        }
        else if (this.appointments[i].type.includes('Group') && !(this.appointments[i].status.includes('tutorCancel') || this.appointments[i].status.includes('studentCancel'))){
          color = 'purple'
        }
        //Format times for each event and need to set minutes for events too
        let startTime = new Date(this.appointments[i].date)
        let startTimes = this.appointments[i].startTime.split(":");
        startTime.setHours(startTime.getHours() + parseInt(startTimes[0]))
        startTime.setMinutes(startTime.getMinutes() + parseInt(startTimes[1]))
        let endTime = new Date(this.appointments[i].date)
        let endTimes = this.appointments[i].endTime.split(":");
        endTime.setHours(endTime.getHours() + parseInt(endTimes[0]))
        endTime.setMinutes(endTime.getMinutes() + parseInt(endTimes[1]))
        //Note the format of each event, what data is associated with it
        if (this.appointments[i].type.includes('Group')){
            
//          await TopicServices.getTopic(this.appointments[i].topicId).then(async (response) => {
            let topicName = this.getTopicName(this.appointments[i].topicId)
            if (this.groupColor && !this.studentGroupColor) {
              topicName = 'Open'
              color = 'grey darken-1'
            }
            events.push({
              name: 'G: ' + topicName,
              start: startTime,
              end: endTime,
              color: color,
              timed: true,
              appointmentId: this.appointments[i].id
            })
 //         })
        }
        if ((this.appointments[i].type.includes('Private') && this.checkRole('Tutor')) || 
            (this.checkRole('Admin') && (this.appointments[i].status.includes('booked') || this.appointments[i].status.includes('pending')))){
          await this.getStudentNameForAppointment(this.appointments[i])
          .catch(error => { 
            this.message = error.response.data.message
          })
          events.push({
            name: 'P: ' + this.studentName,
            start: startTime,
            end: endTime,
            color: color,
            timed: true,
            appointmentId: this.appointments[i].id
          })
        }
        else if(this.appointments[i].type.includes('Private') && !this.appointments[i].status.includes('Cancel') &&
               (this.checkRole('Student') || this.checkRole('Admin'))){
          await this.getTutorNameForAppointment(this.appointments[i])
          .catch(error => { 
          this.message = error.response.data.message
          })
          events.push({
            name: 'P: ' + this.tutorName,
            start: startTime,
            end: endTime,
            color: color,
            timed: true,
            appointmentId: this.appointments[i].id
          })
        }
        else if(this.checkRole('Admin') && !this.appointments[i].type.includes('Group')){
          events.push({
            name: 'S: ' + this.appointments[i].status,
            start: startTime,
            end: endTime,
            color: color,
            timed: true,
            appointmentId: this.appointments[i].id
          })
        }
        
      }
      }
  
      this.events = events
    },
    async loadPersonApt() {
      
      await PersonAppointmentServices.getPersonAppointmentForPerson(this.user.userID).then((response) => {
        this.personApt = response.data
      })
      .catch(error => { 
          this.message = error.response.data.message
       })
    },

    groupBookColor(appointId) {
        for(let i = 0; i < this.personApt.length;i++){
          if (this.personApt[i].appointmentId == appointId){
            this.groupColor = true;
            return
          }
        } 
        this.groupColor = false;
        return 
    },
    //method for canceling appointments
    async cancelAppointment(){
      //delete appointment as a student of a private session
      if (this.selectedAppointment.type.includes('Private') && this.checkRole('Student') && this.checkStatus('booked')){
        this.selectedAppointment.status = "studentCancel"
        await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment)
          .then(async () =>{
            let temp = {
              date: this.selectedAppointment.date,
              startTime: this.selectedAppointment.startTime,
              endTime: this.selectedAppointment.endTime,
              type: this.selectedAppointment.type,
              status: 'available',
              preSessionInfo: "",
              groupId: this.selectedAppointment.groupId,
            }
            await AppointmentServices.addAppointment(temp)
            .then( async(response) =>{
              this.tutors.forEach(async (t) => {
              let pap = {
                isTutor: true,
                appointmentId: response.data.id,
                personId: t.id
              }
              await PersonAppointmentServices.addPersonAppointment(pap)
            })
            this.cancelMessage(this.tutors[0], this.user.fName, this.user.lName, this.selectedAppointment.id)
            await this.getAppointments()
            //this.$router.go(0);
          })
          .catch(error => { 
            this.message = error.response.data.message
          })
      })
      }
      else if (this.selectedAppointment.type.includes('Private') && this.checkRole('Student') && this.checkStatus('pending')){
        this.selectedAppointment.status = "available"
        this.selectedAppointment.locationId = null;
        this.selectedAppointment.topicId = null;
        this.selectedAppointment.preSessionInfo = "";
        // don't need to update google event because it doesn't exist
        await AppointmentServices.updateAppointment(this.selectedAppointment.id, this.selectedAppointment)
        .catch(error => { 
          this.message = error.response.data.message
        })
        for (let i = 0;i < this.personAppointments.length;i++) {
          if (this.personAppointments[i].appointmentId == this.selectedAppointment.id && !this.personAppointments[i].isTutor
            && this.personAppointments[i].personId == this.user.userID){
            await PersonAppointmentServices.deletePersonAppointment(this.personAppointments[i].id)
            await this.getAppointments()
            //this.$router.go(0);
          }
        }
      }
      //delete appointment as a student of a group session
      else if (this.selectedAppointment.type.includes('Group') && this.checkRole('Student')){
        for (let i = 0;i < this.personAppointments.length;i++) {
          if (this.personAppointments[i].appointmentId == this.selectedAppointment.id && !this.personAppointments[i].isTutor
            && this.personAppointments[i].personId == this.user.userID){
            await PersonAppointmentServices.deletePersonAppointment(this.personAppointments[i].id)
            await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment)
            .catch(error => { 
              this.message = error.response.data.message
            })
            await this.getAppointments()
            //this.$router.go(0);
          }
        }
      }
      //delete appointment as a tutor of a private session
      else if (this.selectedAppointment.type.includes('Private') && this.checkRole('Tutor')){
        for (let i = 0;i < this.personAppointments.length;i++) {
          if (this.personAppointments[i].appointmentId == this.selectedAppointment.id && this.personAppointments[i].isTutor){
            for(let j = 0; j<this.personAppointments.length;j++){
              if (this.personAppointments[j].appointmentId == this.selectedAppointment.id && !this.personAppointments[j].isTutor){
                this.selectedAppointment.status = "tutorCancel"
                await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment)
                this.tutorCancelMessage(this.students[0], this.user.fName, this.user.lName, this.selectedAppointment.id)
                await this.getAppointments()
                return
              }
            }
            
              
            await PersonAppointmentServices.deletePersonAppointment(this.personAppointments[i].id)
   
            await AppointmentServices.deleteAppointment(this.selectedAppointment.id)
          
            await this.getAppointments()
            //this.$router.go(0);
          }
        }
      }
      //delete appointment as a tutor of a group session
      else if (this.selectedAppointment.type.includes('Group') && this.checkRole('Tutor')){
        for (let i = 0;i < this.personAppointments.length;i++) {
          if (this.personAppointments[i].appointmentId == this.selectedAppointment.id && this.personAppointments[i].isTutor && 
          this.personAppointments[i].personId == this.user.userID){
            await PersonAppointmentServices.getAllPersonAppointments()
            .then((response) => {
              this.personAppointments = response.data;
            })
            .catch(error => { 
              this.message = error.response.data.message
            })
            let found = false;
            for (let j = 0;j < this.personAppointments.length;j++) {
              if (this.personAppointments[j].appointmentId == this.selectedAppointment.id && this.personAppointments[j].isTutor &&
              this.personAppointments[j].personId != this.user.userID) {
                found = true
              }
            }
            if (this.students.length > 0 && this.tutors.length == 1){
              for (let k = 0; k < this.students.length; k++){
                this.tutorCancelMessage(this.students[k], this.user.fName, this.user.lName, this.selectedAppointment.id)
              } 
              this.selectedAppointment.status = "tutorCancel"
              await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment) 
              .catch(error => { 
                this.message = error.response.data.message
              })        
            }
            else if (found){
              await PersonAppointmentServices.deletePersonAppointment(this.personAppointments[i].id)
              .catch(error => { 
                this.message = error.response.data.message
              })
            }
            else {
              await AppointmentServices.deleteAppointment(this.selectedAppointment.id)
              .catch(error => { 
                this.message = error.response.data.message
              })
            }
            await this.getAppointments()


            //this.$router.go(0);
          }
        }
      }
    },
    findEmail() {
      PersonServices.getPersonForEmail(this.studentEmail).then((response)=> {
        let temp = response.data;
        let onlyTutor = true
        if(this.user.userID == temp.id) {
          this.emailStatus = "You cannot sign yourself up for an appointment."
          this.emailFound = true;
          return
        }
        else if (temp.id == this.tutors[0].id){
          this.emailStatus = "You cannot sign-up the tutor for their own appointment."
          this.emailFound = true;
          return
        }
        else if (!temp.email.includes('not found')){
          this.studentNameInput = false; 
          PersonServices.getAllForGroup(this.group.id).then(async (responseGroup) => {
            let people = responseGroup.data
            for (let i = 0; i < people.length; i++) {
              if (people[i].id == temp.id) {
                await RoleServices.getRoleByGroupForPerson(this.group.id, temp.id).then(async (result) => {
                  let role = result.data
                  for (let k = 0; k < role.length;k++) {
                    if (role[k].type.includes('Student')){
                      onlyTutor = false
                    }
                  }
                  if (onlyTutor) {
                    await RoleServices.getAllForGroup(this.group.id).then((responseRole) => {
                      let roles = responseRole.data;
                      for (let i = 0;i<roles.length;i++) {
                        if (roles[i].type == 'Student'){
                          let personRole = {
                            status: 'applied',
                            roleId: roles[i].id,
                            personId: temp.id,
                            dateSigned: Date(),
                            agree: false,
                          }
                          PersonRoleServices.addPersonRole(personRole)
                          this.emailStatus = temp.fName + " " + temp.lName + " has been added as a student!"
                          this.emailFound = true;
                          return
                        }
                      }
                    })
                  }
                })
                this.emailStatus = 'Student ' + temp.fName + " " + temp.lName + " found!"
                this.walkInStudent = temp;
                this.emailFound = true;
                this.checkGroupBoooking()
                return 
              }
            }
            this.emailStatus = 'Student ' + temp.fName + " " + temp.lName + " has been added to " + this.group.name + "!"
            this.walkInStudent = temp;
            RoleServices.getAllForGroup(this.group.id).then((responseRole) => {
              let roles = responseRole.data;
              for (let i = 0;i<roles.length;i++) {
                if (roles[i].type == 'Student'){
                  let personRole = {
                    status: 'applied',
                    roleId: roles[i].id,
                    personId: temp.id,
                    dateSigned: Date(),
                    agree: false,
                  }
                  PersonRoleServices.addPersonRole(personRole)
                  this.emailFound = true;
                  return
                }
              }
            })
          })
        }
        else {
          this.studentNameInput = true;
          this.emailStatus = 'No Student Found'// get rid of popup and add to the open selecte event, then if email not found, add more blanks for student name
          this.isGroupBook = false
          this.emailFound = false
          this.studentfName = ''
          this.studentlName = ''
        }
      })
      .catch(error => { 
          this.message = error.response.data.message
      })
    },
    // add a student to the system and then to the current group
    async adminAdd() {
      let student = {
            fName: this.studentfName,
            lName: this.studentlName,
            email: this.studentEmail,
            createdAt: Date(),
            updatedAt: Date(),
          }
      await PersonServices.addPerson(student).then((response) => {
        let temp = response.data
        this.walkInStudent = temp;
        RoleServices.getAllForGroup(this.group.id).then((responseRole) => {
          let roles = responseRole.data;
          for (let i = 0;i<roles.length;i++) {
            if (roles[i].type == 'Student'){
              let personRole = {
                status: 'applied',
                roleId: roles[i].id,
                personId: response.data.id,
                dateSigned: Date(),
                agree: false,
              }
              PersonRoleServices.addPersonRole(personRole)
              return
            }
          }
        })
        .catch(error => { 
          this.message = error.response.data.message
        })
      })
    },
    async editAppointment(){
      await AppointmentServices.updateForGoogle(this.selectedAppointment.id, this.selectedAppointment).then(async () =>{
          for (let i = 0;i < this.students.length;i++){
            this.tutorEditMessage(this.students[i], this.user.fName, this.user.lName, this.selectedAppointment.type)
          }
          await this.getAppointments()
        })
        .catch(error => { 
          this.message = error.response.data.message
        })
    }
  },
}
</script>
