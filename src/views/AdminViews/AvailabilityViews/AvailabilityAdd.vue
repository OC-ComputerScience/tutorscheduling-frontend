<template>
<div>
  <v-container>
<div>
  <v-toolbar>
    <v-toolbar-title>{{this.message}}</v-toolbar-title>
  </v-toolbar>
  <br><br>
  <template>
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
          <small>*indicates required field</small>
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
        v-model="newStart"
        :items="startTimes"
        label="Start Time"
        prepend-icon="mdi-clock-time-four-outline"
        item-text="timeText"
        item-value="time"
        required
        @change="updateTimes(); secondTime = false;"
        dense
      >
      </v-select>
    </v-col>
    <v-col
      cols="11"
      sm="5"
    >
      <v-select 
        v-model="newEnd"
        :items="endTimes"
        label="End Time"
        prepend-icon="mdi-clock-time-four-outline"
        item-text="timeText"
        item-value="time"
        required
        @change="updateTimes()"
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
      >
        Save
      </v-btn> <!-- have combo box here asking if the availabilities being added are group sessions or private -->
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
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
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
import GroupServices from "@/services/groupServices.js"
import TopicServices from "@/services/topicServices.js"
import LocationServices from "@/services/locationServices.js"
import AppointmentServices from "@/services/appointmentServices.js"
import PersonAppointmentServices from "@/services/personAppointmentServices.js"
import Utils from '@/config/utils.js'

  export default {
    name: 'App',
    components: {
    },
    data: () => ({
      message : 'Availability - select date, times and type and click Save to indicate when you can tutor',
      nowDate: null,
      nowTime: null,
      availability: {},
      appointment: {},
      personAppointment: {},
      availabilities: [],
      dates: [],
      dialog: false,
      dialogDelete: false,
      groupDialog: false,
      secondTime: true,
      //used for generating time slots
      startTimes: [],
      endTimes: [],
      newStart: "00:00",
      newEnd: "23:30",
      startTime: null,
      endTime: null,
      menu: false,
      menu2: false,
      menu3: false,
      menu4: false,
      menu5: false,
      groupSession: {},
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
      this.getAvailabilities()
      this.updateTimes();
      await this.getGroupByName(this.user.selectedGroup.replace(/%20/g, " "))
  
      // this.getPerson()
      // .then(() => {
      //      })
      // console.log(this.person);
      // this.getAvailabilities();

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
      getLocalDateString() {
        let date = new Date();
        date.setHours(date.getHours()-(date.getTimezoneOffset()/60));
        return date.toISOString().slice(0,10)
      },
      updateTimes() {
        // setting the minimum date and time for the picker components
        this.nowDate = this.getLocalDateString();
        let temp = this.roundToNearest30(new Date());
        // see if selected dates includes today -- if not, allow all times
        const test = this.dates.filter(date => date === this.nowDate);
        if (test.length > 0) {
          this.nowTime =  temp.toString().slice(16,21);
        }
        else {
          this.nowTime = "00:00"
        }
        console.log("nowTime="+this.nowTime)
     //   this.newStart = this.nowTime; - caused problem with saving startDate in availabilityß
        this.startTimes = this.generateTimes(this.nowTime, this.newEnd)
        // adding this to make sure thxat you can't start an appointment at the end time
        this.startTimes.pop();
        this.endTimes = this.generateTimes(this.newStart, "23:30")
        // adding this to make sure you can't end an appointment at the start time
        this.endTimes.shift();
      },
      roundToNearest30(date) {
        const minutes = 30;
        const ms = 1000 * 60 * minutes;
        let newHours = Math.ceil(date.getTime() / ms) * ms
        date.setTime(newHours);
        return date
      },
      async addAvailability() {
        for (var i = 0; i < this.dates.length; i++) {
          let element = this.dates[i];
          this.availability.date = element;
          this.availability.startTime = this.newStart;
          this.availability.endTime = this.newEnd;
          this.availability.personId = this.user.userID;
          await AvailabilityServices.addAvailability(this.availability)
          .then(async () => {
            let date = new Date(element)
            date.setHours(date.getHours() + (date.getTimezoneOffset()/60))
            this.appointment.date = date
            this.appointment.startTime = this.newStart
            this.appointment.endTime = this.newEnd
            if(this.groupSession.includes('Private')){
              this.appointment.type = "Private"
              this.appointment.locationId = null
              this.appointment.topicId = null
              this.appointment.preSessionInfo = null
            }
            else{
              this.appointment.type = "Group"
              this.appointment.locationId = this.location
              this.appointment.topicId = this.topic
              this.appointment.preSessionInfo = this.preSessionInfo
            }
            this.appointment.groupId = this.group.id
            this.appointment.status = "available"
            await AppointmentServices.addAppointment(this.appointment)
            .then(async response => {
              console.log(response)
              this.appointment.id = response.data.id;
              this.personAppointment.isTutor = true
              this.personAppointment.personId = this.user.userID
              this.personAppointment.appointmentId = this.appointment.id
              await PersonAppointmentServices.addPersonAppointment(this.personAppointment) 
              .then(async () => {
                console.log(this.appointment)
                if(this.appointment.type === "Group" || this.appointment.type === "group")
                  await AppointmentServices.updateForGoogle(this.appointment.id, this.appointment)
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

        
        this.dates =[];
        this.newStart ="00:00";
        this.newEnd = "23:30";
        this.groupSession = '';
        this.topic = ''
        this.location = ''
        this.preSessionInfo = ''
        this.secondTime = true;
        this.getAvailabilities();
        this.updateTimes();
      },
      async getAvailabilities() {
        await AvailabilityServices.getPersonAvailability(this.user.userID)
        .then(response => {
          this.availabilities = response.data;

          for (let index = 0; index < this.availabilities.length; ++index) {
            //format date
            let element = this.availabilities[index];
            let formattedDate = element.date.toString().substring(5,10) + "-" + element.date.toString().substring(0,4);
            this.availabilities[index].date = formattedDate;

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
            this.availabilities[index].startTime = formattedST;

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
            this.availabilities[index].endTime = formattedET;
          } 
           
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
      // don't need this since we can get all needed info from the store by using Utils
    // async getPerson() {
    //   if (this.$store.state.loginUser.userID !== undefined && this.$store.state.loginUser !== null) {
    //     await PersonServices.getPerson(this.$store.state.loginUser.userID)
    //       .then(response => {
    //         this.person = response.data;
  
    //         return;
    //       })
    //       .catch(error => {
    //         console.log("There was an error:", error.response)
    //       });
    //   }
    // },
    getGroupByName(name) {
      GroupServices.getGroupByName(name)
      .then((response) => {
        this.group = response.data[0]
        // console.log(this.group)
        this.getTopicsForGroup()
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getTopicsForGroup() {
      TopicServices.getTopicByGroupForPerson(this.group.id, this.user.userID)
      .then(response => {
        this.topics = response.data
        LocationServices.getAllForGroup(this.group.id).then(response => {
          this.locations = response.data
        })
      })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },

    allowedStep: m => m % 30 === 0,

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
