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
      <v-row justify="center">
        <v-col justify="center">
          <v-card>
            <v-card-title>
              Upcoming Appointment Info - {{ this.user.selectedGroup }}
              <v-spacer></v-spacer>
            </v-card-title>
            <apexchart
              ref="chart"
              width="700"
              type="bar"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </v-card>
        </v-col>
        <v-col justify="center">
          <v-row justify="center">
            <!-- <v-col md="6"> -->
              <v-card
                :to="{ name: 'requestList' }"
                class="mx-auto my-3 justify-center"
              >
                <v-card-title>
                  Student Requests
                </v-card-title>
                <apexchart
                  width="380"
                  type="pie"
                  :options="pieOptions"
                  :series="pieSeries"
                ></apexchart>
                <br>
              </v-card>
            </v-row>
            <v-row justify="center">
            <!-- </v-col>
            <v-col md="6"> -->
              <v-card
                :to="{ name: 'pendingList' }"
                class="mx-auto my-5 justify-center"
              >
                <v-card-title>
                  Tutor Applications
                </v-card-title>
                <v-card-text class="text-center">
                  <h1>{{ unapprovednum }}</h1>
                </v-card-text>
              </v-card>
            <!-- </v-col> -->
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
      pieSeries: [],
      chartOptions: {
        chart: {
          type: "bar",
          height: 350,
          stacked: true,
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
        colors: ['#757575', '#9C27B0', '#F8C545', '#196CA2', '#4CAF50', '#EE5044'],
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        legend: {
          position: "top",
          // offsetY: 40,
        },
        fill: {
          opacity: 1,
        },
      },
      pieOptions: {
        chart: {
          width: 380,
          type: 'pie',
        },
        colors: ['#EE5044', '#F8C545', '#4CAF50'],
        labels: ['Received', 'In-Progress', 'Complete'],
        dataLabels: {
          enabled: true,
          formatter: function (val, opts) {
            return opts.w.config.series[opts.seriesIndex]
          },
        },
        legend: {
          position: "bottom",
        },
        fill: {
          opacity: 1,
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0,
            },
          }
        }]
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
      group_count: [],
      pending_count: [],
      hour_count: [],
      complete_count: [],
      no_show_count: [],
      booked_count: [],
      week: [],

      // table headers
      tutorTable: [
        { text: "Name", value: "name" },
        { text: "# Appointments", value: "apptCount" },
        { text: "# Total Hours", value: "hours" },
        { text: "# Hours to Pay", value: "payingHours" },
      ],
      topicTable: [
        { text: "Topic Name", value: "name" },
        { text: "# Booked Hours", value: "hours" },
        { text: "# Potential Hours", value: "potentialHours" },
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
      var totalGroupList = []
      var totalPendingList = [];
      var totalBookedList = [];
      var totalCompleteList = [];
      var totalNoShowList = [];

      for (let index = 0; index < this.weeklist.length; ++index) {
        var currWeek = "";
        var apptCount = "";
        var hourCount = "";
        var availableCount = "";
        var groupCount = "";
        var pendingCount = "";
        var bookedCount = "";
        var completeCount = "";
        var noShowCount = "";

        let element = this.weeklist[index];
        await AppointmentServices.getAppointmentHourCount(this.group.id, element)
        .then((responseHour) => {
          currWeek = element.slice(0, 10);
          apptCount = responseHour.data[0].count;
          hourCount = responseHour.data[0].hours;
          availableCount = responseHour.data[0].available;
          groupCount = responseHour.data[0].group;
          pendingCount = responseHour.data[0].pending;
          bookedCount = responseHour.data[0].booked;
          completeCount = responseHour.data[0].complete;
          noShowCount = responseHour.data[0].noshow;

          if (index == 1) {
            this.week = currWeek;
            this.appt_count = apptCount;
            this.hour_count = hourCount;
            this.available_count = availableCount;
            this.group_count = groupCount
            this.pending_count = pendingCount;
            this.booked_count = bookedCount;
            this.complete_count = completeCount;
            this.no_show_count = noShowCount;

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
        totalGroupList.push(groupCount)
        totalPendingList.push(pendingCount)
        totalBookedList.push(bookedCount);
        totalCompleteList.push(completeCount);
        totalNoShowList.push(noShowCount);
      }
      // this.series.push(
      //   JSON.parse(
      //     "{" +
      //       '"name": "Total Hours",' +
      //       '"data": [' +
      //       (await this.numifyHours(totalHourList[0])) +
      //       ", " +
      //       (await this.numifyHours(totalHourList[1])) +
      //       ", " +
      //       (await this.numifyHours(totalHourList[2])) +
      //       "]" +
      //     "}"
      //   )
      // );

      this.series.push(
        JSON.parse(
          "{" +
            '"name": "Private Available",' +
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
          "{" +
            '"name": "Group Available",' +
            '"data": [' +
            (await this.numifyHours(totalGroupList[0])) +
            ", " +
            (await this.numifyHours(totalGroupList[1])) +
            ", " +
            (await this.numifyHours(totalGroupList[2])) +
            "]" +
            "}"
        )
      );

      this.series.push(
        JSON.parse(
          "{" +
            '"name": "Pending",' +
            '"data": [' +
            (await this.numifyHours(totalPendingList[0])) +
            ", " +
            (await this.numifyHours(totalPendingList[1])) +
            ", " +
            (await this.numifyHours(totalPendingList[2])) +
            "]" +
            "}"
        )
      );

      this.series.push(
        JSON.parse(
          '{"' +
            'name": "Booked",' +
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
            '"name": "Completed",' +
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
            '"name": "No-Show",' +
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
        console.log(this.series)

      this.$refs.chart.updateOptions({
        xaxis: {
          categories: [this.weeklist[0], this.weeklist[1], this.weeklist[2]]
        },
        decimalsInFloat: 1
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
        this.tutors[i].hours = await this.checkHours(this.tutors[i].hours)
        this.tutors[i].payingHours = await this.checkHours(this.tutors[i].payingHours)
      }

      this.tutors.sort(function (a, b) {
          if (a.fName < b.fName) {
            return -1;
          }
          if (a.fName > b.fName) {
            return 1;
          }
          return 0;
        });
    },

    async getTopics() {
      await this.setWeekList();
      var currWeek = this.current_week.slice(0, 10);
      await TopicServices.getHoursPerTopic(this.group.id, currWeek)
      .then((responseHour) => {
        this.topics = responseHour.data
      })
      .catch((error) => {
        console.log(
          "There was an error getting topic hour count: ",
          error
        );
      });

      for(let i = 0; i < this.topics.length; i++) {
        this.topics[i].hours = await this.checkHours(this.topics[i].hours)
        this.topics[i].potentialHours = await this.checkHours(this.topics[i].potentialHours)
      }

      this.topics.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
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
        return "00:00";
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
      minutes = (minutes < 10 ? '0' : '') + minutes;
      var hours = Math.floor(parseInt(totalMinutes) / 60);
      hours = (hours < 10 ? '0' : '') + hours;

      return hours + ":" + minutes;
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

        this.pieSeries.push(this.receivedrequests)
        this.pieSeries.push(this.inprogressrequests)
        this.pieSeries(this.completerequests)
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });

    },
  },
};
</script>