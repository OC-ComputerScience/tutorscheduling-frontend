<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>

      <v-dialog v-model="apptDialog" max-width="800px">
        <v-card>
          <v-toolbar :color="selectedAppt.color" dark>
            <v-card-title>
              <span v-if="selectedAppt.type === 'Group'" class="text-h5"
                >Upcoming Group Appointment on {{ selectedAppt.date }}</span
              >
              <span v-else-if="selectedAppt.type === 'Private'" class="text-h5"
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
                required
                dense
                :disabled="
                  !checkStatus('booked') ||
                  selectedAppt.status === 'studentCancel' ||
                  selectedAppt.status === 'tutorCancel'
                "
                @change="saveChanges = true">
              </v-select>

              <v-select
                v-model="selectedAppt.topicId"
                :items="topics"
                item-text="name"
                item-value="id"
                label="Topic"
                disabled
                dense>
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
                required
                dense
                :readonly="students.length > 0"
                @change="saveChanges = true">
              </v-select>
            </span>
            <!-- show time ad an changeable value for private lessons-->

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
            <!-- put in presession-info for appointment for private appointments/ add a readonly if private -->
            <v-textarea
              v-model="selectedAppt.preSessionInfo"
              :counter="130"
              label="Pre-Session Info"
              hint="Enter Info About What You Need Help With..."
              persistent-hint
              required
              auto-grow
              rows="1"
              :readonly="selectedAppt.type === 'Private'"
              @change="saveChanges = true"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="!(selectedAppt.type === 'Group')"
              color="#12f000"
              @click="confirmAppointment(true)"
              :disabled="!checkStatus('pending')">
              Confirm
            </v-btn>
            <v-btn
              v-if="!(selectedAppt.type === 'Group')"
              color="error"
              @click="
                confirmAppointment(false);
                apptDialog = false;
              "
              :disabled="!checkStatus('pending')">
              Reject
            </v-btn>
            <v-btn
              color="accent"
              @click="
                apptDialog = false;
                getAppointments();
              ">
              Close
            </v-btn>
            <v-btn
              v-if="saveChanges"
              color="accent"
              @click="
                editAppointment();
                apptDialog = false;
              ">
              Save Changes
            </v-btn>

            <v-btn
              v-if="
                (checkStatus('booked') && selectedAppt.type === 'Private') ||
                selectedAppt.type === 'Group' ||
                checkStatus('available') ||
                checkStatus('booked')
              "
              color="red"
              @click="
                cancelAppointment();
                apptDialog = false;
              ">
              Cancel Appointment
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog" persistent max-width="800">
        <v-card tile>
          <v-card-title>
            <span class="text-h5">Hello, {{ this.user.fName }}!</span>
          </v-card-title>
          <v-card-text>
            Tutor Scheduling updates your Google calendar with appointments. You
            will now be asked to approve that access via Google. You will be
            presented with a Google login and a Tutor Scheduling access request.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              text
              @click="
                dialog = false;
                doAuthorization();
              ">
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-container v-if="approved">
        <v-row>
          <v-col>
            <v-card
              :to="{ name: 'calendar' }"
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#196CA2">
              <v-card-title class="justify-center white--text">
                View Calendar
              </v-card-title>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              :to="{ name: 'tutorAddAvailability' }"
              class="mx-auto my-12 d-flex justify-center"
              max-width="400"
              height="100"
              elevation="10"
              color="#63BAC0">
              <v-card-title class="justify-center white--text">
                Manage Availability
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-card>
          <v-card-title>
            Upcoming Appointments for {{ this.user.selectedGroup }} as a tutor
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details></v-text-field>
          </v-card-title>
          <v-card-text>
            <b
              >Click on an appointment to view information, make changes,
              confirm, or reject.</b
            >
          </v-card-text>
          <v-data-table
            :headers="headers"
            :search="search"
            :items="appointments"
            :items-per-page="50"
            @click:row="rowClick">
          </v-data-table>
        </v-card>
        <br />
        <v-card>
          <v-card-title>
            Provide Appointment Feedback for {{ this.user.selectedGroup }}
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details></v-text-field>
          </v-card-title>
          <v-card-text>
            <b>Click on an appointment to provide feedback.</b>
          </v-card-text>
          <v-data-table
            :headers="headerFeedback"
            :search="search"
            :items="appointmentsneedingfeedback"
            :items-per-page="50"
            @click:row="provideFeedback"></v-data-table>
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
import TwilioServices from "@/services/twilioServices.js";

export default {
  props: ["id"],
  name: "App",
  watch: {
    id: function () {
      this.getTutorRole();
    },
  },
  components: {},
  data() {
    return {
      search: "",
      user: {},
      group: {},
      dialog: false,
      currentId: 0,
      approved: false,
      disabled: false,
      apptDialog: false,
      saveChanges: false,
      locations: [],
      topics: [],
      students: [],
      tutors: [],
      selectedAppt: {},
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
        { text: "Student(s)", value: "student" },
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
  async created() {
    this.user = Utils.getStore("user");
    if (this.id !== 0) {
      this.getTutorRole();
    }
    await this.getGroupByPersonRoleId()
      .then(async () => {
        await this.getAppointments();
        this.getAppointmentsNeedingFeedback();
        this.getLocations();
        this.getTopics();
      })
      .catch((error) => {
        this.message = error.response.data.message;
      });
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
      // the commented line is for local machine only
      // this.url = (process.env.VUE_APP_SITE_URL ? process.env.VUE_APP_SITE_URL : "http://localhost") + '/tutoring-api/authorize/' + this.user.userID;
      this.url = "/tutoring-api/authorize/" + this.user.userID;

      const client = global.google.accounts.oauth2.initCodeClient({
        client_id: process.env.VUE_APP_CLIENT_ID,
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
        ux_mode: "popup",
        callback: (response) => {
          var code_receiver_uri = this.url;

          // Send auth code to your backend platform
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              let responseData = JSON.parse(this.responseText);
              let user = Utils.getStore("user");
              user.refresh_token = responseData.refresh_token;
              user.expiration_date = responseData.expiration_date;
              Utils.setStore("user", user);
            }
          };
          xhr.open("POST", code_receiver_uri, true);
          xhr.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
          );
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
          xhr.send("code=" + response.code);
          // After receipt, the code is exchanged for an access token and
          // refresh token, and the platform then updates this web app
          // running in user's browser with the requested calendar info.
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
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    formatDate(date) {
      let formattedDate =
        date.toString().substring(5, 10) +
        "-" +
        date.toString().substring(0, 4);
      return formattedDate;
    },
    formatTime(time) {
      let modST = time.toString().substring(0, 2) % 12;
      let formattedTime = modST + ":" + time.toString().substring(3, 5);

      if (time.toString().substring(0, 2) > 12) {
        formattedTime = formattedTime + " P.M.";
      } else if (modST == 0 && time.toString().substring(0, 2) == "12") {
        formattedTime = "12:" + time.toString().substring(3, 5) + " P.M.";
      } else if (modST == 0) {
        formattedTime = "12:" + time.toString().substring(3, 5) + " A.M.";
      } else {
        formattedTime = formattedTime + " A.M.";
      }

      return formattedTime;
    },
    async getAppointments() {
      await AppointmentServices.getUpcomingAppointmentForPersonForGroup(
        this.group.id,
        this.user.userID
      )
        .then(async (response) => {
          this.appointments = response.data;
          let temp = this.appointments.length;
          for (let i = 0; i < temp; i++) {
            for (let j = 0; j < temp - i - 1; j++) {
              if (this.appointments[j + 1].date < this.appointments[j].date) {
                [this.appointments[j + 1], this.appointments[j]] = [
                  this.appointments[j],
                  this.appointments[j + 1],
                ];
              } else if (
                this.appointments[j + 1].date === this.appointments[j].date
              ) {
                if (
                  this.appointments[j + 1].startTime <
                  this.appointments[j].startTime
                )
                  [this.appointments[j + 1], this.appointments[j]] = [
                    this.appointments[j],
                    this.appointments[j + 1],
                  ];
              }
            }
          }
          for (let index = 0; index < this.appointments.length; ++index) {
            this.appointments[index].student = "x";

            //  look up students
            await PersonAppointmentServices.findStudentDataForTable(
              this.appointments[index].id
            )
              .then((response) => {
                let studentData = response.data;
                if (this.appointments[index].type.includes("Group")) {
                  this.appointments[index].student =
                    studentData.length + " Student(s)";
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
                this.message = error.response.data.message;
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
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getAppointmentsNeedingFeedback() {
      await AppointmentServices.getPassedAppointmentForPersonForGroupTutor(
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
          this.message = error.response.data.message;
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
    //Update on tutor confirming booking
    async confirmAppointment(confirm) {
      if (confirm) {
        this.selectedAppt.status = "booked";
        if (this.selectedAppt.type.includes("Private")) {
          let updateAppt = {
            id: this.selectedAppt.id,
            date: this.selectedAppt.originalDate,
            startTime: this.selectedAppt.originalStart,
            endTime: this.selectedAppt.originalEnd,
            type: this.selectedAppt.type,
            status: "booked",
            preSessionInfo: this.selectedAppt.preSessionInfo,
            groupId: this.selectedAppt.groupId,
            topicId: this.selectedAppt.topicId,
            locationId: this.selectedAppt.locationId,
          };
          await AppointmentServices.updateForGoogle(updateAppt.id, updateAppt)
            .then(async () => {
              await this.tutorConfirmMessage(
                this.students[0],
                this.user.fName,
                this.user.lName,
                updateAppt.id
              );
              this.getAppointments();
              this.selectedAppt.color = "blue";
            })
            .catch((error) => {
              this.message = error.response.data.message;
            });
        }
      } else {
        // don't need to update google cal because it's not even on there yet
        this.selectedAppt.status = "tutorCancel";
        let updateAppt = {
          id: this.selectedAppt.id,
          date: this.selectedAppt.originalDate,
          startTime: this.selectedAppt.originalStart,
          endTime: this.selectedAppt.originalEnd,
          type: this.selectedAppt.type,
          status: "tutorCancel",
          preSessionInfo: this.selectedAppt.preSessionInfo,
          groupId: this.selectedAppt.groupId,
          topicId: this.selectedAppt.topicId,
          locationId: this.selectedAppt.locationId,
          googleEventId: this.selectedAppt.googleEventId,
        };
        await AppointmentServices.updateAppointment(updateAppt.id, updateAppt)
          .then(() => {
            this.getAppointments();
            // don't want to keep this open since it's supposed to leave this list
            this.apptDialog = false;
          })
          .catch((error) => {
            this.message = error.response.data.message;
          });
      }
    },
    async editAppointment() {
      let updateAppt = {
        id: this.selectedAppt.id,
        date: this.selectedAppt.originalDate,
        startTime: this.selectedAppt.originalStart,
        endTime: this.selectedAppt.originalEnd,
        type: this.selectedAppt.type,
        status: this.selectedAppt.status,
        preSessionInfo: this.selectedAppt.preSessionInfo,
        groupId: this.selectedAppt.groupId,
        topicId: this.selectedAppt.topicId,
        locationId: this.selectedAppt.locationId,
        googleEventId: this.selectedAppt.googleEventId,
      };
      await AppointmentServices.updateForGoogle(updateAppt.id, updateAppt)
        .then(async () => {
          for (let i = 0; i < this.students.length; i++) {
            this.tutorEditMessage(
              this.students[i],
              this.user.fName,
              this.user.lName,
              updateAppt.type
            );
          }
          await this.getAppointments();
        })
        .catch((error) => {
          this.message = error.response.data.message;
        });
    },
    //method for canceling appointments
    async cancelAppointment() {
      // if students are NOT signed up for the appointment, delete it and delete the tutor personappointments
      if (this.students.length === 0) {
        for (let i = 0; i < this.tutors.length; i++) {
          await PersonAppointmentServices.deletePersonAppointment(
            this.tutors[i].id
          ).catch((error) => {
            this.message = error.response.data.message;
          });
        }
        await AppointmentServices.deleteAppointment(this.selectedAppt.id).catch(
          (error) => {
            this.message = error.response.data.message;
          }
        );
      }
      // if students are, keep the appointment but delete all the personappointments
      else {
        for (let i = 0; i < this.students.length; i++) {
          this.tutorCancelMessage(
            this.students[i],
            this.user.fName,
            this.user.lName,
            this.selectedAppt.id
          );
          await PersonAppointmentServices.deletePersonAppointment(
            this.students[i].id
          ).catch((error) => {
            this.message = error.response.data.message;
          });
        }
        for (let i = 0; i < this.tutors.length; i++) {
          await PersonAppointmentServices.deletePersonAppointment(
            this.tutors[i].id
          ).catch((error) => {
            this.message = error.response.data.message;
          });
        }
        let updateAppt = {
          id: this.selectedAppt.id,
          date: this.selectedAppt.originalDate,
          startTime: this.selectedAppt.originalStart,
          endTime: this.selectedAppt.originalEnd,
          type: this.selectedAppt.type,
          status: "tutorCancel",
          preSessionInfo: this.selectedAppt.preSessionInfo,
          groupId: this.selectedAppt.groupId,
          topicId: this.selectedAppt.topicId,
          locationId: this.selectedAppt.locationId,
        };
        await AppointmentServices.updateForGoogle(
          updateAppt.id,
          updateAppt
        ).catch((error) => {
          this.message = error.response.data.message;
        });
      }
      this.getAppointments();
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
          this.message = error.response.data.message;
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
        this.selectedAppt.id
      )
        .then((response) => {
          this.students = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
      await PersonAppointmentServices.findTutorDataForTable(
        this.selectedAppt.id
      )
        .then((response) => {
          this.tutors = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    getLocations() {
      LocationServices.getActiveForGroup(this.group.id)
        .then((response) => {
          this.locations = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    getTopics() {
      PersonTopicServices.getTopicForPersonGroup(
        this.group.id,
        this.user.userID
      )
        .then((response) => {
          this.topics = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
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
    rowClick: function (item, row) {
      row.select(true);
      this.selectedAppt = item;
      this.updatePeople();
      this.saveChanges = false;
      this.apptDialog = true;
    },
    tutorConfirmMessage(student, fName, lName) {
      let temp = student;
      temp.phoneNum = student.person.phoneNum;
      temp.message =
        "The " +
        this.selectedAppt.type +
        " appointment you booked on " +
        this.selectedAppt.date +
        " at " +
        this.selectedAppt.startTime +
        " has been confirmed by " +
        fName +
        " " +
        lName +
        ".\nPlease review this appointment at http://tutorscheduling.oc.edu/";
      TwilioServices.sendMessage(temp);
    },
    tutorEditMessage(student, fName, lName) {
      let temp = student;
      temp.phoneNum = student.person.phoneNum;
      temp.message =
        "Your " +
        this.selectedAppt.type +
        " appointment with " +
        fName +
        " " +
        lName +
        " on " +
        this.selectedAppt.date +
        " at " +
        this.selectedAppt.startTime +
        " has been edited. \nPlease check changes at http://tutorscheduling.oc.edu/";
      TwilioServices.sendMessage(temp);
    },
    tutorCancelMessage(student, fName, lName) {
      let temp = student;
      temp.phoneNum = student.person.phoneNum;
      temp.message =
        "Your " +
        this.selectedAppt.type +
        " appointment on " +
        this.selectedAppt.date +
        " at " +
        this.selectedAppt.startTime +
        " has been canceled by " +
        fName +
        " " +
        lName +
        ". We apologize for the inconvenience.";
      TwilioServices.sendMessage(temp);
    },
  },
};
</script>
