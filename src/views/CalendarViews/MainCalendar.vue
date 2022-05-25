
<template>
  <div>
    <v-container>
    <v-toolbar>
      <v-toolbar-title>Schedule</v-toolbar-title>
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
        :type="type"
        @click:event="showEvent"
        @click:more="viewDay"
        @click:date="viewDay"
        ></v-calendar>

        <!--Pop-up that appears when an event is selected -->
        <v-menu
        v-model="selectedOpen"
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
          <v-container>
          <v-select 
            v-model="selectedAppointment.locationId"
            :items="locations"
            item-text="name"
            item-value="id"
            label="Location"
            required
            dense
            :disabled="!checkStatus('available')"
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
            :disabled="!checkStatus('available')"
          >
          </v-select>
          
          </v-container>
          <v-container v-if="checkStatus('available')">
          <v-select
            v-model="newStart"
            :items="startTimes"
            item-text="timeText"
            item-value="time"
            label="Booked Start"
            required
            @change="updateTimes()"
            dense
          >
          </v-select>
          </v-container>
          <v-container v-if="checkStatus('available')">
          <v-select 
            v-model="newEnd"
            :items="endTimes"
            item-text="timeText"
            item-value="time"
            label="Booked End"
            required
            @change="updateTimes()"
            dense
          >
          </v-select>
          </v-container>
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
          :disabled="!checkStatus('available')"
          ></v-textarea>
          <!-- User sign up here -->
        </v-card-text>
        <v-card-actions>
        <v-btn v-if="checkRole('Student')"
          color="primary"
          @click="bookAppointment()"
          :disabled="!checkStatus('available')"
        >
        Book
        </v-btn>
        <v-btn v-if="checkRole('Tutor')"
          color="#12f000"
          @click="confirmAppointment(true)"
          :disabled="!checkStatus('pending')"
        >
        Confirm
        </v-btn>
        <v-btn v-if="checkRole('Tutor')"
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
        Cancel
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
        <span> - This event marks an open timeslot that is available to be booked by any student</span>
        <br>
        <v-btn
        elevation="0"
        color="yellow"
        class="white--text"
        width="100"
        > 
        Yellow
        </v-btn>
        <span> - This event marks that a set time has been requested and is pending tutor approval</span>
        <br>
        <v-btn
        elevation="0"
        color="red"
        class="white--text"
        width="100"
        > 
        Red
        </v-btn>
        <span> - This event marks a requested timeslot that has been cancelled by the tutor</span>
        <br>
        <v-btn
        elevation="0"
        color="blue"
        class="white--text"
        width="100"
        > 
        Blue
        </v-btn>
        <span> - This event marks a timeslot that has been booked and notes an upcoming meeting</span>
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
          and is used for keeping track of user reviews</span>
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
    //appointment info
    appointments: [],
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
    //event data for calendar events
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    //current user data
    role: {},
    user: {}
  }),
  created() {
    this.user = Utils.getStore('user')
    this.getGroupByName(this.user.selectedGroup.replace(/%20/g, " "))
    this.getRole()
    this.getAppointments()
  },
  methods: {
    //Initialize data for calendar
    getAppointments() {
      AppointmentServices.getAllAppointments()
      .then(response => {
        this.appointments = response.data
        PersonAppointmentServices.getAllPersonAppointments()
        .then(response => {
          this.personAppointments = response.data;
          
          this.loadAppointments()
        })
      })
      .catch(error => {
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
        console.log("There was an error:", error.response)
      });
    },
    getTutorsForGroup() {
      /*PersonServices.getAllForGroup(this.group.id)
      .then(response => {
        let temp = response.data
        this.tutorSelect.push({name:"Any", id: -1})
        PersonRoleServices.getAllPersonRoles()
          .then(response => {
            let roletemp = response.data
            for (var j = 0; j < temp.length; j++){
              for (var i = 0; i < roletemp.length; i++){ // switch later on to check personappointment = istutor
                console.log(roletemp[i].role)
                if (temp[j].id == roletemp[i].personId && roletemp[i].role.type.includes('Tutor')){
                  temp[j].name = temp[j].fName + " " + temp[j].lName
                  this.tutorSelect.push(temp[j])
                }
              }
          }
        })
      })*/
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
        console.log("There was an error:", error.response.data)
      });
    },
    getRole() {
     PersonRoleServices.getPersonRole(this.id).then((response) => {
       RoleServices.getRole(response.data.roleId).then((result) => {
         this.role = result.data
       })
     })
    },
    //Update on a session being booked
    bookAppointment() {
      AppointmentServices.getAppointment(this.selectedAppointment.id).then(response => {
        if(response.data.status == "available") {
          this.splitAppointment().then(() => {
            this.getAppointments()
            this.selectedEvent.color = 'yellow'
          })
        } else {
          alert("This appointment has already been booked - Try a different slot")
          this.getAppointments()
          this.selectedOpen = false
        }
      })
    },
    //Update on tutor confirming booking
    confirmAppointment(confirm) {
      if(confirm) {
        this.selectedAppointment.status = "booked"
        AppointmentServices.updateAppointmentStatus(this.selectedAppointment.id, this.selectedAppointment)
        .then(() =>{
          this.getAppointments()
          this.selectedEvent.color = 'blue'
        })
      } else {
        this.selectedAppointment.status = "cancelled"
        AppointmentServices.updateAppointment(this.selectedAppointment.id, this.selectedAppointment).then(() =>{
          this.getAppointments()
          this.selectedEvent.color = 'red'
        })
      }
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
          locationId: this.selectedAppointment.locationId,
          topicId: this.selectedAppointment.topicId,
        }
        AppointmentServices.addAppointment(temp).then((response)=> {
          this.tutors.forEach((t) => {
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: t.id
            }
            PersonAppointmentServices.addPersonAppointment(pap)
          })
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
          locationId: this.selectedAppointment.locationId,
          topicId: this.selectedAppointment.topicId,
        }
        AppointmentServices.addAppointment(temp).then((response)=> {
          this.tutors.forEach((t) => {
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: t.id
            }
            PersonAppointmentServices.addPersonAppointment(pap)
          })
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
      await PersonAppointmentServices.addPersonAppointment(this.person)
      this.sendMessage(this.tutors[0], this.user.fName, this.user.lName)
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
      this.startTimes = this.generateTimes(this.selectedAppointment.startTime, this.newEnd)
      this.endTimes = this.generateTimes(this.newStart, this.selectedAppointment.endTime)
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
          console.log("There was an error:", error.response);
        });
    },
    getTopicsForTutor(tutor) {
      this.currentTopics = []
      PersonTopicServices.getAllForPerson(tutor.id).then(response => {
        let personTopics = response.data
        personTopics.forEach(topic => {
          TopicServices.getTopic(topic.topicId).then(result => {
            this.currentTopics.push(result.data)
          })
        })
      })
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
    sendMessage(tutor, fName, lName) {
      let temp = tutor
      temp.message = "You have a session request from " +fName + " " + lName + " pending"
      TwilioServices.sendMessage(temp);
    },
    //Animates Event card popping up
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        AppointmentServices.getAppointment(event.appointmentId).then(response => {
          this.selectedAppointment = response.data
          this.newStart = this.selectedAppointment.startTime
          this.newEnd = this.selectedAppointment.endTime
          this.updateTimes()
          this.updatePeople()
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        });
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }
      nativeEvent.stopPropagation()
    },
    //Update the lists of tutors and students
    updatePeople() {
      this.tutors = []
      this.students = []
      let tutorFound = false
      this.personAppointments.forEach((person) => {
        if(person.appointmentId == this.selectedAppointment.id) {
          PersonServices.getPerson(person.personId).then((response) => {
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
        }
      })
      
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
    checkTopic(topic) {
      if(this.selectedTopic != null && this.selectedTopic == topic) {
        return true;
      }
      else {
        return false;
      }
    },
    checkTutor(appointId) {
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
    //Load all appointments in backend into calendar events
    async loadAppointments() {
      const events = []
      let filtered
      for(let i = 0; i < this.appointments.length; i++) {
        //filter events to only add appropriate events
        filtered = true
        //only add appointments from the current group
        if(this.appointments[i].groupId != this.group.id) {
          filtered = false;
        }
        //filter by topic
        if(this.selectedTopic != -1 && !this.checkTopic(this.appointments[i].topicId)) {
          filtered = false;
        }
        //filter by tutor
        if(this.selectedTutor != -1 && 
          !this.checkTutor(this.appointments[i].id)) 
        {
          filtered = false;
        }
        if(!this.checkRole("Admin"))
        {
          if(!(this.appointments[i].status == "available") || this.checkRole("Tutor")) {
          //only add if user is associated with event
            if(!this.checkUserInAppointment(this.appointments[i].id)){
              filtered = false;
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
          case "cancelled":
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
        //Format times for each event
        let startTime = new Date(this.appointments[i].date)
        let startTimes = this.appointments[i].startTime.split(":");
        startTime.setHours(startTime.getHours() + parseInt(startTimes[0]))
        let endTime = new Date(this.appointments[i].date)
        let endTimes = this.appointments[i].endTime.split(":");
        endTime.setHours(endTime.getHours() + parseInt(endTimes[0]))
        //Note the format of each event, what data is associated with it
        events.push({
          name: this.appointments[i].type,
          start: startTime,
          end: endTime,
          color: color,
          timed: true,
          appointmentId: this.appointments[i].id
        })
      }
      }
      this.events = events
    },
  },
}
</script>