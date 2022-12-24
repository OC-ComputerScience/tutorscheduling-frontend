<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <InformationComponent
          v-if="!disabled"
          message="Click on <b>View Calendar</b> to see available appointments!"></InformationComponent>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <v-container v-if="!disabled">
        <v-dialog v-model="apptDialog" max-width="800px">
          <v-card>
            <v-toolbar :color="selectedAppt.color" dark>
              <v-card-title>
                <span v-if="selectedAppt.type === 'Group'" class="text-h5"
                  >Upcoming Group Appointment on {{ selectedAppt.date }}</span
                >
                <span
                  v-else-if="selectedAppt.type === 'Private'"
                  class="text-h5"
                  >Upcoming Private Appointment on {{ selectedAppt.date }}</span
                >
              </v-card-title>
            </v-toolbar>
            <v-card-text>
              <br />
              <b>Time slot:</b>
              {{ selectedAppt.startTime }} - {{ selectedAppt.endTime }}
              <br />
              <b>Status:</b>
              {{ selectedAppt.status }}
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
              <span v-if="selectedAppt.type === 'Private'">
                <v-select
                  v-model="selectedAppt.locationId"
                  :items="locations"
                  item-text="name"
                  item-value="id"
                  label="Location"
                  :disabled="selectedAppt.status === 'booked'"
                  required
                  dense
                  @change="saveChanges = true">
                </v-select>

                <v-select
                  v-model="selectedAppt.topicId"
                  :items="topics"
                  item-text="name"
                  item-value="id"
                  label="Topic"
                  :disabled="selectedAppt.status === 'booked'"
                  required
                  dense
                  @change="saveChanges = true">
                </v-select>
              </span>
              <!-- slots for location and topic to be unchangable if the session type is group -->
              <span v-else>
                <v-select
                  v-model="selectedAppt.locationId"
                  :items="locations"
                  item-text="name"
                  item-value="id"
                  label="Location"
                  dense
                  readonly>
                </v-select>

                <v-select
                  v-model="selectedAppt.topicId"
                  :items="topics"
                  item-text="name"
                  item-value="id"
                  label="Topic"
                  dense
                  readonly>
                </v-select>
              </span>
              <!-- show time for private lessons-->

              <v-text-field
                v-model="selectedAppt.startTime"
                label="Booked Start"
                dense
                readonly>
              </v-text-field>
              <v-text-field
                v-model="selectedAppt.endTime"
                label="Booked End"
                dense
                readonly>
              </v-text-field>
              <!-- put in presession-info for appointment for private appointments/ add a readonly if  group -->
              <v-textarea
                v-model="selectedAppt.preSessionInfo"
                :counter="130"
                label="Pre-Session Info"
                hint="Enter Info About What You Need Help With..."
                persistent-hint
                required
                auto-grow
                rows="1"
                :readonly="selectedAppt.type === 'Group'"
                @change="saveChanges = true"></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="accent"
                @click="
                  apptDialog = false;
                  getAppointments();
                ">
                Close
              </v-btn>
              <v-btn
                v-if="selectedAppt.type === 'Private' && saveChanges"
                color="accent"
                @click="
                  editAppointment(user, selectedAppt);
                  getAppointments();
                  apptDialog = false;
                ">
                Save Changes
              </v-btn>
              <v-btn
                color="red"
                @click="
                  cancelAppointment(selectedAppt, user);
                  getAppointments();
                  apptDialog = false;
                ">
                Cancel Appointment
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-alert v-model="showAlert" dismissible :type="alertType">{{
          this.alert
        }}</v-alert>
        <v-row>
          <v-col>
            <v-card
              :to="{ name: 'calendar' }"
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#EE5044">
              <v-card-title class="justify-center white--text">
                View Calendar
              </v-card-title>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              :to="{ name: 'studentAddRequest' }"
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#F8C545">
              <v-card-title class="justify-center white--text">
                Make A Request
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            Upcoming Appointments for {{ this.user.selectedGroup }} as a student
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to view information, make changes, or
              cancel."></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="appointments"
            :items-per-page="50"
            @click:row="rowClick"></v-data-table>
        </v-card>
        <br />
        <v-card>
          <v-card-title>
            Provide Appointment Feedback for {{ this.user.selectedGroup }}
            <v-spacer></v-spacer>
            <InformationComponent
              message="Click on an appointment to provide feedback."></InformationComponent>
          </v-card-title>
          <v-data-table
            :headers="headerFeedback"
            :items="appointmentsneedingfeedback"
            :items-per-page="50"
            @click:row="provideFeedback"></v-data-table>
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
import LocationServices from "@/services/locationServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonTopicServices from "@/services/personTopicServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import InformationComponent from "../../components/InformationComponent.vue";
import { AppointmentActionMixin } from "../../mixins/AppointmentActionMixin";
import { TimeFunctionsMixin } from "../../mixins/TimeFunctionsMixin";

export default {
  props: ["id"],
  name: "StudentHome",
  mixins: [AppointmentActionMixin, TimeFunctionsMixin],
  components: {
    InformationComponent,
  },
  watch: {
    id: function () {
      console.log(this.id);
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
      apptDialog: false,
      saveChanges: false,
      selectedAppt: {},
      locations: [],
      topics: [],
      students: [],
      tutors: [],
      appointments: [],
      appointmentsneedingfeedback: [],
      headers: [
        { text: "Date", value: "date" },
        { text: "Start Time", value: "startTime" },
        { text: "End Time", value: "endTime" },
        { text: "Topic", value: "topic.name" },
        { text: "Location", value: "location.name" },
        { text: "Status", value: "status" },
        { text: "Type", value: "type" },
        { text: "Tutor", value: "tutor" },
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
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId();
    await this.getStudentRole();
    if (!this.disabled) {
      await this.getAppointments();
      await this.getAppointmentsNeedingFeedback();
      await this.getLocations();
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
      await AppointmentServices.getUpcomingAppointmentForPersonForGroup(
        this.group.id,
        this.user.userID
      )
        .then(async (response) => {
          this.appointments = response.data;
          for (let index = 0; index < this.appointments.length; ++index) {
            this.appointments[index].tutor = "x";
            //  look up students
            await PersonAppointmentServices.findTutorDataForTable(
              this.appointments[index].id
            )
              .then((response) => {
                let tutorData = response.data;
                if (this.appointments[index].type.includes("Group")) {
                  this.appointments[index].tutor =
                    tutorData.length + " Tutor(s)";
                } else if (
                  this.appointments[index].type.includes("Private") &&
                  (this.appointments[index].status.includes("booked") ||
                    this.appointments[index].status.includes("pending"))
                ) {
                  this.appointments[index].tutor =
                    tutorData[0].person.fName + " " + tutorData[0].person.lName;
                } else {
                  this.appointments[index].tutor = "Open";
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
      await AppointmentServices.getPassedAppointmentForPersonForGroupStudent(
        this.group.id,
        this.user.userID
      )
        .then((response) => {
          this.appointmentsneedingfeedback = response.data;
          for (
            let index = 0;
            index < this.appointmentsneedingfeedback.length;
            ++index
          ) {
            //format date, start time, and end time
            let element = this.appointmentsneedingfeedback[index];
            this.appointmentsneedingfeedback[index].date = this.formatDate(
              element.date
            );
            this.appointmentsneedingfeedback[index].startTime = this.formatTime(
              element.startTime
            );
            this.appointmentsneedingfeedback[index].endTime = this.formatTime(
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
    //Update the lists of tutors and students
    async updatePeople() {
      this.tutors = [];
      this.students = [];
      await PersonAppointmentServices.findStudentDataForTable(
        this.selectedAppt.id
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
        this.selectedAppt.id
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
    async getTopicsForTutor() {
      console.log("in get topics");
      await PersonTopicServices.getTopicForPersonGroup(
        this.group.id,
        this.tutors[0].personId
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
      if (this.selectedAppt != null && this.selectedAppt.status == status) {
        return true;
      } else {
        return false;
      }
    },
    rowClick: async function (item, row) {
      row.select(true);
      this.selectedAppt = item;
      await this.updatePeople();
      console.log(this.tutors);
      this.getTopicsForTutor();
      this.saveChanges = false;
      this.apptDialog = true;
    },
  },
};
</script>
