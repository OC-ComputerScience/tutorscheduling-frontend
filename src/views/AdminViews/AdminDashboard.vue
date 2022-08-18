<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>Admin</v-toolbar-title>
      </v-toolbar>
      <v-row justify="center">
        <v-col md="4">
          <v-card
            :to="{ name: 'requestList' }"
            class="mx-auto my-10 d-flex justify-center"
            max-width="400"
            height="200"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-left white--text">
              STUDENT
              <br />
              REQUESTS
            </v-card-title>
            <v-card-title class="justify-center white--text">
              <ul>
                <li>{{ receivedrequests }} Received</li>
                <li>{{ inprogressrequests }} In-Progress</li>
                <li>{{ completerequests }} Complete</li>
                <li>{{ requestnum }} total</li>
              </ul>
            </v-card-title>
          </v-card>
        </v-col>
        <v-col md="4">
          <v-card
            :to="{ name: 'requestList' }"
            class="mx-auto my-10 d-flex justify-center"
            max-width="400"
            height="200"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-center white--text">
              TUTOR
              <br />
              APPLICATIONS
            </v-card-title>
            <v-card-title class="justify-center white--text">
              <ul>
                <li>{{ unapprovednum }} Unapproved</li>
              </ul>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="4">
          <v-card
            :click="displayApointments()"
            class="mx-auto my-10 d-flex justify-center"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-left white--text">
              View Appointment Info
            </v-card-title>
          </v-card> </v-col
        ><v-col md="4">
          <v-card
            :click="displayTutors()"
            class="mx-auto my-10 d-flex justify-center"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-left white--text">
              View Tutor Info
            </v-card-title>
          </v-card> </v-col
        ><v-col md="4">
          <v-card
            :click="displayTopics()"
            class="mx-auto my-10 d-flex justify-center"
            elevation="10"
            color="accent"
          >
            <v-card-title class="justify-left white--text">
              View Topic Info
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-card v-if="!hide" class="tutor hide">
        <v-card-title>
          Upcoming Appointment Info
          <v-spacer></v-spacer>
        </v-card-title>
        <v-data-table
          :headers="appointmentTable"
          :search="search"
          :items="appointments"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>
      <br />
      <v-card v-if="!hide" class="tutor hide">
        <v-card-title>
          Tutor Info
          <v-spacer></v-spacer>
        </v-card-title>
        <v-data-table
          :headers="tutorTable"
          :search="search"
          :items="appointments"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>
      <br />

      <v-card v-if="!hide" class="tutor hide">
        <v-card-title>
          Topic Info
          <v-spacer></v-spacer>
        </v-card-title>
        <v-data-table
          :headers="topicTable"
          :search="search"
          :items="appointments"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>

      <br /><br />
      <div id="app">
        <section class="container">
          <div class="columns">
            <div class="column">
              <chartjs-bar
                :labels="labels"
                :data="dataset"
                :bind="true"
              ></chartjs-bar>
            </div>
          </div>
        </section>
      </div>
    </v-container>
  </div>
</template>

<script src='//cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.min.js'></script>
<script src='//unpkg.com/vue-chartjs@2.6.0/dist/vue-chartjs.full.min.js'></script>
<script src='//cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.js'></script>
<script src='//unpkg.com/hchs-vue-charts@1.2.8'></script>
    <script >
"use strict";

Vue.use(VueCharts);
var app = new Vue({
  el: "#app",
  data: function data() {
    return {
      dataentry: null,
      datalabel: null,
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      dataset: [5, 10, 15, 25, 45, 70, 115, 185, 70, 75, 70, 60],
    };
  },

  methods: {
    addData: function addData() {
      this.dataset.push(this.dataentry);
      this.labels.push(this.datalabel);
      this.datalabel = "";
      this.dataentry = "";
    },
  },
});
</script>
<script>
import Utils from "@/config/utils.js";
import AppointmentServices from "@/services/appointmentServices.js";
import AvailabilityServices from "@/services/availabilityServices.js";
import GroupServices from "@/services/groupServices.js";
import RequestServices from "@/services/requestServices.js";

export default {
  props: ["id"],
  name: "App",
  watch: {
    id: function () {
      console.log(this.id);
    },
  },
  components: {},
  data() {
    return {
      search: "",
      user: {},
      group: {},
      requests: {},
      availability: {},
      receivedrequests: 0,
      completerequests: 0,
      inprogressrequests: 0,
      unapprovednum: 0,
      requestnum: 0,
      appointments: [],

      // table info
      weeks: {},
      tutors: {},
      appointmentTable: [
        { text: "Week", value: "date" },
        { text: "# Appointments", value: "date" },
        { text: "# Hours", value: "topic.name" },
        { text: "# Scheduled Appointments", value: "topic.name" },
        { text: "# Completed Appointments", value: "topic.name" },
      ],
      tutorTable: [
        { text: "Topic", value: "topic.name" },
        { text: "Number of appts", value: "date" },
        { text: "Topic", value: "topic.name" },
      ],
      topicTable: [
        { text: "Topic", value: "topic.name" },
        { text: "Number of appts", value: "date" },
        { text: "Topic", value: "topic.name" },
      ],
      headers: [
        { text: "Date", value: "date" },
        { text: "Start Time", value: "startTime" },
        { text: "End Time", value: "endTime" },
        { text: "Topic", value: "topic.name" },
      ],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroup(this.user.selectedGroup.replace(/%20/g, " ")).then(
      () => {
        this.getAppointmentsForGroup();
        this.getRequests();
        this.getAvailabilities();
      }
    );
  },
  methods: {
    async getGroup(name) {
      await GroupServices.getGroupByName(name)
        .then((response) => {
          this.group = response.data[0];
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async getAvailabilities() {
      await AvailabilityServices.getAllAvailabilities()
        .then((response) => {
          this.availabilities = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async getRequests() {
      await RequestServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.requests = response.data;
          for (let index = 0; index < this.requests.length; ++index) {
            let request = this.requests.length;
            this.requestnum = this.requestnum + 1;
            if (request.status === "in-progress") {
              this.inprogressrequests = this.inprogressrequests + 1;
            } else if (request.status === "received") {
              this.receivedrequests = this.receivedrequests + 1;
            } else if (request.status === "complete") {
              this.completerequests = this.completerequests + 1;
            }
          }
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async getAppointmentsForGroup() {
      await AppointmentServices.getUpcomingAppointmentForGroup(this.group.id)
        .then((response) => {
          this.appointments = response.data;

          for (let index = 0; index < this.appointments.length; ++index) {
            let element = this.appointments[index];
            // set unapproved number to display
            if (element.status === "applied") {
              this.unapprovednum = this.unapprovednum + 1;
            }

            //format date
            let formattedDate =
              element.date.toString().substring(5, 10) +
              "-" +
              element.date.toString().substring(0, 4);
            this.appointments[index].date = formattedDate;
            // format start time
            let modST = element.startTime.toString().substring(0, 2) % 12;
            let formattedST =
              modST + ":" + element.startTime.toString().substring(3, 5);
            if (element.startTime.toString().substring(0, 2) > 12) {
              formattedST = formattedST + " P.M.";
            } else if (
              modST == 0 &&
              element.startTime.toString().substring(0, 2) == "12"
            ) {
              formattedST =
                "12:" + element.startTime.toString().substring(3, 5) + " P.M.";
            } else if (modST == 0) {
              formattedST =
                "12:" + element.startTime.toString().substring(3, 5) + " A.M.";
            } else {
              formattedST = formattedST + " A.M.";
            }
            this.appointments[index].startTime = formattedST;
            // format end time
            let modET = element.endTime.toString().substring(0, 2) % 12;
            let formattedET =
              modET + ":" + element.endTime.toString().substring(3, 5);
            if (element.endTime.toString().substring(0, 2) > 12) {
              formattedET = formattedET + " P.M.";
            } else if (
              modET == 0 &&
              element.endTime.toString().substring(0, 2) == "12"
            ) {
              formattedET =
                "12:" + element.endTime.toString().substring(3, 5) + " P.M.";
            } else if (modET == 0) {
              formattedET =
                "12:" + element.endTime.toString().substring(3, 5) + " A.M.";
            } else {
              formattedET = formattedET + " A.M.";
            }
            this.appointments[index].endTime = formattedET;
          }
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    displayApointments: function () {
      document.getElementsByClassName("tutors").hide = true;
      document.getElementsByClassName("topics").hide = true;
      document.getElementsByClassName("appointments").hide = false;
    },
    displayTutors: function () {
      document.getElementsByClassName("topics").hide = true;
      document.getElementsByClassName("appointments").hide = true;
      document.getElementsByClassName("tutors").hide = false;
    },
    displayTopics: function () {
      document.getElementsByClassName("appointments").hide = true;
      document.getElementsByClassName("tutors").hide = true;
      document.getElementsByClassName("topics").hide = false;
    },
    rowClick: function (item, row) {
      row.select(true);
      //this.$router.push({ name: 'appointmentView', params: { id: item.id } });
    },
  },
};
</script>