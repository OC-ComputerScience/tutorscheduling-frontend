<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ user.fName }}!</v-toolbar-title>
        <InformationComponent
          v-if="!disabled"
          message="Click on View Calendar to see all appointments.<br>Click on <b>Manage Availability</b> to make appointments for yourself."
        ></InformationComponent>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        alert
      }}</v-alert>
      <v-dialog v-model="showDeleteConfirmation" persistent max-width="750px">
        <DeleteConfirmationComponent
          type="appointment"
          :item="selectedAppointment"
          @handleReturningCancel="showDeleteConfirmation = false"
          @handleReturningSuccess="directToCancel()"
        ></DeleteConfirmationComponent>
      </v-dialog>
      <v-dialog v-model="appointmentDialog" max-width="800px">
        <v-card>
          <v-toolbar :color="selectedAppointment.color" dark>
            <v-card-title>
              <span v-if="selectedAppointment.type === 'Group'" class="text-h5"
                >Upcoming Group Appointment on
                {{ selectedAppointment.date }}</span
              >
              <span
                v-else-if="selectedAppointment.type === 'Private'"
                class="text-h5"
                >Upcoming Private Appointment on
                {{ selectedAppointment.date }}</span
              >
            </v-card-title>
          </v-toolbar>
          <v-card-text>
            <br />
            <b>Time slot:</b>
            {{ selectedAppointment.startTime }} -
            {{ selectedAppointment.endTime }}
            <br />
            <b>Status:</b>
            {{ selectedAppointment.status }}
            <br />
            <b>Tutors: </b>
            <span v-if="tutors.length > 0">
              <span v-for="tutor in tutors" :key="tutor.id">
                <span v-if="tutor == tutors[tutors.length - 1]"
                  >{{ tutor.person.fName }} {{ tutor.person.lName }}</span
                >
                <span v-else
                  >{{ tutor.person.fName }} {{ tutor.person.lName }},
                </span>
              </span>
            </span>
            <span v-else>
              <span>None</span>
            </span>
            <br />
            <b>Students: </b>
            <span v-if="students.length > 0">
              <span v-for="student in students" :key="student.id">
                <span v-if="student == students[students.length - 1]"
                  >{{ student.person.fName }} {{ student.person.lName }}</span
                >
                <span v-else
                  >{{ student.person.fName }} {{ student.person.lName }},
                </span>
              </span>
            </span>
            <span v-else>
              <span>None</span>
            </span>
            <br />
            <br />

            <!-- make location and topic changable if the appointment type is private-->
            <span v-if="selectedAppointment.type === 'Private'">
              <v-select
                v-model="selectedAppointment.locationId"
                :items="locations"
                item-text="name"
                item-value="id"
                label="Location"
                required
                dense
                :disabled="
                  !checkStatus('booked') ||
                  selectedAppointment.status === 'studentCancel' ||
                  selectedAppointment.status === 'tutorCancel'
                "
                @change="saveChanges = true"
              >
              </v-select>

              <v-select
                v-model="selectedAppointment.topicId"
                :items="topics"
                item-text="name"
                item-value="id"
                label="Topic"
                disabled
                dense
              >
              </v-select>
            </span>
            <!-- slots for location and topic to be unchangable if the session type is group -->
            <span v-else>
              <v-select
                v-model="selectedAppointment.locationId"
                :items="locations"
                item-text="name"
                item-value="id"
                label="Location"
                required
                dense
                @change="saveChanges = true"
              >
              </v-select>

              <v-select
                v-model="selectedAppointment.topicId"
                :items="topics"
                item-text="name"
                item-value="id"
                label="Topic"
                required
                dense
                :readonly="students.length > 0"
                @change="saveChanges = true"
              >
              </v-select>
            </span>
            <!-- show time ad an changeable value for private lessons-->

            <v-text-field
              v-model="selectedAppointment.startTime"
              label="Booked Start"
              dense
              readonly
            >
            </v-text-field>
            <v-text-field
              v-model="selectedAppointment.endTime"
              label="Booked End"
              dense
              readonly
            >
            </v-text-field>
            <!-- put in pre-session-info for appointment for private appointments/ add a readonly if private -->
            <v-textarea
              v-model="selectedAppointment.preSessionInfo"
              :counter="130"
              label="Pre-Session Info"
              hint="Enter Info About What You Need Help With..."
              persistent-hint
              required
              auto-grow
              rows="1"
              :readonly="selectedAppointment.type === 'Private'"
              @change="saveChanges = true"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="!(selectedAppointment.type === 'Group')"
              color="#12f000"
              :disabled="!checkStatus('pending')"
              @click="directToConfirm()"
            >
              Confirm
            </v-btn>
            <v-btn
              v-if="!(selectedAppointment.type === 'Group')"
              color="error"
              :disabled="!checkStatus('pending')"
              @click="showDeleteConfirmation = true"
            >
              Reject
            </v-btn>
            <v-btn
              color="accent"
              @click="
                appointmentDialog = false;
                getAppointments();
              "
            >
              Close
            </v-btn>
            <v-btn v-if="saveChanges" color="accent" @click="directToEdit()">
              Save Changes
            </v-btn>

            <v-btn
              v-if="
                (checkStatus('booked') &&
                  selectedAppointment.type === 'Private') ||
                selectedAppointment.type === 'Group' ||
                checkStatus('available') ||
                checkStatus('booked')
              "
              color="red"
              @click="showDeleteConfirmation = true"
            >
              Cancel Appointment
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog" persistent max-width="800">
        <v-card tile>
          <v-card-title>
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
                dialog = false;
                doAuthorization();
              "
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-container v-if="approved">
        <v-row>
          <v-col>
            <v-card
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#196CA2"
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
              color="#63BAC0"
              @click="
                handleRedundantNavigation(
                  'tutorAddAvailability',
                  user.selectedRole.personRoleId
                )
              "
            >
              <v-card-title class="justify-center white--text">
                Manage Availability
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            Upcoming Appointments for {{ user.selectedGroup }} as a tutor
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to view information, make changes,
              confirm, or reject."
            ></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="appointments"
            :items-per-page="50"
            @click:row="rowClick"
          >
          </v-data-table>
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
      <v-container v-else-if="!disabled && !approved">
        <h4>Pending supervisor's approval...</h4>
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
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonTopicServices from "@/services/personTopicServices.js";
import AppointmentServices from "@/services/appointmentServices.js";
import LocationServices from "@/services/locationServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import DeleteConfirmationComponent from "../../components/DeleteConfirmationComponent.vue";
import InformationComponent from "../../components/InformationComponent.vue";
import { AppointmentActionMixin } from "../../mixins/AppointmentActionMixin";
import { RedirectToPageMixin } from "../../mixins/RedirectToPageMixin";
import { TimeFunctionsMixin } from "../../mixins/TimeFunctionsMixin";

export default {
  name: "TutorHome",
  components: {
    DeleteConfirmationComponent,
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
      showDeleteConfirmation: false,
      showAlert: false,
      alert: "",
      alertType: "success",
      user: {},
      group: {},
      dialog: false,
      currentId: 0,
      approved: false,
      disabled: false,
      appointmentDialog: false,
      saveChanges: false,
      locations: [],
      topics: [],
      students: [],
      tutors: [],
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
        { text: "Students", value: "student" },
      ],
      headerFeedback: [
        { text: "Date", value: "date" },
        { text: "Start Time", value: "startTime" },
        { text: "End Time", value: "endTime" },
        { text: "Type", value: "type" },
      ],
      message: "Tutor",
      url: "",
    };
  },
  watch: {
    id: function () {
      this.getTutorRole();
    },
  },
  async created() {
    this.user = Utils.getStore("user");
    if (this.id !== 0) {
      await this.getTutorRole();
    }
    await this.getGroupByPersonRoleId();
    await this.getAppointments();
    await this.getAppointmentsNeedingFeedback();
    await this.getLocations();
    await this.getTopics();

    if (this.$route.query !== undefined) {
      for (let i = 0; i < this.appointments.length; i++) {
        if (
          this.appointments[i].id === parseInt(this.$route.query.appointmentId)
        ) {
          this.selectedAppointment = this.appointments[i];
          this.appointmentDialog = true;
          return;
        }
      }
    }
  },
  methods: {
    checkForAuthorization() {
      var now = new Date().toISOString();
      if (
        this.user.refresh_token !== null &&
        this.user.refresh_token !== undefined &&
        this.user.refresh_token !== ""
      ) {
        if (now > this.user.expiration_date) {
          this.dialog = true;
        }
      } else {
        this.dialog = true;
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
      await AppointmentServices.getUpcomingAppointmentsForTutor(
        this.group.id,
        this.user.userID
      )
        .then(async (response) => {
          this.appointments = response.data;
          for (let index = 0; index < this.appointments.length; ++index) {
            this.appointments[index].student = "x";

            //  look up students
            await PersonAppointmentServices.findStudentDataForTable(
              this.appointments[index].id
            )
              .then((response) => {
                let studentData = response.data;
                if (this.appointments[index].type.includes("Group")) {
                  this.appointments[index].student = studentData.length;
                } else if (
                  this.appointments[index].type.includes("Private") &&
                  (this.appointments[index].status.includes("booked") ||
                    this.appointments[index].status.includes("pending"))
                ) {
                  this.appointments[index].student =
                    studentData[0].person.fName +
                    " " +
                    studentData[0].person.lName;
                } else {
                  this.appointments[index].student = "Open";
                }
              })
              .catch((error) => {
                this.alertType = "error";
                this.alert = error.response.data.message;
                this.showAlert = true;
                console.log("There was an error:", error.response);
              });

            // set null location info
            if (this.appointments[index].locationId === null) {
              this.appointments[index].location = {
                name: "Not Selected",
              };
            }

            // set null topic info
            if (this.appointments[index].topicId === null) {
              this.appointments[index].topic = {
                name: "Not Selected",
              };
            }

            // set color
            if (
              this.appointments[index].status === "available" &&
              this.appointments[index].type === "Private"
            )
              this.appointments[index].color = "grey darken-1";
            else if (
              this.appointments[index].status === "available" &&
              this.appointments[index].type === "Group"
            )
              this.appointments[index].color = "purple";
            else if (this.appointments[index].status === "pending")
              this.appointments[index].color = "yellow";
            else if (this.appointments[index].status === "booked")
              this.appointments[index].color = "blue";

            //format date, start time, and end time but keep the originals
            let element = this.appointments[index];
            this.appointments[index].originalDate =
              this.appointments[index].date;
            this.appointments[index].date = this.formatDate(element.date);
            this.appointments[index].originalStart =
              this.appointments[index].startTime;
            this.appointments[index].startTime = this.formatTime(
              element.startTime
            );
            this.appointments[index].originalEnd =
              this.appointments[index].endTime;
            this.appointments[index].endTime = this.formatTime(element.endTime);
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getAppointmentsNeedingFeedback() {
      await AppointmentServices.getPassedAppointmentsForTutor(
        this.group.id,
        this.user.userID
      )
        .then((response) => {
          this.appointmentsNeedingFeedback = response.data;

          for (
            let index = 0;
            index < this.appointmentsNeedingFeedback.length;
            ++index
          ) {
            //format date, start time, and end time
            let element = this.appointmentsNeedingFeedback[index];
            this.appointmentsNeedingFeedback[index].date = this.formatDate(
              element.date
            );
            this.appointmentsNeedingFeedback[index].startTime = this.formatTime(
              element.startTime
            );
            this.appointmentsNeedingFeedback[index].endTime = this.formatTime(
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
        name: "tutorAppointmentFeedback",
        params: { id: item.id, userId: this.user.userID },
      });
    },
    async directToCancel() {
      if (this.selectedAppointment.status === "pending")
        await this.confirmAppointment(
          false,
          this.user,
          this.selectedAppointment
        );
      else {
        let fromUser = {
          fName: this.user.fName,
          lName: this.user.lName,
          userID: this.user.userID,
          type: this.user.selectedRole.type,
        };
        await AppointmentServices.cancelAppointment(
          this.selectedAppointment.id,
          fromUser
        ).catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
      }
      await this.getAppointments();
      this.appointmentDialog = false;
      this.showDeleteConfirmation = false;
    },
    async directToConfirm() {
      await this.confirmAppointment(true, this.user, this.selectedAppointment);
      await this.getAppointments();
      this.appointmentDialog = false;
    },
    async directToEdit() {
      await this.editAppointment(this.user, this.selectedAppointment);
      await this.getAppointments();
      this.appointmentDialog = false;
    },
    async getTutorRole() {
      await PersonRoleServices.getPersonRole(this.id)
        .then((response) => {
          if (
            response.data.status.includes("approved") ||
            response.data.status.includes("Approved")
          ) {
            this.approved = true;
          } else if (
            response.data.status.includes("applied") ||
            response.data.status.includes("Applied")
          )
            this.approved = false;
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

      if (this.approved) {
        this.checkForAuthorization();
      }
    },
    //Update the lists of tutors and students
    async updatePeople() {
      this.tutors = [];
      this.students = [];
      await PersonAppointmentServices.findStudentDataForTable(
        this.selectedAppointment.id
      )
        .then((response) => {
          this.students = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
      await PersonAppointmentServices.findTutorDataForTable(
        this.selectedAppointment.id
      )
        .then((response) => {
          this.tutors = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getLocations() {
      await LocationServices.getActiveForGroup(this.group.id)
        .then((response) => {
          this.locations = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getTopics() {
      await PersonTopicServices.getTopicForPersonGroup(
        this.group.id,
        this.user.userID
      )
        .then((response) => {
          this.topics = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    checkStatus(status) {
      if (
        this.selectedAppointment != null &&
        this.selectedAppointment.status == status
      ) {
        return true;
      } else {
        return false;
      }
    },
    rowClick: function (item, row) {
      row.select(true);
      this.selectedAppointment = item;
      this.updatePeople();
      this.saveChanges = false;
      this.appointmentDialog = true;
    },
  },
};
</script>
