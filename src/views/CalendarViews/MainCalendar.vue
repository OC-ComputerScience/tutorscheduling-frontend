
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
                <v-spacer></v-spacer>
                <v-btn icon>
                    <v-icon>mdi-heart</v-icon>
                </v-btn>
                <v-btn icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
                </v-toolbar>
                <v-card-text>
                <span v-html="selectedEvent.details"></span>
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
  export default {
    data: () => ({
      appointments: [],
      focus: '',
      type: 'month',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days',
      },
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
      //Views day when the date or more... options are clicked on
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      //Defaults the focus to the current date
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
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
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
      loadAppointments () {
        const events = []
        console.log(this.appointments.length);
        for(let i = 0; i < this.appointments.length; i++) {
          //Figure out how these work??
          // const firstTimestamp = this.rnd(min.getTime(), max.getTime())
          // const first = new Date(firstTimestamp - (firstTimestamp % 900000))
          // const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000
          // const second = new Date(first.getTime() + secondTimestamp)
          console.log(this.appointments[i]);

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
          })
        }
        this.events = events
      },
    },
  }
</script>