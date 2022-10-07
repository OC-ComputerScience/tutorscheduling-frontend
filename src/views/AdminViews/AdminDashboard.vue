<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>Admin</v-toolbar-title>
      </v-toolbar>
      <br>
      <br>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title>
              Upcoming Appointment Info - {{ this.user.selectedGroup }}
              <v-spacer></v-spacer>
            </v-card-title>
            <apexchart
              ref="chart"
              width="500"
              type="bar"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </v-card>
        </v-col>
        <v-col>
          <v-row justify="center">
            <v-col md="6">
              <v-card
                :to="{ name: 'requestList' }"
                class="mx-auto my-10 d-flex justify-center"
                max-width="700"
                height="200"
                elevation="10"
                color="accent"
              >
                <v-card-title class="justify-left white--text">
                  STUDENT REQUESTS
                  <br />
                  {{ receivedrequests }} Received <br />{{
                    inprogressrequests
                  }}
                  In-Progress <br />{{ completerequests }} Complete <br />{{
                    requestnum
                  }}
                  Total
                </v-card-title>
              </v-card>
            </v-col>
            <v-col md="6">
              <v-card
                :to="{ name: 'pendingList' }"
                class="mx-auto my-10 d-flex justify-center"
                max-width="700"
                height="200"
                elevation="10"
                color="accent"
              >
                <v-card-title class="justify-center white--text">
                  TUTOR APPLICATIONS
                  <br />
                  {{ unapprovednum }} Unapproved
                  <br />
                  <br />
                  <br />
                  <br />
                  <br />
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col>
      <v-card class="tutor">
        <v-card-title>
          Tutors For Week Starting {{ current_week }}
          <v-spacer></v-spacer>
        </v-card-title>
        <v-data-table
          :headers="tutorTable"
          :search="search"
          :items="tutors"
          :items-per-page="50"
        ></v-data-table>
      </v-card>
      <br />
        </v-col>
        <v-col>
      <v-card class="tutor">
        <v-card-title>
          Topics For Week Starting {{ current_week }}
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-text>
          <b>Please note that these are possible hours of topics, not exact.</b>
        </v-card-text>
        <v-data-table
          :headers="topicTable"
          :search="search"
          :items="topics"
          :items-per-page="50"
        ></v-data-table>
      </v-card>
        </v-col>
        </v-row>

      <br /><br />
    </v-container>
  </div>
</template>

<script src='//cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.min.js'></script>
<script src='//unpkg.com/vue-chartjs@2.6.0/dist/vue-chartjs.full.min.js'></script>
<script src='//cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.js'></script>
<script src='//unpkg.com/hchs-vue-charts@1.2.8'></script>

<script>
import Utils from "@/config/utils.js";
import AppointmentServices from "@/services/appointmentServices.js";
import RequestServices from "@/services/requestServices.js";
import TopicServices from "@/services/topicServices.js";
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import "@/plugins/apexcharts";

export default {
  props: ["id"],
  name: "App",
  components: {
  },
  data() {
    return {
      series: [],
      chartOptions: {
        chart: {
          type: "bar",
          height: 350,
          stacked: true,
          toolbar: {
            show: true,
          },
        },
        xaxis: {
          categories: []
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: "bottom",
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10,
          },
        },
        legend: {
          position: "right",
          offsetY: 40,
        },
        fill: {
          opacity: 1,
        },
      },
      loaded: false,
      dataentry: null,
      datalabel: null,
      search: "",

      // user and group info
      user: {},
      group: {},

      // current requests and availability
      requests: {},
      availability: {},

      // current numbers
      receivedrequests: 0,
      completerequests: 0,
      inprogressrequests: 0,
      unapprovednum: 0,
      requestnum: 0,

      // table info
      current_week: [],
      weeklist: [],
      weeks: [],
      tutors: [],
      topics: [],
      appointments: [],
      appt_count: [],
      available_count: [],
      hour_count: [],
      complete_count: [],
      no_show_count: [],
      booked_count: [],
      week: [],
      hour_series: [],

      // table headers
      appointmentTable: [
        { text: "Week starting", value: "week" },
        { text: "# Appointments", value: "appointmentNum" },
        { text: "# Hours", value: "hours" },
        { text: "# Hours Scheduled", value: "scheduledAppointments" },
        { text: "# Hours Completed", value: "completedAppointments" },
        { text: "# Hours No Showed", valud: "noShowAppointments" }
      ],
      tutorTable: [
        { text: "Name", value: "name" },
        { text: "# Appts", value: "apptCount" },
        { text: "# Total Hours", value: "diff" },
        { text: "# Hours to Pay", value: "hours_paying" },
      ],
      topicTable: [
        { text: "Topic Name", value: "name" },
        { text: "# Hours available", value: "diff" },
      ],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId()
    .then(() => {
      this.setWeeks();
      this.setTutorHours();
      this.getTopics();
      this.getRequests();
      this.getTutorApplications();
    });
  },
  methods: {
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
      .then(async (response) => {
        this.group = response.data[0].role.group
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    async addData() {
      this.dataset.push(this.dataentry);
      this.labels.push(this.datalabel);
      this.datalabel = "";
      this.dataentry = "";
    },
    async setWeeks() {
      await this.setWeekList();
      var totalHourList = [];
      var totalAvailableList = [];
      var totalBookedList = [];
      var totalCompleteList = [];
      var totalNoShowList = [];

      for (let index = 0; index < this.weeklist.length; ++index) {
        var currWeek = "";
        var apptCount = "";
        var hourCount = "";
        var availableCount = "";
        var bookedCount = "";
        var completeCount = "";
        var noShowCount = "";

        let element = this.weeklist[index];
        await AppointmentServices.getAppointmentHourCount(this.group.id, element)
        .then((responseHour) => {
          currWeek = element.slice(0, 10);
          apptCount = responseHour.data[0].count;
          hourCount = responseHour.data[0].diff;
          availableCount = responseHour.data[0].available;
          bookedCount = responseHour.data[0].booked;
          completeCount = responseHour.data[0].complete;
          noShowCount = responseHour.data[0].noshow;

          if (index == 1) {
            this.week = currWeek;
            this.appt_count = apptCount;
            this.hour_count = hourCount;
            this.available_count = availableCount;
            this.booked_count = bookedCount;
            this.complete_count = completeCount;
            this.no_show_count = noShowCount;

            this.hour_series = [
              parseInt(availableCount),
              parseInt(bookedCount),
              parseInt(completeCount),
              parseInt(noShowCount)
            ];
            this.loaded = true;
          }
        })
        .catch((error) => {
          console.log(
            "There was an error getting hour count:",
            error.responseHour
          );
        });

        this.weeks.push({
          week: currWeek,
          appointmentNum: await this.checkNum(apptCount),
          hours: await this.checkHours(hourCount),
          availableAppointments: await this.checkHours(availableCount),
          completedAppointments: await this.checkHours(completeCount),
          scheduledAppointments: await this.checkHours(bookedCount)
        });
        
        totalHourList.push(hourCount);
        totalAvailableList.push(availableCount);
        totalBookedList.push(bookedCount);
        totalCompleteList.push(completeCount);
        totalNoShowList.push(noShowCount);
      }
      this.series.push(
        JSON.parse(
          "{" +
            '"name": "Total Hours",' +
            '"data": [' +
            (await this.numifyHours(totalHourList[0])) +
            ", " +
            (await this.numifyHours(totalHourList[1])) +
            ", " +
            (await this.numifyHours(totalHourList[2])) +
            "]" +
          "}"
        )
      );

      this.series.push(
        JSON.parse(
          "{" +
            '"name": "Hours Available",' +
            '"data": [' +
            (await this.numifyHours(totalAvailableList[0])) +
            ", " +
            (await this.numifyHours(totalAvailableList[1])) +
            ", " +
            (await this.numifyHours(totalAvailableList[2])) +
            "]" +
            "}"
        )
      );

      this.series.push(
        JSON.parse(
          '{"' +
            'name": "Hours Booked",' +
            '"data": [' +
            (await this.numifyHours(totalBookedList[0])) +
            ", " +
            (await this.numifyHours(totalBookedList[1])) +
            ", " +
            (await this.numifyHours(totalBookedList[2])) +
            "]" +
            "}"
        )
      );

      this.series.push(
        JSON.parse(
          "{" +
            '"name": "Hours Completed",' +
            '"data": [' +
            (await this.numifyHours(totalCompleteList[0])) +
            ", " +
            (await this.numifyHours(totalCompleteList[1])) +
            ", " +
            (await this.numifyHours(totalCompleteList[2])) +
            "]" +
            "}"
        )
      );

      this.series.push(
        JSON.parse(
          "{" +
            '"name": "No-Show Hours",' +
            '"data": [' +
            (await this.numifyHours(totalNoShowList[0])) +
            ", " +
            (await this.numifyHours(totalNoShowList[1])) +
            ", " +
            (await this.numifyHours(totalNoShowList[2])) +
            "]" +
            "}"
        )
      );

      this.$refs.chart.updateOptions({
        xaxis: {
          categories: [this.weeklist[0], this.weeklist[1], this.weeklist[2]]
        }
      })
    },
    async setTutorHours() {
      await this.setWeekList();
      var currWeek = this.current_week.slice(0, 10);
      await PersonServices.getHoursPerTutor(this.group.id, currWeek)
      .then((responseHour) => {
        this.tutors = responseHour.data;
      })
      .catch((error) => {
        console.log(
          "There was an error getting hour count: ",
          error
        );
      });
      for(let i = 0; i < this.tutors.length; i++) {
        this.tutors[i].name = `${this.tutors[i].fName} ${this.tutors[i].lName}`
        this.tutors[i].apptCount = await this.checkNum(this.tutors[i].apptCount)
        this.tutors[i].diff = await this.checkHours(this.tutors[i].diff)
        this.tutors[i].hours_paying = await this.checkHours(this.tutors[i].hours_paying)
      }
    },

    async getTopics() {
      await this.setWeekList();
      var currWeek = this.current_week.slice(0, 10);
      await TopicServices.getHoursPerTopic(this.group.id, currWeek)
      // await AppointmentServices.getTopicHourCount(this.group.id, currWeek)
      .then((responseHour) => {
        this.topics = responseHour.data
        console.log(this.topics)
      })
      .catch((error) => {
        console.log(
          "There was an error getting topic hour count: ",
          error
        );
        console.log(error.response)
      });

      for(let i = 0; i < this.topics.length; i++) {
        this.topics[i].diff = await this.checkHours(this.topics[i].diff)
      }

    },
    async setWeekList() {
      var currentDate = new Date();      
      var tempPrev = this.getPreviousSunday(new Date(await this.getPrevWeek(currentDate)));
      var prev = await this.toSQLDate(tempPrev)
      var current = await this.toSQLDate(this.getPreviousSunday(currentDate));
      var tempNext = this.getPreviousSunday(new Date(await this.getNextWeek(currentDate)));
      var next = await this.toSQLDate(tempNext);
      this.weeklist = [prev, current, next];
      this.current_week = current;
    },
    getPreviousSunday(date) {
      // not sure why it's monday but this works
      const previousMonday = new Date();
      previousMonday.setDate(date.getDate() - date.getDay());
      // if adding to new week makes the new date bigger than the previous date, subtract a month
      if(previousMonday > date)
        previousMonday.setMonth(previousMonday.getMonth() - 1)
      previousMonday.setHours(0, 0, 0, 0);
      return previousMonday;
    },
    async getNextWeek(week) {
      var date = new Date(week.getTime() + 7 * 24 * 60 * 60 * 1000);
      var next = await this.toSQLDate(date);
      return next;
    },
    async getPrevWeek(week) {
      var date = new Date(week.getTime() - 7 * 24 * 60 * 60 * 1000);
      var prev = await this.toSQLDate(date);
      return prev;
    },
    async toSQLDate(day) {
      var date = day.toISOString().slice(0, 19).replace("T", " ").slice(0, 10);
      return date;
    },
    async checkNum(num) {
      if (!num) {
        return 0 + " total";
      }
      return num + " total";
    },
    async checkHours(hours) {
      if (!hours) {
        return 0;
      }
      var total = await this.toHoursAndMinutes(hours);
      return total;
    },
    async numifyHours(hours) {
      if (!hours) {
        return 0;
      }
      var total = await this.toHours(hours);
      return total;
    },
    async toHours(totalMinutes) {
      var hours = Math.floor(parseInt(totalMinutes) / parseFloat(60));

      return hours;
    },
    async toHoursAndMinutes(totalMinutes) {
      var minutes = parseInt(totalMinutes) % 60;
      var hours = Math.floor(parseInt(totalMinutes) / 60);

      return hours + " hr " + minutes + " min";
    },
    async getTutorApplications() {
      await PersonServices.getPendingTutorsForGroup(this.group.id) 
      .then((response) => {
        this.unapprovednum = response.data.length;
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
          let request = this.requests[index];
          this.requestnum++;
          if (request.status === "In-Progress") {
            this.inprogressrequests++;
          } else if (request.status === "Received") {
            this.receivedrequests++;
          } else if (request.status === "Complete") {
            this.completerequests++;
          }
        }
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
    },
  },
};
</script>