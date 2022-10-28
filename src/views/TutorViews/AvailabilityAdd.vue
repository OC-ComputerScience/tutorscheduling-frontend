<template>
<div>
  <v-container>
<div>
  <v-toolbar>
    <v-toolbar-title>{{this.message}}</v-toolbar-title>
    <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            class="mx-2"
            color="grey darken"
            dark
            v-bind="attrs"
            v-on="on"
          >
            mdi-information
          </v-icon>
        </template>
        <span>
          Select date(s), times, and type, and click Save to indicate when you can tutor.
        </span>
      </v-tooltip>
  </v-toolbar>
  <br>
  <b v-if="!group.allowSplittingAppointments">Please create availabilities with specific appointments times, not big blocks of time.</b>
  <br><br>
  <template>
    <v-dialog
      v-model="doubleBookedDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">You already have an appointment during this time:</span>
        </v-card-title>
        <v-card-text> 
          <br>
          <v-row>
            <v-col>
              <h3>Existing Appointment:</h3>
              <br>
              <p>Date: {{conflictAvailability.existing.date}}</p>
              <p>Start Time: {{conflictAvailability.existing.startTime}}</p>
              <p>End Time: {{conflictAvailability.existing.endTime}}</p>
            </v-col>
            <v-col>
              <h3>Conflicting Appointment:</h3>
              <br>
              <p>Date: {{conflictAvailability.conflicting.date}}</p>
              <p>Start Time: {{conflictAvailability.conflicting.startTime}}</p>
              <p>End Time: {{conflictAvailability.conflicting.endTime}}</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="doubleBookedDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="groupDialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Information for Session</span>
        </v-card-title>
        <v-card-text> 
          <v-container>
            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-select 
                  v-model="location"
                  :items="locations"
                  item-text="name"
                  item-value="id"
                  label="Location"
                  required
                  dense
                >
                </v-select>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-select 
                  v-model="topic"
                  :items="topics"
                  item-text="name"
                  item-value="id"
                  label="Topic"
                  required
                  dense
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row>
            <v-col >
                <v-textarea
                  v-model="preSessionInfo"
                  label="Pre-session info"
                  hint="Information for the session"
                  required
                  outlined
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="groupDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="addAvailability(); groupDialog = false;"
            :disabled="location === '' || location === null || location === undefined
                    || topic === '' || topic === null || topic === undefined"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
    >
      <v-date-picker
        v-model="dates"
        :min="nowDate"
        show-adjacent-months
        multiple
        @input="updateTimes()"
      ></v-date-picker>
    </v-col>
    <v-col
      cols="12"
      sm="6"
    >
      <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="dates"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            v-model="dates"
            multiple
            chips
            small-chips
            label="Dates you are available to tutor"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-combobox>
        </template>
        <v-date-picker
          v-model="dates"
          :min="nowDate"
          show-adjacent-months
          multiple
          no-title
          scrollable
          @input="updateTimes()"
        >
          <v-spacer></v-spacer>
          <v-btn
            text
            color="primary"
            @click="menu = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="$refs.menu.save(dates)"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-menu>
    </v-col>
    <v-col
      cols="11"
      sm="5"
    >
      <v-select
        v-model="displayedStart"
        :items="startTimes"
        label="Start Time"
        prepend-icon="mdi-clock-time-four-outline"
        item-text="timeText"
        item-value="time"
        required
        @change="newStart = displayedStart; updateTimes(); secondTime = false;"
        dense
      >
      </v-select>
    </v-col>
    <v-col
      cols="11"
      sm="5"
    >
      <v-select 
        v-model="displayedEnd"
        :items="endTimes"
        label="End Time"
        prepend-icon="mdi-clock-time-four-outline"
        item-text="timeText"
        item-value="time"
        required
        @change="newEnd = displayedEnd; updateTimes();"
        :disabled="secondTime"
        dense
      >
      </v-select>
    </v-col>
    <v-container >
      <v-select 
          v-model="groupSession"
          :items="sessionValues"
          item-text="text"
          item-value="value"
          label="Choose a session type"
          required
          dense
        >
        </v-select>
      <v-btn
        color="success"
        class="mr-4"
        @click="groupHandler"
        :disabled="displayedEnd === '' || displayedEnd === null || displayedEnd === undefined || 
                   displayedStart === '' || displayedStart === null || displayedStart === undefined || 
                   groupSession === '' || groupSession === null || groupSession === undefined || 
                   dates.length === 0"
      >
        Save
      </v-btn>
    </v-container>
    
  </v-row>
  </div>
  <div>
    <br><br>
    <v-toolbar>
      <v-toolbar-title>Your Availabilities</v-toolbar-title>
    </v-toolbar>
    <template>
      <v-data-table
        :headers="headers"
        :items="availabilities"
        :items-per-page="50"
      >
      <template v-slot:top>
      <v-toolbar
        flat
      >
        <!--  popup for deleting an availability  -->
        <v-dialog v-model="dialogDelete" max-width="800px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this availability?</v-card-title>
            <v-card-text> 
              <br>
              <v-row>
                <v-col>
                  <p>Date: {{editedItem.date}}</p>
                  <p>Start Time: {{editedItem.startTime}}</p>
                  <p>End Time: {{editedItem.endTime}}</p>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            small
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </template>
  </div>
  </v-container>
</div>
</template>

<script>
import AvailabilityServices from "@/services/availabilityServices.js"
import PersonRoleServices from "@/services/personRoleServices.js"
import TopicServices from "@/services/topicServices.js"
import LocationServices from "@/services/locationServices.js"
import AppointmentServices from "@/services/appointmentServices.js"
import PersonAppointmentServices from "@/services/personAppointmentServices.js"
import Utils from '@/config/utils.js'

  export default {
    name: 'App',
    props: ["id"],
    components: {
    },
    data: () => ({
      message : 'Add An Availability',
      nowDate: null,
      nowTime: null,
      availability: {},
      conflictAvailability: { 
        conflicting: {
          date: '',
          startTime: '',
          endTime: ''
        },
        existing: {
          date: '',
          startTime: '',
          endTime: ''
        }
      },
      appointment: {},
      personAppointment: {},
      availabilities: [],
      upcoming: [],
      dates: [],
      dialog: false,
      dialogDelete: false,
      groupDialog: false,
      doubleBookedDialog: false,
      secondTime: true,
      //used for generating time slots
      startTimes: [],
      endTimes: [],
      displayedStart: '',
      displayedEnd: '',
      newStart: "00:00",
      newEnd: "",
      startTime: null,
      endTime: null,
      menu: false,
      groupSession: '',
      editedItem: {},
      person: {},
      user: {},
      group: {},
      topic: '',
      topics: [],
      location: '',
      locations: [],
      sessionValues: [{text: 'Private', value: 'Private'},
                      {text: 'Group', value: 'Group'}],
      preSessionInfo: '',
      headers: [                  
                  {text: 'Date', value: 'date',},
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'endTime'},
                  { text: 'Actions', value: 'actions', sortable: false }],
      defaultItem: {
        status: '',
      },
    }),
    computed: {
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
    async created() {
      this.user = Utils.getStore('user')
      await this.getGroupByPersonRoleId()
      // below generates the latest time a day can have an appointment based on the group's time interval
      this.newEnd = "23:" + (59 - (this.group.timeInterval - 1)).toString();
      this.getAvailabilities()
      this.updateTimes();
    },
    methods: {
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
      generateTimeslots(startTime, endTime) {
        let timeInterval = this.group.timeInterval;
        // get the total minutes between the start and end times.
        var totalMins = this.subtractTimes(startTime, endTime);
        
        // set the initial timeSlots array to just the start time
        var timeSlots = [startTime];
        
        // get the rest of the time slots.
        let generatedTimes = this.getTimeSlots(timeInterval, totalMins, timeSlots);

        let newTimeText = ""

        let times = []
        for(let i = 0; i < generatedTimes.length; i++) {
          newTimeText = this.calcTime(generatedTimes[i])
          times.push({
            time: generatedTimes[i],
            timeText: newTimeText
          })
        }
        return times
      },
      getTimeSlots(timeInterval, totalMins, timeSlots) {
        // base case - there are still more minutes
        if (totalMins - timeInterval >= 0) {
          // get the previous time slot to add interval to
          var prevTimeSlot = timeSlots[timeSlots.length - 1];
          // add timeInterval to previousTimeSlot to get nextTimeSlot
          var nextTimeSlot = this.addMinsToTime(timeInterval, prevTimeSlot);
          timeSlots.push(nextTimeSlot);
          
          // update totalMins
          totalMins -= timeInterval;
          
          // get next time slot
          return this.getTimeSlots(timeInterval, totalMins, timeSlots);
        } else {
          // all done!
          return timeSlots;
        }
      },
      subtractTimes(t2, t1) {
        // get each time's hour and min values
        var [t1Hrs, t1Mins] = this.getHoursAndMinsFromTime(t1);
        var [t2Hrs, t2Mins] = this.getHoursAndMinsFromTime(t2);
        
        // time arithmetic (subtraction)
        if (t1Mins < t2Mins) {
          t1Hrs--;
          t1Mins += 60;
        }
        var mins = t1Mins - t2Mins;
        var hrs = t1Hrs - t2Hrs;
        
        return (hrs * 60) + mins;
      },
      getHoursAndMinsFromTime(time) {
        return time.split(':').map(function(str) {
          return parseInt(str);
        });
      },
      addMinsToTime(mins, time) {
        // get the times hour and min value
        var [timeHrs, timeMins] = this.getHoursAndMinsFromTime(time);
        
        // time arithmetic (addition)
        if (timeMins + mins >= 60) {
          var addedHrs = parseInt((timeMins + mins) / 60);
          timeMins = (timeMins + mins) % 60
          if (timeHrs + addedHrs > 23) {
            timeHrs = (timeHrs + addedHrs) % 24;
          } else {
            timeHrs += addedHrs;
          }
        } else {
          timeMins += mins;
        }
        
        // make sure the time slots are padded correctly
        return String("00" + timeHrs).slice(-2) + ":" + String("00" + timeMins).slice(-2);
      },
      getLocalDateString() {
        let date = new Date();
        date.setHours(date.getHours()-(date.getTimezoneOffset()/60));
        return date.toISOString().slice(0,10)
      },
      updateTimes() {
        let maxEndTime = "23:" + (59 - (this.group.timeInterval - 1)).toString();
        // setting the minimum date and time for the picker components
        this.nowDate = this.getLocalDateString();
        let temp = this.roundToNearestInterval(new Date());
        // see if selected dates includes today -- if not, allow all times
        const test = this.dates.filter(date => date === this.nowDate);
        if (test.length > 0) {
          this.nowTime =  temp.toString().slice(16,21);
        }
        else {
          this.nowTime = "00:00"
        }
        this.startTimes = this.generateTimeslots(this.nowTime, this.newEnd)
        // adding this to make sure that you can't start an appointment at the end time
        this.startTimes.pop();
        this.endTimes = this.generateTimeslots(this.newStart, maxEndTime)
        // adding this to make sure you can't end an appointment at the start time
        this.endTimes.shift();
      },
      roundToNearestInterval(date) {
        const minutes = this.group.timeInterval;
        const ms = 1000 * 60 * minutes;
        let newHours = Math.ceil(date.getTime() / ms) * ms
        date.setTime(newHours);
        return date
      },
      async checkIfAvailable(tempAvail) {
        await this.getUpcoming();
        let isAvail = true;
        for(let i = 0; i < this.upcoming.length && isAvail; i++) {
          let appoint = this.upcoming[i];
          appoint.date = appoint.date.substring(0, 10);
          appoint.startTime = appoint.startTime.substring(0, 5);          
          appoint.endTime = appoint.endTime.substring(0, 5);
          if(tempAvail.date === appoint.date) {
            if ((tempAvail.startTime < appoint.startTime && tempAvail.endTime > appoint.startTime)  // new availability starts before and ends during existing
              || (tempAvail.startTime >= appoint.startTime && tempAvail.endTime <= appoint.endTime)   // new availability is in the middle of an existing
              || (tempAvail.startTime < appoint.startTime && tempAvail.endTime > appoint.endTime)   // new availability starts before and ends after existing
              || (tempAvail.startTime > appoint.startTime && tempAvail.endTime > appoint.endTime && tempAvail.startTime < appoint.endTime)   // new availability starts during and ends after existing 
            )
            {  
              isAvail = false;
              this.conflictAvailability.conflicting = tempAvail;
              this.conflictAvailability.existing = appoint;
              // format time of conflict availability
              this.conflictAvailability.conflicting.startTime = this.formatTime(this.conflictAvailability.conflicting.startTime);
              this.conflictAvailability.conflicting.endTime = this.formatTime(this.conflictAvailability.conflicting.endTime);
              this.conflictAvailability.existing.startTime = this.formatTime(this.conflictAvailability.existing.startTime);
              this.conflictAvailability.existing.endTime = this.formatTime(this.conflictAvailability.existing.endTime);
              return;
            }
          }
        }
        return isAvail;
      },
      async addAvailability() {
        if(this.group.id === null || this.group.id === undefined || this.group.id === '') {
          console.log("group id wasn't set")
          await this.getGroupByPersonRoleId()
          .catch((error) => {
            this.message = error.response.data.message
            console.log(error);
          });
        }
        for (var i = 0; i < this.dates.length; i++) {
          let tempApp = {};
          let element = this.dates[i];
          this.availability.date = element;
          this.availability.startTime = this.newStart;
          this.availability.endTime = this.newEnd;
          this.availability.personId = this.user.userID;

          let checkAvailable = await this.checkIfAvailable(this.availability);

          if(checkAvailable) {
            await AvailabilityServices.addAvailability(this.availability)
            .then(async () => {
              let date = new Date(element)
              date.setHours(date.getHours() + (date.getTimezoneOffset()/60))
              this.appointment.date = date
              this.appointment.startTime = this.newStart
              this.appointment.endTime = this.newEnd
              if(this.groupSession.includes('Private')) {
                this.appointment.type = "Private"
                this.appointment.locationId = null
                this.appointment.topicId = null
                this.appointment.preSessionInfo = null
              }
              else {
                this.appointment.type = "Group"
                this.appointment.locationId = this.location
                this.appointment.topicId = this.topic
                this.appointment.preSessionInfo = this.preSessionInfo
              }
              this.appointment.groupId = this.group.id
              this.appointment.status = "available"
              await AppointmentServices.addAppointment(this.appointment)
              .then(async response => {
                tempApp = response.data;
                this.personAppointment.isTutor = true
                this.personAppointment.personId = this.user.userID
                this.personAppointment.appointmentId = tempApp.id;
                await PersonAppointmentServices.addPersonAppointment(this.personAppointment) 
                .then(async () => {
                  if(this.appointment.type === "Group" || this.appointment.type === "group")
                    await AppointmentServices.updateForGoogle(tempApp.id, tempApp)
                }) 
                .catch((error) => {
                  this.message = error.response.data.message
                  console.log(error);
                });
              })
              .catch((error) => {
                this.message = error.response.data.message
                console.log(error);
              });
            })
            .catch((error) => {
              this.message = error.response.data.message
              console.log(error);
            });
          }
          else {
            this.doubleBookedDialog = true;
          }
        }

        this.dates =[];
        this.displayedStart = '';
        this.displayedEnd = '';
        this.newStart ="00:00";
        this.newEnd = "23:" + (59 - (this.group.timeInterval - 1)).toString();
        this.groupSession = '';
        this.topic = ''
        this.location = ''
        this.preSessionInfo = ''
        this.secondTime = true;
        this.getAvailabilities();
        this.updateTimes();
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
      async getUpcoming() {
        await AppointmentServices.getUpcomingForPerson(this.user.userID)
        .then(response => {
          this.upcoming = response.data;
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
      async getAvailabilities() {
        await AvailabilityServices.getUpcomingForPerson(this.user.userID)
        .then(response => {
          this.availabilities = response.data;
          for(let i = 0; i < this.availabilities.length; i++){
            for(let j = 0; j < this.availabilities.length - i - 1; j++){
              if(this.availabilities[j + 1].date < this.availabilities[j].date){
                  [this.availabilities[j + 1],this.availabilities[j]] = [this.availabilities[j],this.availabilities[j + 1]]
              }
              else if(this.availabilities[j + 1].date === this.availabilities[j].date){
                if(this.availabilities[j + 1].startTime < this.availabilities[j].startTime)
                  [this.availabilities[j + 1],this.availabilities[j]] = [this.availabilities[j],this.availabilities[j + 1]]
              } 
            }
          }

          for (let index = 0; index < this.availabilities.length; ++index) {
            //format date, start time, and end time
            let element = this.availabilities[index];
            this.availabilities[index].date = this.formatDate(element.date);
            this.availabilities[index].startTime = this.formatTime(element.startTime);
            this.availabilities[index].endTime = this.formatTime(element.endTime);
          } 
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
      .then(async (response) => {
        this.group = response.data[0].role.group
        await this.getTopicsForGroup()
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    async getTopicsForGroup() {
      console.log(this.group)
      await TopicServices.getTopicByGroupForPerson(this.group.id, this.user.userID)
      .then(async response => {
        this.topics = response.data
        await LocationServices.getAllForGroup(this.group.id).then(response => {
          this.locations = response.data
        })
      })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },

    // popup functions
    groupHandler() {
      if(this.groupSession.includes('Group')){
        this.groupDialog = true
      }
      else 
        this.addAvailability()

    },
    deleteItem (item) {
      this.editedIndex = this.availabilities.indexOf(item.id)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    deleteItemConfirm () {
      this.availabilities.splice(this.editedIndex, 1)
        AvailabilityServices.deleteAvailability(this.editedItem.id)
          .then(() => {
            this.close()
            this.getAvailabilities()      
          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      
      this.closeDelete()
    },
    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
  },
  }
</script>
