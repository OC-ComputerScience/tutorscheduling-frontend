<template>
<div>
  <v-container>
<div>
  <v-toolbar>
    <v-toolbar-title>Add Availability</v-toolbar-title>
  </v-toolbar>
  <br><br>
  <v-row>
    <v-col
      cols="12"
      sm="6"
    >
      <v-date-picker
        v-model="dates"
        multiple
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
          multiple
          no-title
          scrollable
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
      <v-menu
        ref="menu"
        v-model="menu2"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="startTime"
            label="Start Time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="menu2"
          v-model="startTime"
          full-width
          :allowed-minutes="this.allowedStep"
          @click:minute="$refs.menu.save(startTime)"
        ></v-time-picker>

        
      </v-menu>
    </v-col>
    <v-col
      cols="11"
      sm="5"
    >
      <v-menu
        ref="menu"
        v-model="menu3"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="endTime"
            label="End Time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="menu3"
          v-model="endTime"
          full-width
          @click:minute="$refs.menu.save(endTime)"
          :allowed-minutes="this.allowedStep"
        ></v-time-picker>

        
      </v-menu>
    </v-col>
    <v-btn
        color="success"
        class="mr-4"
        @click="addAvailability"
      >
        Save
      </v-btn>
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
import PersonServices from "@/services/personServices.js"
import GroupServices from "@/services/groupServices.js"
import TopicServices from "@/services/topicServices.js"
import LocationServices from "@/services/locationServices.js"
import AppointmentServices from "@/services/appointmentServices.js"
import PersonAppointmentServices from "@/services/personAppointmentServices.js"

  export default {
    name: 'App',
    components: {
    },
    data: () => ({
      availability: {},
      appointment: {},
      personAppointment: {},
      availabilities: [],
      dates: [],
      dialog: false,
      dialogDelete: false,
      startTime: null,
      endTime: null,
      menu: false,
      menu2: false,
      menu3: false,
      menu4: false,
      menu5: false,
      person: {},
      user: {},
      group: {},
      topic: {},
      location: {},
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
      this.getPerson()
      .then(() => {
        this.getAvailabilities()
        this.user = this.$store.state.loginUser
        this.getGroupByName(this.user.selectedGroup.replace(/%20/g, " "))
      })
      // console.log(this.person);
      // this.getAvailabilities();

    },
    methods: {
    async addAvailability() {
      for (var i = 0; i < this.dates.length; i++) {
        let element = this.dates[i];
        this.availability.date = element;
        this.availability.startTime = this.startTime;
        this.availability.endTime = this.endTime;
        this.availability.personId = this.person.id;
        await AvailabilityServices.addAvailability(this.availability)
        .then(async ()=> {
          let date = new Date(element)
          date.setHours(date.getHours() + 5)
          this.appointment.date = date
          this.appointment.startTime = this.startTime
          this.appointment.endTime = this.endTime
          this.appointment.type = this.person.fName + " " + this.person.lName
          this.appointment.status = "available"
          this.appointment.groupId = this.group.id
          this.appointment.locationId = this.location.id
          this.appointment.topicId = this.topic.id
          await AppointmentServices.addAppointment(this.appointment).then(async response => {
            this.personAppointment.isTutor = true
            this.personAppointment.personId = this.person.id
            this.personAppointment.appointmentId = response.data.id
            await PersonAppointmentServices.addPersonAppointment(this.personAppointment)
          })
        })
        .catch((error) => {
          console.log(error);
        });
      }

      this.$router.go();
      
    },
    getAvailabilities() {
        AvailabilityServices.getPersonAvailability(this.person.id)
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
          console.log("There was an error:", error.response)
        });
      },
    async getPerson() {
      if (this.$store.state.loginUser.userID !== undefined && this.$store.state.loginUser !== null) {
        await PersonServices.getPerson(this.$store.state.loginUser.userID)
          .then(response => {
            this.person = response.data;
  
            return;
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
      }
    },
    getGroupByName(name) {
      GroupServices.getGroupByName(name)
      .then((response) => {
        this.group = response.data[0]
        console.log(this.group)
        this.getTopicsForGroup()
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
    },
    getTopicsForGroup() {
      TopicServices.getTopicForPerson(this.person.id)
      .then(response => {
        this.topic = response.data[0]
        console.log(this.topic)
        LocationServices.getAllForGroup(this.group.id).then(response => {
          this.location = response.data[0]
          console.log(this.location)
        })
      })
      .catch(error => {
        console.log("There was an error:", error.response)
      });
    },

    allowedStep: m => m % 30 === 0,

    // popup functions
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