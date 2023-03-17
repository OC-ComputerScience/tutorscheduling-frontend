<template>
  <div>
    <v-container>
      <v-card-title
        class="text-h4 font-weight-bold pt-4 pb-6 pl-0 pr-0 accent--text"
        >{{ title }}
        <InformationComponent
          message="Select an appointment to view information, book the appointment,
            make changes, etc.
            You can filter the appointments by a desired Topic or Tutor."
        ></InformationComponent
        ><v-spacer></v-spacer>
        <v-card-title class="text-right pt-0 pb-0 pl-0 pr-0 accent--text">{{
          role.type
        }}</v-card-title>
      </v-card-title>
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        alert
      }}</v-alert>
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="64">
            <v-toolbar flat>
              <!-- Sets focus to current date -->
              <v-btn
                outlined
                class="mr-4"
                color="grey darken-2"
                @click="viewMonth()"
              >
                Today
              </v-btn>
              <!-- Navigates calendar forward and back -->
              <v-btn fab text small color="grey darken-2" @click="prev()">
                <v-icon small> mdi-chevron-left </v-icon>
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="next()">
                <v-icon small> mdi-chevron-right </v-icon>
              </v-btn>
              <!-- Shows current month and year displayed on calendar -->
              <v-toolbar-title v-if="$refs.calendar">
                {{ $refs.calendar.title }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-col cols="3" align-self="start">
                <v-select
                  v-model="selectedTopic"
                  dense
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
                  v-model="selectedTutor"
                  dense
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
                right
                @click="keyVisible = true"
              >
                Key
              </v-btn>
              <!-- Dropdown menu to select format -->
              <!-- Will modify to only include relevant formats -->
              <v-menu bottom right>
                <template #activator="{ on, attrs }">
                  <v-btn
                    outlined
                    color="grey darken-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>mdi-menu-down</v-icon>
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
              :event-overlap-threshold="15"
              :type="type"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
            ></v-calendar>

            <!--Pop-up that appears when an event is selected -->

            <!-- add another v-menu for group session v private-->
            <v-dialog v-model="appointmentDialog" persistent max-width="800px">
              <AppointmentDialogBody
                :sent-appointment="selectedAppointment"
                @closeAppointmentDialog="appointmentDialog = false"
                @doneWithAppointment="
                  appointmentDialog = false;
                  initializeData();
                "
              ></AppointmentDialogBody>
            </v-dialog>
            <!-- <v-menu
              v-model="selectedOpen"
              :open-on-click="false"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
             
            </v-menu> -->
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="keyVisible" max-width="600px">
      <v-card>
        <v-card-title class="primary white--text mb-2"
          >Calendar Key
        </v-card-title>
        <v-card-text>
          <v-simple-table>
            <thead>
              <tr>
                <th class="text-left">Color</th>
                <th class="text-left">Status</th>
                <th class="text-left">Private</th>
                <th class="text-left">Group</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="info in keys" :key="info.color">
                <td>
                  <v-icon :color="info.color">mdi-circle</v-icon>
                </td>
                <td class="text-body-2">{{ info.text }}</td>
                <td>
                  <v-icon v-if="info.private" color="black"
                    >mdi-check-bold</v-icon
                  >
                </td>
                <td>
                  <v-icon v-if="info.group" color="black"
                    >mdi-check-bold</v-icon
                  >
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey white--text" @click="keyVisible = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64">
        Loading...
      </v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
//For info on appointments
// import AppointmentServices from "@/services/appointmentServices.js";
// import PersonAppointmentServices from "@/services/personAppointmentServices.js";
//For info on people and their associated roles
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonRolePrivilegeServices from "@/services/personRolePrivilegeServices.js";
// import RoleServices from "@/services/roleServices.js";
//For info to be shown with appointments
import TopicServices from "@/services/topicServices.js";
//Plugin functions
import Utils from "@/config/utils.js";
import AppointmentDialogBody from "../components/AppointmentDialogBody.vue";
import InformationComponent from "../components/InformationComponent.vue";
import { AppointmentActionMixin } from "../mixins/AppointmentActionMixin";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "Calendar",
  components: {
    AppointmentDialogBody,
    InformationComponent,
  },
  mixins: [AppointmentActionMixin, TimeFunctionsMixin],
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
  },
  data: () => ({
    showAlert: false,
    alert: "",
    alertType: "success",
    overlay: true,
    title: " Calendar",
    mode: "stack",
    appointments: [],
    selectedAppointment: {},
    events: [],
    user: {},
    role: {},
    group: {},
    personRolePrivileges: [],
    topics: [],
    tutorSelect: [],
    selectedTopic: -1,
    selectedTutor: -1,
    keyVisible: false,
    appointmentDialog: false,
    selectedElement: null,
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    keys: [
      {
        color: "grey",
        text: "Available",
        private: true,
        group: false,
      },
      {
        color: "yellow",
        text: "Pending",
        private: true,
        group: false,
      },
      {
        color: "error",
        text: "Canceled",
        private: true,
        group: true,
      },
      { color: "teal", text: "Available", private: false, group: true },
      { color: "blue", text: "Booked", private: true, group: true },
      {
        color: "darkblue",
        text: "Completed",
        private: true,
        group: true,
      },
    ],
  }),
  async created() {
    this.user = Utils.getStore("user");
    this.title = this.user.selectedGroup + this.title;
    this.role = this.user.selectedRole;
    await this.getPrivilegesForPersonRole();
    await this.getGroupByPersonRoleId();
    await this.getTopicsForGroup();
    await this.getTutorsForGroup();
    await this.initializeData();
  },
  methods: {
    async initializeData() {
      this.overlay = true;
      await this.getAppointmentsForGroup(this.group.id).then((response) => {
        this.appointments = response;
      });
      await this.loadAppointments();
      this.overlay = false;
    },
    async getPrivilegesForPersonRole() {
      await PersonRolePrivilegeServices.getPrivilegeByPersonRole(this.id)
        .then((response) => {
          this.personRolePrivileges = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getTopicsForGroup() {
      await TopicServices.getActiveForGroup(this.group.id)
        .then((response) => {
          let temp = response.data;
          this.topics.push({ name: "Any", id: -1 });
          for (let i = 0; i < temp.length; i++) {
            this.topics.push(temp[i]);
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getTutorsForGroup() {
      await PersonServices.getApprovedTutorsForGroup(this.group.id)
        .then((response) => {
          let temp = response.data;
          this.tutorSelect.push({ name: "Any", id: -1 });
          for (var i = 0; i < temp.length; i++) {
            temp[i].name = temp[i].fName + " " + temp[i].lName;
            this.tutorSelect.push(temp[i]);
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    viewMonth() {
      this.focus = "";
      this.type = "month";
    },
    getEventColor(event) {
      return event.color;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    //Animates Event card popping up
    async showEvent({ nativeEvent, event }) {
      const open = async () => {
        this.selectedAppointment = this.appointments.find(
          (appointment) => appointment.id == event.appointmentId
        );
        this.selectedAppointment.color = event.color;
        this.selectedAppointment.name = event.name;
        this.selectedAppointment.group = this.group;
        this.selectedAppointment.personRolePrivileges =
          this.personRolePrivileges;
        this.selectedAppointment.newStart = this.selectedAppointment.startTime;
        this.selectedAppointment.newEnd = this.selectedAppointment.endTime;
        if (
          this.selectedAppointment.type.includes("Private") &&
          this.selectedAppointment.status.includes("available") &&
          this.group.allowSplittingAppointments &&
          this.subtractTimes(
            this.selectedAppointment.startTime,
            this.selectedAppointment.endTime
          ) >= this.group.minApptTime
        ) {
          this.selectedAppointment.displayedStart = "";
          this.selectedAppointment.displayedEnd = "";
        } else {
          this.selectedAppointment.displayedStart =
            this.selectedAppointment.startTime;
          this.selectedAppointment.displayedEnd =
            this.selectedAppointment.endTime;
        }
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.appointmentDialog = true))
        );
      };
      if (this.appointmentDialog) {
        this.appointmentDialog = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }
      nativeEvent.stopPropagation();
    },
    checkTopic(appointment) {
      let check = false;
      if (this.selectedTopic === null) return true;
      if (this.selectedTopic === appointment.topicId) return true;
      if (
        appointment.topicId !== null &&
        this.selectedTopic !== appointment.topicId
      )
        return false;
      for (let i = 0; i < appointment.tutors.length && !check; i++) {
        let tutor = appointment.tutors[i];
        for (let j = 0; j < tutor.person.persontopic.length && !check; j++) {
          let tutorTopic = tutor.person.persontopic[j];
          if (tutorTopic.topicId === this.selectedTopic) {
            check = true;
          }
        }
      }
      return check;
    },
    checkTutor(appointment) {
      return (
        appointment.personappointment.find(
          (p) => p.personId === this.selectedTutor && p.isTutor
        ) !== undefined
      );
    },
    hasRole(type) {
      return (
        this.user.selectedRole.type !== null &&
        this.user.selectedRole.type === type
      );
    },
    getStudentNameForAppointment(appointment) {
      if (appointment.students.length > 0) {
        return (
          appointment.students[0].person.fName +
          " " +
          appointment.students[0].person.lName
        );
      } else return "Open";
    },
    getTutorNameForAppointment(appointment) {
      if (appointment.tutors.length > 0) {
        return (
          appointment.tutors[0].person.fName +
          " " +
          appointment.tutors[0].person.lName
        );
      } else return "Open";
    },
    async loadAppointments() {
      let today = new Date();
      today.setHours(today.getHours() - today.getTimezoneOffset() / 60);
      today.setHours(0, 0, 0, 0);
      this.overlay = true;
      const events = [];
      let filtered;
      for (let i = 0; i < this.appointments.length; i++) {
        let appointment = this.appointments[i];

        appointment.isMemberOfAppointment =
          this.checkPersonInAppointment(appointment);
        appointment.isStudent = this.checkStudentInAppointment(appointment);
        appointment.isTutor = this.checkTutorInAppointment(appointment);
        // await this.groupBookColor(this.appointments[i].personappointment);
        // await this.isStudentInGroupAppoint(this.appointments[i].students);
        // //filter events to only add appropriate events
        filtered = true;
        //only add appointments from the current group
        if (appointment.groupId != this.group.id) {
          filtered = false;
        }
        //filter by topic
        if (this.selectedTopic != -1 && !this.checkTopic(appointment)) {
          filtered = false;
        }
        //filter by tutor
        if (this.selectedTutor != -1 && !this.checkTutor(appointment)) {
          filtered = false;
        }
        //filter all available appointments, their appointments, and all group appointments for STUDENTS
        if (this.hasRole("Student")) {
          //filter away private appointments that aren't a student's
          if (
            appointment.type.includes("Private") &&
            !appointment.isStudent &&
            !(appointment.status === "available")
          ) {
            filtered = false;
          }
          //filter away group appointments that have passed that aren't a student's
          else if (
            appointment.type.includes("Group") &&
            !appointment.isStudent &&
            appointment.date < today.toISOString()
          ) {
            filtered = false;
          }
          //filter away canceled appointments
          else if (appointment.status.includes("Cancel")) {
            filtered = false;
          }
        }
        //filter their appointments, all available appointments, all group appointments, and their canceled appointments for TUTORS
        else if (this.hasRole("Tutor")) {
          //filter away canceled appointments that aren't theirs
          if (!appointment.isTutor && appointment.status.includes("Cancel")) {
            filtered = false;
          }
        }
        if (filtered) {
          //Format times for each event and need to set minutes for events too
          let startTime = new Date(appointment.date);
          let startTimes = appointment.startTime.split(":");
          startTime.setHours(startTime.getHours() + parseInt(startTimes[0]));
          startTime.setMinutes(
            startTime.getMinutes() + parseInt(startTimes[1])
          );
          let endTime = new Date(appointment.date);
          let endTimes = appointment.endTime.split(":");
          endTime.setHours(endTime.getHours() + parseInt(endTimes[0]));
          endTime.setMinutes(endTime.getMinutes() + parseInt(endTimes[1]));

          let event = {
            name: "",
            start: startTime,
            end: endTime,
            color: "",
            timed: true,
            appointmentId: appointment.id,
          };

          let studentName = this.getStudentNameForAppointment(appointment);
          let tutorName = this.getTutorNameForAppointment(appointment);

          //Set color for each event
          switch (appointment.status) {
            case "pending":
              event.color = "yellow";
              break;
            case "studentCancel" || "tutorCancel":
              event.color = "error";
              break;
            case "booked":
              event.color = "blue";
              break;
            case "complete":
              event.color = "darkblue";
              break;
            default:
              event.color = "grey";
              break;
          }

          if (
            appointment.type === "Group" &&
            !appointment.status.includes("Cancel")
          ) {
            if (appointment.isMemberOfAppointment) {
              event.color = "blue";
            } else {
              event.color = "teal";
            }
          }

          let topicName = appointment.topic ? appointment.topic.name : "Open";

          //Note the format of each event, what data is associated with it
          if (appointment.type === "Group") {
            if (appointment.status.includes("Cancel")) {
              event.name = `Group - Canceled by ${tutorName}`;
            } else {
              if (appointment.isTutor) {
                event.color = "grey";
              }
              event.name = `Group - ${topicName} Tutoring`;
            }
          } else if (appointment.type === "Private") {
            if (appointment.status === "available") {
              event.name = `${tutorName} - ${topicName} Tutoring`;
            } else if (!appointment.status.includes("Cancel")) {
              event.name = `${studentName} - ${topicName} Tutoring`;
            } else {
              if (appointment.status === "tutorCancel") {
                event.name = `Canceled by ${tutorName}`;
              } else if (appointment.status === "studentCancel") {
                event.name = `Canceled by ${studentName}`;
              }
            }
          }

          events.push(event);
        }
      }

      this.overlay = false;
      this.events = events;
    },
    checkStudentInAppointment(appointment) {
      return appointment.students.find((student) => {
        return student.personId === this.user.userID;
      });
    },
    checkTutorInAppointment(appointment) {
      return appointment.tutors.find((tutor) => {
        return tutor.personId === this.user.userID;
      });
    },
    checkPersonInAppointment(appointment) {
      return appointment.personappointment.find((person) => {
        return person.personId === this.user.userID;
      });
    },
  },
};
</script>
