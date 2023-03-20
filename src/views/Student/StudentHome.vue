<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ user.fName }}!</v-toolbar-title>
        <InformationComponent
          v-if="!disabled"
          message="Click on View Calendar to see available appointments!"
        ></InformationComponent>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>

      <v-container v-if="!disabled">
        <v-dialog v-model="appointmentDialog" persistent max-width="800px">
          <AppointmentDialogBody
            :sent-appointment="selectedAppointment"
            @closeAppointmentDialog="appointmentDialog = false"
            @doneWithAppointment="
              appointmentDialog = false;
              getAppointments();
            "
          ></AppointmentDialogBody>
        </v-dialog>
        <v-alert v-model="showAlert" dismissible :type="alertType">{{
          alert
        }}</v-alert>
        <v-row>
          <v-col>
            <v-card
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#EE5044"
              @click="
                handleRedundantNavigation(
                  'calendar',
                  user.selectedRole.personRoleId
                )
              "
            >
              <v-card-title class="justify-center white--text">
                View Calendar
              </v-card-title>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#F8C545"
              @click="
                handleRedundantNavigation(
                  'studentAddRequest',
                  user.selectedRole.personRoleId
                )
              "
            >
              <v-card-title class="justify-center white--text">
                Make A Request
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            Upcoming Appointments for {{ user.selectedGroup }} as a student
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to view information, make changes, or
              cancel."
            ></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="appointments"
            :items-per-page="50"
            @click:row="rowClick"
          ></v-data-table>
        </v-card>
        <br />
        <v-card>
          <v-card-title>
            Provide Appointment Feedback for {{ user.selectedGroup }}
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to provide feedback."
            ></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="headerFeedback"
            :items="appointmentsNeedingFeedback"
            :items-per-page="50"
            @click:row="provideFeedback"
          ></v-data-table>
        </v-card>
      </v-container>
      <v-container v-else>
        <h4>
          This role for {{ group.name }} has been disabled. Please contact the
          group admin for further questions.
        </h4>
      </v-container>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import AppointmentServices from "@/services/appointmentServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import AppointmentDialogBody from "../../components/AppointmentDialogBody.vue";
import InformationComponent from "../../components/InformationComponent.vue";
import { AppointmentActionMixin } from "../../mixins/AppointmentActionMixin";
import { RedirectToPageMixin } from "../../mixins/RedirectToPageMixin";
import { TimeFunctionsMixin } from "../../mixins/TimeFunctionsMixin";

export default {
  name: "StudentHome",
  components: {
    AppointmentDialogBody,
    InformationComponent,
  },
  mixins: [AppointmentActionMixin, RedirectToPageMixin, TimeFunctionsMixin],
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      user: {},
      group: {},
      showAlert: false,
      alert: "",
      alertType: "success",
      disabled: false,
      appointmentDialog: false,
      selectedAppointment: {},
      appointments: [],
      appointmentsNeedingFeedback: [],
      headers: [
        { text: "Date", value: "date" },
        { text: "Start Time", value: "startTime" },
        { text: "End Time", value: "endTime" },
        { text: "Topic", value: "topic.name" },
        { text: "Location", value: "location.name" },
        { text: "Status", value: "status" },
        { text: "Type", value: "type" },
        { text: "Tutors", value: "tutor" },
      ],
      headerFeedback: [
        { text: "Date", value: "date" },
        { text: "Start Time", value: "startTime" },
        { text: "End Time", value: "endTime" },
        { text: "Type", value: "type" },
      ],
      message: "Student",
    };
  },
  watch: {
    id: function () {
      console.log(this.id);
    },
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId();
    await this.getStudentRole();
    if (!this.disabled) {
      await this.getAppointments();
      await this.getAppointmentsNeedingFeedback();
      if (this.$route.query !== undefined) {
        for (let i = 0; i < this.appointments.length; i++) {
          if (
            this.appointments[i].id ===
            parseInt(this.$route.query.appointmentId)
          ) {
            this.selectedAppointment = this.appointments[i];
            await this.updatePeople();
            this.appointmentDialog = true;
            return;
          }
        }
      }
    }
  },
  methods: {
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
    async getAppointments() {
      await AppointmentServices.getUpcomingAppointmentsForStudent(
        this.group.id,
        this.user.userID
      )
        .then(async (response) => {
          this.appointments = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });

      for (let i = 0; i < this.appointments.length; i++) {
        let appointment = this.appointments[i];
        if (
          appointment.personappointment !== null &&
          appointment.personappointment !== undefined
        ) {
          appointment.students = appointment.personappointment.filter(
            (pa) => pa.isTutor === false
          );
          appointment.tutors = appointment.personappointment.filter(
            (pa) => pa.isTutor === true
          );
        }
        appointment.isMemberOfAppointment = true;
        this.setUpCalendarEvent(appointment);

        if (appointment.type.includes("Group")) {
          appointment.tutor = appointment.tutors.length;
        } else if (
          appointment.type === "Private" &&
          (appointment.status === "booked" || appointment.status === "pending")
        ) {
          appointment.tutor =
            appointment.tutors[0].person.fName +
            " " +
            appointment.tutors[0].person.lName;
        } else {
          appointment.tutor = "Open";
        }

        // set null location info
        if (appointment.locationId === null) {
          appointment.location = {
            name: "Not Selected",
          };
        }

        // set null topic info
        if (appointment.topicId === null) {
          appointment.topic = {
            name: "Not Selected",
          };
        }

        //format date, start time, and end time but keep the originals
        appointment.originalDate = appointment.date;
        appointment.date = this.formatDate(appointment.date);
        appointment.originalStart = appointment.startTime;
        appointment.startTime = this.formatTime(appointment.startTime);
        appointment.originalEnd = appointment.endTime;
        appointment.endTime = this.formatTime(appointment.endTime);
      }
    },
    async getAppointmentsNeedingFeedback() {
      await AppointmentServices.getPassedAppointmentsForStudent(
        this.group.id,
        this.user.userID
      )
        .then((response) => {
          this.appointmentsNeedingFeedback = response.data;
          for (let i = 0; i < this.appointmentsNeedingFeedback.length; ++i) {
            //format date, start time, and end time
            let element = this.appointmentsNeedingFeedback[i];
            this.appointmentsNeedingFeedback[i].date = this.formatDate(
              element.date
            );
            this.appointmentsNeedingFeedback[i].startTime = this.formatTime(
              element.startTime
            );
            this.appointmentsNeedingFeedback[i].endTime = this.formatTime(
              element.endTime
            );
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    provideFeedback: function (item, row) {
      row.select(true);
      this.$router.push({
        name: "studentAppointmentFeedback",
        params: { id: item.id, userId: this.user.userID },
      });
    },
    async getStudentRole() {
      await PersonRoleServices.getPersonRole(this.id)
        .then((response) => {
          if (response.data.status.includes("disabled")) {
            this.disabled = true;
          } else this.disabled = false;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    rowClick: async function (item, row) {
      row.select(true);
      this.selectedAppointment = item;
      this.selectedAppointment.group = this.group;
      this.selectedAppointment.personRolePrivileges = [];
      this.selectedAppointment.newStart =
        this.selectedAppointment.originalStart;
      this.selectedAppointment.newEnd = this.selectedAppointment.originalEnd;
      if (
        this.selectedAppointment.type.includes("Private") &&
        this.selectedAppointment.status.includes("available") &&
        this.group.allowSplittingAppointments &&
        this.subtractTimes(
          this.selectedAppointment.originalStart,
          this.selectedAppointment.originalEnd
        ) >= this.group.minApptTime
      ) {
        this.selectedAppointment.displayedStart = "";
        this.selectedAppointment.displayedEnd = "";
      } else {
        this.selectedAppointment.displayedStart =
          this.selectedAppointment.originalStart;
        this.selectedAppointment.displayedEnd =
          this.selectedAppointment.originalEnd;
      }
      this.appointmentDialog = true;
    },
  },
};
</script>
