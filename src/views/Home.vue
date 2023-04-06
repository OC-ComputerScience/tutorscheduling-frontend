<template>
  <div>
    <v-container>
      <v-card-title
        class="text-h4 font-weight-bold pt-4 pb-6 pl-0 pr-0 accent--text"
        >Hello, {{ user.fName }}!
        <InformationComponent :message="message"></InformationComponent
        ><v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-card-title class="text-right pt-0 pb-0 pl-0 pr-0 accent--text">{{
          user.selectedRole.type
        }}</v-card-title>
      </v-card-title>

      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        alert
      }}</v-alert>

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

      <v-dialog
        v-if="hasRole('Student')"
        v-model="requestDialog"
        persistent
        max-width="800px"
      >
        <RequestDialogBody
          :sent-bool="false"
          :group-id="group.id"
          @closeRequestDialog="requestDialog = false"
          @saveOrAddRequest="saveOrAddRequest"
        ></RequestDialogBody>
      </v-dialog>

      <v-dialog
        v-if="hasRole('Tutor')"
        v-model="googleCalendarDialog"
        persistent
        max-width="800"
      >
        <v-card tile>
          <v-card-title class="primary white--text mb-6">
            <span class="text-h5">Hello, {{ user.fName }}!</span>
          </v-card-title>
          <v-card-text>
            Tutor Scheduling updates your Google calendar with appointments. You
            will now be asked to approve (or re-approve) that access via Google.
            You will be presented with a Google login and a Tutor Scheduling
            access request.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              text
              @click="
                googleCalendarDialog = false;
                doAuthorization();
              "
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <span v-if="approved">
        <v-row fill-height>
          <v-col>
            <v-card
              class="d-flex justify-center ml-4 mr-4 mb-6"
              height="100"
              :color="hasRole('Student') ? '#EE5044' : '#196CA2'"
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
              class="d-flex justify-center ml-4 mr-4 mb-6"
              height="100"
              :color="hasRole('Student') ? '#F8C545' : '#63BAC0'"
              @click="
                hasRole('Student')
                  ? (requestDialog = true)
                  : handleRedundantNavigation(
                      'tutorAddAvailability',
                      user.selectedRole.personRoleId
                    )
              "
            >
              <v-card-title class="justify-center white--text">
                {{
                  hasRole("Student") ? "Make A Request" : "Manage Availability"
                }}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            Upcoming Appointments for {{ user.selectedGroup }} as a
            {{ user.selectedRole.type }}
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to view information, make changes, or
              cancel."
            ></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="upcomingHeaders"
            :items="upcomingAppointments"
            @click:row="openUpcoming"
            ><template #[`item.status`]="{ item }"
              ><v-tooltip right>
                <template #activator="{ on, attrs }">
                  <v-icon v-bind="attrs" :color="item.color" v-on="on">
                    mdi-circle
                  </v-icon>
                </template>
                <span>{{ item.status }}</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
        <br />
        <v-card>
          <v-card-title>
            Provide Feedback for Appointments as a {{ user.selectedRole.type }}
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to provide feedback."
            ></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="upcomingHeaders"
            :items="feedbackAppointments"
            @click:row="openFeedback"
            ><template #[`item.status`]="{ item }"
              ><v-tooltip right>
                <template #activator="{ on, attrs }">
                  <v-icon v-bind="attrs" :color="item.color" v-on="on">
                    mdi-circle
                  </v-icon>
                </template>
                <span>{{ item.status }}</span>
              </v-tooltip>
            </template></v-data-table
          >
        </v-card>
      </span>
      <span v-else-if="!disabled && !approved">
        <h4>Pending supervisor's approval...</h4>
      </span>
      <span v-else>
        <h4>
          This role for {{ group.name }} has been disabled. Please contact the
          group admin for further questions.
        </h4>
      </span>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonRolePrivilegeServices from "@/services/personRolePrivilegeServices.js";
import AppointmentDialogBody from "../components/AppointmentDialogBody.vue";
import InformationComponent from "../components/InformationComponent.vue";
import RequestDialogBody from "../components/RequestDialogBody.vue";
import { CalendarMixin } from "../mixins/CalendarMixin";
import { RedirectToPageMixin } from "../mixins/RedirectToPageMixin";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "Home",
  components: {
    AppointmentDialogBody,
    InformationComponent,
    RequestDialogBody,
  },
  mixins: [CalendarMixin, RedirectToPageMixin, TimeFunctionsMixin],
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
      message: "",
      url: "",
      approved: false,
      disabled: false,
      appointmentDialog: false,
      googleCalendarDialog: false,
      requestDialog: false,
      selectedAppointment: {},
      appointments: [],
      upcomingAppointments: [],
      personRolePrivileges: [],
      feedbackAppointments: [],
      upcomingHeaders: [
        { text: "Date", value: "tableDate" },
        { text: "Start Time", value: "tableStart" },
        { text: "End Time", value: "tableEnd" },
        { text: "Topic", value: "topic.name" },
        { text: "Status", value: "status" },
        { text: "Type", value: "type" },
      ],
    };
  },
  watch: {
    id: async function () {
      await this.setApprovedDisabled();
    },
  },
  async created() {
    this.user = Utils.getStore("user");
    if (this.id !== 0) {
      await this.setApprovedDisabled();
    }
    this.message = this.hasRole("Student")
      ? "Click on View Calendar to see available appointments!"
      : "Click on View Calendar to see all appointments. Click on Manage Availability to make appointments for yourself.";
    this.upcomingHeaders.push({
      text: this.hasRole("Student") ? "Tutors" : "Students",
      value: "people",
    });
    await this.getGroupByPersonRoleId();
    await this.setApprovedDisabled();
    if (this.approved) {
      await this.getAppointments();
      if (this.$route.query !== undefined) {
        for (let i = 0; i < this.upcomingAppointments.length; i++) {
          if (
            this.upcomingAppointments[i].id ===
            parseInt(this.$route.query.appointmentId)
          ) {
            this.selectedAppointment = this.upcomingAppointments[i];
            this.appointmentDialog = true;
            return;
          }
        }
      }
    }
  },
  methods: {
    async initialize() {
      this.appointmentDialog = false;
      await this.getAppointments();
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
    hasRole(type) {
      return (
        this.user.selectedRole.type !== null &&
        this.user.selectedRole.type === type
      );
    },
    async getAppointments() {
      this.appointments = await this.getAppointmentsForGroup(this.group.id);
      this.upcomingAppointments = [];
      this.feedbackAppointments = [];
      let owned;
      for (let i = 0; i < this.appointments.length; i++) {
        let appointment = this.appointments[i];
        appointment.group = this.group;
        this.setIsDatePast(appointment);
        appointment.isMemberOfAppointment = appointment.personappointment.find(
          (person) => {
            return person.personId === this.user.userID;
          }
        );
        appointment.isStudent = appointment.students.find((student) => {
          return student.personId === this.user.userID;
        });
        appointment.isTutor = appointment.tutors.find((tutor) => {
          return tutor.personId === this.user.userID;
        });

        owned = true;

        if (appointment.groupId != this.group.id) {
          owned = false;
        }

        if (this.hasRole("Student")) {
          if (!appointment.isStudent || appointment.status.includes("Cancel")) {
            owned = false;
          }
        } else if (this.hasRole("Tutor")) {
          if (!appointment.isTutor || appointment.status.includes("Cancel")) {
            owned = false;
          }
        }

        if (owned) {
          this.setUpCalendarEvent(appointment);
          appointment.tableDate = this.formatReadableMonth(appointment.date);
          appointment.tableStart = this.formatTime(appointment.startTime);
          appointment.tableEnd = this.formatTime(appointment.endTime);
          appointment.personRolePrivileges = [];
          appointment.newStart = appointment.startTime;
          appointment.newEnd = appointment.endTime;
          if (appointment.type === "Group") {
            appointment.people = this.hasRole("Student")
              ? appointment.tutors.length
              : appointment.students.length;
          } else if (
            appointment.type === "Private" &&
            (appointment.status === "booked" ||
              appointment.status === "pending")
          ) {
            appointment.people = this.hasRole("Student")
              ? appointment.tutors[0].person.fName +
                " " +
                appointment.tutors[0].person.lName
              : appointment.students[0].person.fName +
                " " +
                appointment.students[0].person.lName;
          } else {
            appointment.people = "---";
          }

          // set null topic info
          if (appointment.topicId === null) {
            appointment.topic = {
              name: "---",
            };
          }

          if (!appointment.isDatePast) {
            this.upcomingAppointments.push(appointment);
          } else {
            if (
              this.hasRole("Student") &&
              appointment.isStudent.feedbacktext === null &&
              appointment.status === "complete"
            ) {
              this.feedbackAppointments.push(appointment);
            } else if (
              this.hasRole("Tutor") &&
              appointment.isTutor.feedbacktext === null &&
              (appointment.status === "booked" || appointment.type === "Group")
            ) {
              this.feedbackAppointments.push(appointment);
            }
          }
        }
      }
    },
    checkForAuthorization() {
      var now = new Date().toISOString();
      if (
        this.user.refresh_token !== null &&
        this.user.refresh_token !== undefined &&
        this.user.refresh_token !== ""
      ) {
        if (now > this.user.expiration_date) {
          this.googleCalendarDialog = true;
        }
      } else {
        this.googleCalendarDialog = true;
      }
    },
    doAuthorization() {
      if (process.env.VUE_APP_CLIENT_URL.includes("localhost")) {
        this.url = "http://localhost/tutoring-api";
      } else {
        this.url = "/tutoring-api";
      }
      this.url += "/authorize/" + this.user.userID;

      const client = global.google.accounts.oauth2.initCodeClient({
        client_id: process.env.VUE_APP_CLIENT_ID,
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
        ux_mode: "popup",
        callback: async (response) => {
          await fetch(this.url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-Requested-With": "XMLHttpRequest",
              "Access-Control-Allow-Origin": "*",
            },
            body: "code=" + response.code,
          })
            .then((response) => response.json())
            .then((response) => {
              if (response.userInfo !== undefined) {
                let user = Utils.getStore("user");
                user.refresh_token = response.userInfo.refresh_token;
                user.expiration_date = response.userInfo.expiration_date;
                Utils.setStore("user", user);
                this.alert = response.message;
                this.alertType = "success";

                this.showAlert = true;
              } else {
                this.alert = response.message;
                this.alertType = "error";
                this.showAlert = true;
              }
            })
            .catch((error) => {
              this.alert =
                "There was an error authorizing your account. Please try again.";
              this.alertType = "error";
              this.showAlert = true;
              console.log(error);
            });
        },
      });
      client.requestCode();
    },
    async setApprovedDisabled() {
      await PersonRoleServices.getPersonRole(this.id)
        .then((response) => {
          if (response.data.status.toLowerCase() === "approved") {
            this.approved = true;
          } else if (response.data.status.toLowerCase() === "applied")
            this.approved = false;
          if (response.data.status.toLowerCase() === "disabled") {
            this.disabled = true;
          } else this.disabled = false;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });

      if (this.approved && this.hasRole("Tutor")) {
        this.checkForAuthorization();
      }
    },
    openUpcoming: async function (item, row) {
      row.select(true);
      this.selectedAppointment = item;
      this.appointmentDialog = true;
    },
    openFeedback: async function (item, row) {
      row.select(true);
      this.selectedAppointment = item;
      this.selectedAppointment.showFeedbackDialog = true;
      this.appointmentDialog = true;
    },
    async saveOrAddRequest() {
      // location.groupId = this.group.id;
      // if (isEdit) {
      //   await LocationServices.updateLocation(location.id, location)
      //     .then(async () => {
      //       this.locationDialog = false;
      //       await this.getLocationsForGroup();
      //     })
      //     .catch((error) => {
      //       this.title = error.response.data.message;
      //       console.log("There was an error:", error.response);
      //     });
      // } else {
      //   await LocationServices.addLocation(location)
      //     .then(async () => {
      //       this.locationDialog = false;
      //       await this.getLocationsForGroup();
      //     })
      //     .catch((error) => {
      //       this.title = error.response.data.message;
      //       console.log(error);
      //     });
      // }
    },
  },
};
</script>
