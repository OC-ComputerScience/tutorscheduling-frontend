
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
          @click="setToday"
      >
          Today
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
            <b>Pre-session Info:</b>
            {{selectedAppointment.preSessionInfo}}
            <br>
            <b>Type:</b>
            {{selectedAppointment.type}}
            <br>
            <b>Group:</b>
            {{group.name}}
            <br>
            <b>Location:</b>
            {{location.name}}
            <br>
            <b>Topic:</b>
            {{topic.name}}
            <br>

            <v-select
              v-model="newStart"
              :items="startTimes"
              item-text="timeText"
              item-value="time"
              label="Booked Start"
              required
              @change="updateTimes()"
            >
            </v-select>
            <v-select
              v-model="newEnd"
              :items="endTimes"
              item-text="timeText"
              item-value="time"
              label="Booked End"
              required
              @change="updateTimes()"
            >
            </v-select>
            <!-- User sign up here -->
            <v-btn
              text
              color="primary"
              @click="bookAppointment()"
            >
              Book
            </v-btn>

          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              color="secondary"
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
  </div>
</template>

<script>
import AppointmentServices from '@/services/appointmentServices.js'
import GroupServices from "@/services/groupServices.js"
import LocationServices from "@/services/locationServices.js"
import TopicServices from "@/services/topicServices.js"

  export default {
  data: () => ({
    //appointment info
    appointments: [],
    selectedAppointment: {},
    //info related to current appointment
    group: {},
    location: {},
    topic: {},
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
    //event data for calendar events
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
  }),
  created() {
    this.getAppointments();
  },
  methods: {
    getAppointments() {
      AppointmentServices.getAllAppointments()
      .then(response => {
        this.appointments = response.data;
        this.loadAppointments();
      })
      .catch(error => {
        console.log("There was an error:", error.response)
      });
    },

    bookAppointment() {
      this.splitAppointment().then(() => {
        this.getAppointments();
        this.loadAppointments();
        this.selectedEvent.color = 'yellow'
      })
    },

    //Split appointments into more availablity slots when part of slot is booked
    async splitAppointment() {
      if(this.selectedAppointment.status != "available") {
        return;
      }
      if(this.selectedAppointment.startTime < this.newStart) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.selectedAppointment.startTime,
          endTime: this.newStart,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: this.selectedAppointment.preSessionInfo,
          groupId: this.selectedAppointment.groupId,
          locationId: this.selectedAppointment.locationId,
          topicId: this.selectedAppointment.topicId,
        }
        console.log(temp)
        AppointmentServices.addAppointment(temp)
      }
      if(this.selectedAppointment.endTime > this.newEnd) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.newEnd,
          endTime: this.selectedAppointment.endTime,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: this.selectedAppointment.preSessionInfo,
          groupId: this.selectedAppointment.groupId,
          locationId: this.selectedAppointment.locationId,
          topicId: this.selectedAppointment.topicId,
        }
        console.log(temp)
        AppointmentServices.addAppointment(temp)
      }

      this.selectedAppointment.status = "pending"
      this.selectedAppointment.endTime = this.newEnd
      this.selectedAppointment.startTime = this.newStart
      console.log(this.selectedAppointment.status)
      await AppointmentServices.updateAppointment(this.selectedAppointment.id, this.selectedAppointment)
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
      let dayTime = ((milHours / 12) > 0 ? "PM":"AM")
      return "" + hours + ":" + minutes + " " + dayTime
    },

    generateTimes(start, end) {
      let startInfo = start.split(":")
      let endInfo = end.split(":")
      let loop = (parseInt(endInfo[0]) - parseInt(startInfo[0])) * 2 + 1
      let hours = parseInt(startInfo[0])
      let minutes = startInfo[1]
      let seconds = "00"

      let newTime = startInfo
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
      for(let i = 0; i < loop; i++) {
        newTime = (hours + Math.floor((i + j)/2)) + ":" + minutes + ":" + seconds
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
    getGroup(groupId) {
      GroupServices.getGroup(groupId)
        .then((response) => {
          this.group = response.data;
          console.log(response.data);
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    getTopic(topicId) {
      TopicServices.getTopic(topicId)
        .then((response) => {
          this.topic = response.data;
          console.log(response.data);
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    getLocation(locationId) {
      LocationServices.getLocation(locationId)
        .then((response) => {
          this.location = response.data;
          console.log(response.data);
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    
    //Functions that run calendar functionality
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
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

    //Animates Event card popping up
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        AppointmentServices.getAppointment(event.appointmentId).then(response => {
          this.selectedAppointment = response.data
          this.getGroup(this.selectedAppointment.groupId)
          this.getLocation(this.selectedAppointment.locationId)
          this.getTopic(this.selectedAppointment.topicId)
          this.newStart = this.selectedAppointment.startTime
          this.newEnd = this.selectedAppointment.endTime
          this.updateTimes()
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

    //Load all appointments in backend into calendar events
    async loadAppointments () {
      const events = []
      console.log(this.appointments.length);
      //TODO - add filtering options
      for(let i = 0; i < this.appointments.length; i++) {
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
      this.events = events
    },
  },
}
</script>