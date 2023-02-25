<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
        <InformationComponent
          message="Select an appointment to view information, book the appointment,
            make changes, etc.
            <br />
            You can filter the appointments by a desired <b>Topic</b> or <b>Tutor</b>."
        ></InformationComponent>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{ role.type }}</v-toolbar-title>
      </v-toolbar>
      <br />
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
                Reset
              </v-btn>
              <!-- Navigates calendar forward and back -->
              <v-btn fab text small color="grey darken-2" @click="prev">
                <v-icon small> mdi-chevron-left </v-icon>
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="next">
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
                @click="viewKey()"
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
            <v-menu
              v-model="selectedOpen"
              :open-on-click="false"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card color="grey lighten-4" min-width="350px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                  <v-btn icon>
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    v-html="selectedEvent.name"
                  ></v-toolbar-title>
                </v-toolbar>
                <!-- How to show tutor? -->
                <v-card-text v-if="selectedAppointment != null">
                  <b>Time slot:</b>
                  {{ calcTime(selectedAppointment.startTime) }}-{{
                    calcTime(selectedAppointment.endTime)
                  }}
                  <br />
                  <b>Tutors: </b>
                  <span v-if="tutors.length > 0">
                    <span v-for="tutor in tutors" :key="tutor.id">
                      <span v-if="tutor == tutors[tutors.length - 1]"
                        >{{ tutor.fName }} {{ tutor.lName }}</span
                      >
                      <span v-else>{{ tutor.fName }} {{ tutor.lName }}, </span>
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
                        >{{ student.fName }} {{ student.lName }}</span
                      >
                      <span v-else
                        >{{ student.fName }} {{ student.lName }},
                      </span>
                    </span>
                  </span>
                  <span v-else>
                    <span>None</span>
                  </span>

                  <!-- make location and topic changeable if the appointment type is private-->
                  <span v-if="appointmentType.includes('Private')">
                    <v-container>
                      <v-select
                        v-model="selectedAppointment.locationId"
                        :items="locations"
                        item-text="name"
                        item-value="id"
                        label="Location"
                        required
                        dense
                        :disabled="
                          (checkRole('Tutor') &&
                            !checkStatus('booked') &&
                            (!checkPrivilege(
                              'Sign up students for appointments'
                            ) ||
                              !adminAddStudent)) ||
                          ((checkRole('Student') || checkRole('Admin')) &&
                            checkStatus('booked')) ||
                          selectedAppointment.status.includes('Cancel') ||
                          datePast
                        "
                        @change="saveChanges = true"
                      >
                      </v-select>

                      <v-select
                        v-model="selectedAppointment.topicId"
                        :items="currentTopics"
                        item-text="name"
                        item-value="id"
                        label="Topic"
                        required
                        dense
                        :disabled="
                          checkStatus('booked') ||
                          (checkRole('Tutor') &&
                            (!checkPrivilege(
                              'Sign up students for appointments'
                            ) ||
                              !adminAddStudent)) ||
                          datePast
                        "
                      >
                      </v-select>
                    </v-container>
                  </span>
                  <!-- slots for location and topic to be unchangable if the session type is group-->
                  <span v-else>
                    <v-container>
                      <v-select
                        v-model="selectedAppointment.locationId"
                        :items="locations"
                        item-text="name"
                        item-value="id"
                        label="Location"
                        required
                        dense
                        :disabled="datePast"
                        :readonly="
                          !isTutorEvent || (isTutorEvent && checkRole('Admin'))
                        "
                        @change="saveChanges = true"
                      >
                      </v-select>

                      <v-select
                        v-model="selectedAppointment.topicId"
                        :items="currentTopics"
                        item-text="name"
                        item-value="id"
                        label="Topic"
                        required
                        dense
                        :disabled="datePast"
                        :readonly="
                          !isTutorEvent ||
                          (students.length > 0 && isTutorEvent) ||
                          (isTutorEvent && checkRole('Admin'))
                        "
                        @change="saveChanges = true"
                      >
                      </v-select>
                    </v-container>
                  </span>
                  <!-- show time ad an changeable value for private lessons-->
                  <v-container v-if="checkStatus('available')">
                    <span
                      v-if="
                        appointmentType.includes('Private') &&
                        group.allowSplittingAppointments &&
                        subtractTimes(
                          selectedAppointment.startTime,
                          selectedAppointment.endTime
                        ) >= group.minApptTime
                      "
                    >
                      <v-select
                        v-model="displayedStart"
                        :items="startTimes"
                        item-text="timeText"
                        item-value="time"
                        label="Booked Start"
                        required
                        :disabled="
                          (checkRole('Tutor') &&
                            (!checkPrivilege(
                              'Sign up students for appointments'
                            ) ||
                              !adminAddStudent)) ||
                          datePast
                        "
                        dense
                        @change="
                          newStart = displayedStart;
                          updateTimes();
                          secondTime = false;
                        "
                      >
                      </v-select>
                    </span>
                    <!-- show time as an unchangeable value -->
                    <span v-else>
                      <v-text-field
                        v-model="displayedStart"
                        label="Booked Start"
                        type="time"
                        required
                        dense
                        readonly
                      >
                      </v-text-field>
                    </span>
                  </v-container>
                  <v-container v-if="checkStatus('available')">
                    <span
                      v-if="
                        appointmentType.includes('Private') &&
                        group.allowSplittingAppointments &&
                        subtractTimes(
                          selectedAppointment.startTime,
                          selectedAppointment.endTime
                        ) >= group.minApptTime
                      "
                    >
                      <v-select
                        v-model="displayedEnd"
                        :items="endTimes"
                        item-text="timeText"
                        item-value="time"
                        label="Booked End"
                        required
                        :disabled="
                          secondTime ||
                          (checkRole('Tutor') &&
                            (!checkPrivilege(
                              'Sign up students for appointments'
                            ) ||
                              !adminAddStudent)) ||
                          datePast
                        "
                        dense
                        @change="
                          newEnd = displayedEnd;
                          updateTimes();
                        "
                      >
                      </v-select>
                    </span>
                    <span v-else>
                      <v-text-field
                        v-model="displayedEnd"
                        label="Booked End"
                        type="time"
                        required
                        dense
                        readonly
                      >
                      </v-text-field>
                    </span>
                  </v-container>
                  <!-- put in presession-info for appointment for private appointments/ add a readonly if  group-->
                  <span v-if="appointmentType.includes('Private')">
                    <v-textarea
                      id="preSession"
                      v-model="selectedAppointment.preSessionInfo"
                      :counter="130"
                      label="Pre-Session Info"
                      hint="Enter Info About What You Need Help With..."
                      persistent-hint
                      required
                      auto-grow
                      rows="1"
                      :disabled="
                        datePast ||
                        (checkRole('Tutor') &&
                          (!checkPrivilege(
                            'Sign up students for appointments'
                          ) ||
                            !adminAddStudent))
                      "
                      @change="saveChanges = true"
                    ></v-textarea>
                  </span>
                  <span v-else>
                    <v-textarea
                      v-model="selectedAppointment.preSessionInfo"
                      :counter="130"
                      label="Pre-Session Info"
                      hint="Enter Info About What You Need Help With..."
                      persistent-hint
                      required
                      auto-grow
                      rows="1"
                      :readonly="!isTutorEvent"
                      :disabled="datePast"
                      @change="saveChanges = true"
                    ></v-textarea>
                  </span>
                  <!-- admin signing a student up -->
                  <span v-if="adminAddStudent">
                    <v-text-field
                      v-model="studentEmail"
                      label="Student's Email"
                      required
                      dense
                      max-width="300px"
                      :rules="[rules.required, rules.email]"
                      @keyup.enter="findEmail()"
                    >
                    </v-text-field>
                    <v-row>
                      <v-btn
                        color="green"
                        text
                        :disabled="!validateEmail()"
                        @click="findEmail()"
                      >
                        Search
                      </v-btn>
                      <v-text-field
                        v-if="emailStatus != ''"
                        v-model="emailStatus"
                        readonly
                        dense
                      ></v-text-field>
                    </v-row>
                  </span>
                  <span v-if="studentNameInput">
                    <v-text-field
                      v-model="studentfName"
                      label="Student's First Name"
                      required
                      dense
                      max-width="300px"
                    >
                    </v-text-field>
                    <v-text-field
                      v-model="studentlName"
                      label="Student's Last Name"
                      required
                      dense
                      max-width="300px"
                    >
                    </v-text-field>
                  </span>
                  <!-- User sign up here -->
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    v-if="
                      !isTutorEvent ||
                      checkStatus('available') ||
                      checkRole('Student') ||
                      checkRole('Admin') ||
                      checkPrivilege('Sign up students for appointments')
                    "
                    color="primary"
                    :disabled="
                      !checkStatus('available') ||
                      isGroupBook ||
                      ((studentfName == '' || studentlName == '') &&
                        !emailFound &&
                        (checkRole('Admin') ||
                          checkPrivilege(
                            'Sign up students for appointments'
                          ))) ||
                      (checkRole('Admin') &&
                        selectedAppointment.type.includes('Group') &&
                        !adminAddStudent) ||
                      selectedAppointment.topicId == null ||
                      selectedAppointment.locationId == null ||
                      (isTutorEvent &&
                        !(
                          checkRole('Admin') ||
                          checkPrivilege('Sign up students for appointments')
                        )) ||
                      displayedStart === '' ||
                      displayedEnd === '' ||
                      (selectedAppointment.type.includes('Group') && datePast)
                    "
                    @click="
                      sendAppointmentForBooking();
                      selectedOpen = false;
                      secondTime = true;
                    "
                  >
                    Book
                  </v-btn>
                  <v-btn
                    v-if="
                      checkRole('Tutor') && !appointmentType.includes('Group')
                    "
                    color="#12f000"
                    :disabled="!checkStatus('pending') || datePast"
                    @click="
                      sendAppointmentForConfirmation();
                      secondTime = true;
                      selectedOpen = false;
                    "
                  >
                    Confirm
                  </v-btn>
                  <v-btn
                    v-if="
                      checkRole('Tutor') && !appointmentType.includes('Group')
                    "
                    color="error"
                    :disabled="!checkStatus('pending') || datePast"
                    @click="
                      showDeleteConfirmation = true;
                      secondTime = true;
                    "
                  >
                    Reject
                  </v-btn>
                  <v-btn
                    color="accent"
                    @click="
                      selectedOpen = false;
                      secondTime = true;
                    "
                  >
                    Close
                  </v-btn>
                  <v-btn
                    v-if="
                      (isTutorEvent || isPrivateBook) &&
                      saveChanges &&
                      !checkStatus('available')
                    "
                    color="accent"
                    @click="
                      editAppointment(user, selectedAppointment);
                      initializeData();
                      selectedOpen = false;
                      secondTime = true;
                    "
                  >
                    Save Changes
                  </v-btn>

                  <v-btn
                    v-if="
                      ((checkStatus('booked') &&
                        !checkRole('Admin') &&
                        (isTutorEvent || isPrivateBook)) ||
                        (isGroupBook && !adminAddStudent) ||
                        (isTutorEvent &&
                          (checkStatus('available') ||
                            checkStatus('booked'))) ||
                        (checkRole('Student') && checkStatus('pending'))) &&
                      !datePast
                    "
                    color="red"
                    @click="
                      showDeleteConfirmation = true;
                      initializeData();
                      selectedOpen = false;
                      secondTime = true;
                    "
                  >
                    Cancel Appointment
                  </v-btn>

                  <v-btn
                    v-if="
                      (checkRole('Admin') ||
                        checkPrivilege('Sign up students for appointments')) &&
                      checkStatus('available') &&
                      !datePast
                    "
                    color="green"
                    :disabled="adminAddStudent"
                    @click="
                      adminAddStudent = true;
                      secondTime = true;
                    "
                  >
                    Sign Up Student
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="keyVisible" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">Color Meanings</v-card-title>
        <v-card-text class="text-h6">
          <v-btn
            elevation="0"
            color="grey darken-1"
            class="white--text"
            width="100"
          >
            Grey
          </v-btn>
          <span>
            - This event marks an open time slot that is available to be booked
            by any student.</span
          >
          <br />
          <v-btn elevation="0" color="yellow" class="white--text" width="100">
            Yellow
          </v-btn>
          <span>
            - This event marks that a set time has been requested and is pending
            tutor approval.</span
          >
          <br />
          <v-btn elevation="0" color="red" class="white--text" width="100">
            Red
          </v-btn>
          <span>
            - This event marks a requested time slot that has been canceled by
            the tutor or the student.</span
          >
          <br />
          <v-btn elevation="0" color="blue" class="white--text" width="100">
            Blue
          </v-btn>
          <span>
            - This event marks a time slot that has been booked and notes an
            upcoming meeting.</span
          >
          <br />
          <v-btn elevation="0" color="green" class="white--text" width="100">
            Green
          </v-btn>
          <span>
            - This event marks a times lot that for a meeting that has been
            completed and has associated feedback, and is used for keeping track
            of user reviews.</span
          >
          <br />
          <v-btn elevation="0" color="purple" class="white--text" width="100">
            Purple
          </v-btn>
          <span>
            - This event marks a time slot that for a group session that allows
            both students and tutors to sign up for it.</span
          ><br />
          <v-card-title class="text-h5">Event Name Meanings</v-card-title>
          <span> G (Group session): {Topic name}</span><br />
          <span>
            P (Private session): {Tutor of session / Student who booked the
            session} <br
          /></span>
          <span v-if="checkRole('Admin')"
            >S (canceled session): {Status of canceled session}<br
          /></span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="hideKey">Close</v-btn>
          <v-spacer></v-spacer>
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
import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
//For info on people and their associated roles
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonRolePrivilegeServices from "@/services/personRolePrivilegeServices.js";
import RoleServices from "@/services/roleServices.js";
//For info to be shown with appointments
import LocationServices from "@/services/locationServices.js";
import TopicServices from "@/services/topicServices.js";
//Plugin functions
import Utils from "@/config/utils.js";
import DeleteConfirmationComponent from "../components/DeleteConfirmationComponent.vue";
import InformationComponent from "@/components/InformationComponent.vue";
import { AppointmentActionMixin } from "../mixins/AppointmentActionMixin";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "Calendar",
  components: {
    DeleteConfirmationComponent,
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
    showDeleteConfirmation: false,
    showAlert: false,
    alert: "",
    alertType: "success",
    overlay: true,
    message: "Calendar",
    mode: "stack",
    secondTime: true,
    //appointment info
    appointments: [],
    appointmentType: "",
    personAppointments: [],
    selectedAppointment: {},
    //info related to current appointment
    group: {},
    person: {},
    personroleprivileges: [],
    tutors: [],
    students: [],
    currentTopics: [],
    locations: [],
    //used for generating time slots
    startTimes: [],
    endTimes: [],
    newStart: null,
    newEnd: null,
    displayedStart: "",
    displayedEnd: "",
    //data for calendar function
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    keyVisible: false,
    topics: [],
    tutorSelect: [],
    selectedTopic: -1,
    selectedTutor: -1,
    isTutorEvent: null,
    isGroupBook: null,
    //event data for calendar events
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    groupColor: false,
    studentGroupColor: false,
    //current user data
    role: {},
    user: {},
    //admin adding a student
    adminAddStudent: false,
    studentEmail: "",
    emailStatus: "",
    studentNameInput: false,
    emailFound: false,
    studentfName: "",
    studentlName: "",
    walkInStudent: {},
    rules: {
      required: (value) => !!value || "Required.",
      email: (value) => {
        const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      },
    },
    //student and tutor names
    studentName: "",
    tutorName: "",
    //editing appointment
    saveChanges: false,
    isPrivateBook: false,
    // check if date past
    datePast: false,
  }),
  async created() {
    this.user = Utils.getStore("user");
    this.role = this.user.selectedRole;
    await this.getPrivilegesForPersonRole();
    await this.getGroupByPersonRoleId();
    await this.getTopicsForGroup();
    await this.getTutorsForGroup();
    await this.getLocationsForGroup();
    await this.initializeData();
  },
  methods: {
    // //Initialize data for calendar
    async initializeData() {
      this.overlay = true;
      await this.getAppointmentsForGroup(this.group.id).then((response) => {
        this.appointments = response;
      });
      await this.getAllPersonAppointments().then((response) => {
        this.personAppointments = response;
      });
      await this.loadAppointments();
      this.adminAddStudent = false;
      this.overlay = false;
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
    async getLocationsForGroup() {
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
    async getTopicsForTutor(tutor) {
      this.currentTopics = [];
      await TopicServices.getTopicByGroupForPerson(this.group.id, tutor.id)
        .then((response) => {
          let personTopics = response.data;
          personTopics.forEach(async (topic) => {
            this.currentTopics.push(topic);
          });
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getPrivilegesForPersonRole() {
      await PersonRolePrivilegeServices.getPrivilegeByPersonRole(this.id)
        .then((response) => {
          this.personroleprivileges = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    // Check to see if the tutor in question is the tutor of the selected event
    async isTutorOfSelectedEvent() {
      await PersonAppointmentServices.getPersonAppointmentForPerson(
        this.user.userID
      )
        .then((response) => {
          let temp = response.data;
          for (let i = 0; i < temp.length; i++) {
            if (
              temp[i].appointmentId == this.selectedAppointment.id &&
              temp[i].isTutor &&
              temp[i].personId == this.user.userID
            ) {
              this.isTutorEvent = true;
              return;
            }
          }
          this.isTutorEvent = false;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    //Check if student has already signed up for group appointment
    async checkGroupBooking() {
      if (this.adminAddStudent) {
        await PersonAppointmentServices.getPersonAppointmentForPerson(
          this.walkInStudent.id
        )
          .then((response) => {
            let temp = response.data;
            for (let i = 0; i < temp.length; i++) {
              if (
                temp[i].appointmentId == this.selectedAppointment.id &&
                this.selectedAppointment.type.includes("Group")
              ) {
                this.isGroupBook = true;
                return;
              }
            }
            this.isGroupBook = false;
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      } else {
        await PersonAppointmentServices.getPersonAppointmentForPerson(
          this.user.userID
        )
          .then((response) => {
            let temp = response.data;
            for (let i = 0; i < temp.length; i++) {
              if (
                temp[i].appointmentId == this.selectedAppointment.id &&
                this.selectedAppointment.type.includes("Group")
              ) {
                this.isGroupBook = true;
                return;
              }
            }
            this.isGroupBook = false;
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
    },
    async isStudentofAppointment() {
      await PersonAppointmentServices.getPersonAppointmentForPerson(
        this.user.userID
      ).then((response) => {
        let temp = response.data;
        for (let i = 0; i < temp.length; i++) {
          if (
            temp[i].appointmentId == this.selectedAppointment.id &&
            this.selectedAppointment.type.includes("Private") &&
            this.checkRole("Student")
          ) {
            this.isPrivateBook = true;
            return;
          }
        }
        this.isPrivateBook = false;
      });
    },
    async sendAppointmentForConfirmation() {
      await this.confirmAppointment(true, this.user, this.selectedAppointment);
      await this.initializeData();
    },
    async sendAppointmentForBooking() {
      if (this.adminAddStudent && this.studentNameInput) {
        await this.adminAdd();
      }
      this.selectedAppointment.newStart = this.newStart;
      this.selectedAppointment.newEnd = this.newEnd;
      this.selectedAppointment.minApptTime = this.group.minApptTime;
      await this.bookAppointment(
        this.adminAddStudent,
        this.selectedAppointment,
        this.user,
        this.walkInStudent
      );
      await this.initializeData();
    },
    updateTimes() {
      this.startTimes = this.generateTimeslots(
        this.selectedAppointment.startTime,
        this.newEnd,
        this.group.timeInterval
      );
      // adding this to make sure that you can't start an appointment at the end time
      this.startTimes.pop();
      this.endTimes = this.generateTimeslots(
        this.newStart,
        this.selectedAppointment.endTime,
        this.group.minApptTime
      );
      // adding this to make sure you can't end an appointment at the start time
      this.endTimes.shift();
    },
    // validate email function
    validateEmail() {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let email = pattern.test(this.studentEmail);
      if (email) {
        if (
          this.studentEmail.includes("oc.edu") ||
          this.studentEmail.includes("eagles.oc.edu")
        ) {
          return true;
        }
      } else return false;
    },
    //Functions that run calendar functionality
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
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    viewKey() {
      this.keyVisible = true;
    },
    hideKey() {
      this.keyVisible = false;
    },
    //Animates Event card popping up
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        AppointmentServices.getAppointment(event.appointmentId)
          .then(async (response) => {
            this.selectedAppointment = response.data;
            this.newStart = this.selectedAppointment.startTime;
            this.newEnd = this.selectedAppointment.endTime;
            this.appointmentType = this.selectedAppointment.type;
            this.isTutorOfSelectedEvent();
            this.checkGroupBooking();
            this.updateTimes();
            this.updatePeople();
            this.isStudentofAppointment();
            this.checkAppointmentIfPast();
            if (
              this.selectedAppointment.type.includes("Private") &&
              this.selectedAppointment.status.includes("available") &&
              this.group.allowSplittingAppointments &&
              this.subtractTimes(
                this.selectedAppointment.startTime,
                this.selectedAppointment.endTime
              ) >= this.group.minApptTime
            ) {
              this.displayedStart = "";
              this.displayedEnd = "";
            } else {
              this.displayedStart = this.selectedAppointment.startTime;
              this.displayedEnd = this.selectedAppointment.endTime;
            }
            this.selectedElement = nativeEvent.target;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => (this.selectedOpen = true))
            );
          })
          .catch((error) => {
            console.log(error);
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      };
      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
        this.saveChanges = false;
        this.adminAddStudent = false;
        this.studentEmail = "";
        this.emailStatus = "";
        this.studentfName = "";
        this.studentlName = "";
        this.studentNameInput = false;
      }
      nativeEvent.stopPropagation();
    },
    //Update the lists of tutors and students
    async updatePeople() {
      this.tutors = [];
      this.students = [];
      let tutorFound = false;
      this.personAppointments.forEach(async (person) => {
        if (person.appointmentId == this.selectedAppointment.id) {
          await PersonServices.getPerson(person.personId)
            .then((response) => {
              if (person.isTutor) {
                this.tutors.push(response.data);
                if (!tutorFound) {
                  this.getTopicsForTutor(response.data);
                  tutorFound = true;
                }
              } else {
                this.students.push(response.data);
              }
            })
            .catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
        }
      });
    },
    async isStudentInGroupAppoint(appoints) {
      this.studentGroupColor = false;
      for (let i = 0; i < appoints.length; i++) {
        if (!appoints[i].isTutor) {
          this.studentGroupColor = true;
          return;
        }
      }
      return;
    },
    //Checks if the current session matches the given status, for hiding certain elements
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
    async checkTopic(appoint) {
      let check = false;
      if (this.selectedTopic === null) return true;
      if (this.selectedTopic === appoint.topicId) return true;
      if (appoint.topicId !== null && this.selectedTopic !== appoint.topicId)
        return false;
      for (let i = 0; i < appoint.personappointment.length && !check; i++) {
        let personApp = appoint.personappointment[i];
        if (personApp.isTutor) {
          for (
            let j = 0;
            j < personApp.person.persontopic.length && !check;
            j++
          ) {
            let personTopic = personApp.person.persontopic[j];
            if (personTopic.topicId === this.selectedTopic) {
              check = true;
            }
          }
        }
      }
      return check;
    },
    async checkTutor(appoints) {
      let found = false;
      appoints.forEach((p) => {
        if (p.personId === this.selectedTutor && p.isTutor) found = true;
      });
      return found;
    },
    async isTutor(appoints) {
      let found = false;
      appoints.forEach((p) => {
        if (p.personId === this.user.userID && p.isTutor) found = true;
      });
      return found;
    },
    async isStudent(appoints) {
      let found = false;
      appoints.forEach((p) => {
        if (p.personId === this.user.userID && !p.isTutor) found = true;
      });
      return found;
    },
    checkRole(type) {
      if (this.role != null && this.role.type == type) {
        return true;
      } else {
        return false;
      }
    },
    checkPrivilege(privilege) {
      let hasPriv = false;
      this.personroleprivileges.forEach((priv) => {
        if (priv.privilege === privilege) hasPriv = true;
      });
      return hasPriv;
    },
    //Get the name of the student for the appointments
    async getStudentNameForAppointment(appoints) {
      var student = appoints.filter((person) => !person.isTutor);
      if (student.length !== 0) {
        this.studentName =
          student[0].person.fName + " " + student[0].person.lName;
      } else this.studentName = "Open";
    },
    //Get the name of the tutor for the appointments
    async getTutorNameForAppointment(appoints) {
      var tutor = appoints.filter((person) => person.isTutor);
      if (tutor.length !== 0) {
        this.tutorName = tutor[0].person.fName + " " + tutor[0].person.lName;
      } else this.tutorName = "Open";
    },
    //Load all appointments in backend into calendar events
    async loadAppointments() {
      let today = new Date();
      today.setHours(today.getHours() - today.getTimezoneOffset() / 60);
      today.setHours(0, 0, 0, 0);
      this.overlay = true;
      const events = [];
      let filtered;
      for (let i = 0; i < this.appointments.length; i++) {
        await this.groupBookColor(this.appointments[i].personappointment);
        await this.isStudentInGroupAppoint(this.appointments[i].students);
        //filter events to only add appropriate events
        filtered = true;
        //only add appointments from the current group
        if (this.appointments[i].groupId != this.group.id) {
          filtered = false;
        }
        //filter by topic
        let checkedtopic = await this.checkTopic(this.appointments[i]);
        if (this.selectedTopic != -1 && !checkedtopic) {
          filtered = false;
        }
        //filter by tutor
        let checkedTutor = await this.checkTutor(
          this.appointments[i].personappointment
        );
        if (this.selectedTutor != -1 && !checkedTutor) {
          filtered = false;
        }
        //filter all available appointments, their appointments, and all group appointments for STUDENTS
        let isStudent = await this.isStudent(
          this.appointments[i].personappointment
        );
        let isTutor = await this.isTutor(
          this.appointments[i].personappointment
        );
        if (this.checkRole("Student")) {
          //filter away private appointments that aren't a student's
          if (
            this.appointments[i].type.includes("Private") &&
            !isStudent &&
            !(this.appointments[i].status === "available")
          ) {
            filtered = false;
          }
          //filter away group appointments that have passed that aren't a student's
          if (
            this.appointments[i].type.includes("Group") &&
            !isStudent &&
            this.appointments[i].date < today.toISOString()
          ) {
            filtered = false;
          }
          //filter away canceled appointments
          if (
            this.appointments[i].status.includes("studentCancel") ||
            this.appointments[i].status.includes("tutorCancel")
          ) {
            filtered = false;
          }
        }
        //filter their appointments, all available appointments, all group appointments, and their canceled appointments for TUTORS
        else if (this.checkRole("Tutor")) {
          //filter away canceled appointments that aren't theirs
          if (
            !isTutor &&
            (this.appointments[i].status.includes("studentCancel") ||
              this.appointments[i].status.includes("tutorCancel"))
          ) {
            filtered = false;
          }
        }
        if (filtered) {
          //Set color for each event
          let color = "grey darken-1";
          switch (this.appointments[i].status) {
            case "pending":
              color = "yellow";
              break;
            case "studentCancel":
              color = "red";
              break;
            case "tutorCancel":
              color = "red";
              break;
            case "booked":
              color = "blue";
              break;
            case "complete":
              color = "green";
              break;
            default:
              color = "grey darken-1";
              break;
          }

          if (
            this.appointments[i].type.includes("Group") &&
            this.groupColor &&
            !(
              this.appointments[i].status.includes("tutorCancel") ||
              this.appointments[i].status.includes("studentCancel")
            )
          ) {
            color = "blue";
          } else if (
            this.appointments[i].type.includes("Group") &&
            !(
              this.appointments[i].status.includes("tutorCancel") ||
              this.appointments[i].status.includes("studentCancel")
            )
          ) {
            color = "purple";
          }

          //Format times for each event and need to set minutes for events too
          let startTime = new Date(this.appointments[i].date);
          let startTimes = this.appointments[i].startTime.split(":");
          startTime.setHours(startTime.getHours() + parseInt(startTimes[0]));
          startTime.setMinutes(
            startTime.getMinutes() + parseInt(startTimes[1])
          );
          let endTime = new Date(this.appointments[i].date);
          let endTimes = this.appointments[i].endTime.split(":");
          endTime.setHours(endTime.getHours() + parseInt(endTimes[0]));
          endTime.setMinutes(endTime.getMinutes() + parseInt(endTimes[1]));

          //Note the format of each event, what data is associated with it
          if (this.appointments[i].type.includes("Group")) {
            let topicName = this.appointments[i].topic.name;
            if (this.groupColor && !this.studentGroupColor) {
              topicName = "Open";
              color = "grey darken-1";
            }
            events.push({
              name: "G: " + topicName,
              start: startTime,
              end: endTime,
              color: color,
              timed: true,
              appointmentId: this.appointments[i].id,
            });
          }

          if (
            (this.appointments[i].type.includes("Private") &&
              this.checkRole("Tutor")) ||
            (this.checkRole("Admin") &&
              (this.appointments[i].status.includes("booked") ||
                this.appointments[i].status.includes("pending")))
          ) {
            await this.getStudentNameForAppointment(
              this.appointments[i].personappointment
            ).catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
            events.push({
              name: "P: " + this.studentName,
              start: startTime,
              end: endTime,
              color: color,
              timed: true,
              appointmentId: this.appointments[i].id,
            });
          } else if (
            this.appointments[i].type.includes("Private") &&
            !this.appointments[i].status.includes("Cancel") &&
            (this.checkRole("Student") || this.checkRole("Admin"))
          ) {
            await this.getTutorNameForAppointment(
              this.appointments[i].personappointment
            ).catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
            events.push({
              name: "P: " + this.tutorName,
              start: startTime,
              end: endTime,
              color: color,
              timed: true,
              appointmentId: this.appointments[i].id,
            });
          } else if (
            this.checkRole("Admin") &&
            !this.appointments[i].type.includes("Group")
          ) {
            events.push({
              name: "S: " + this.appointments[i].status,
              start: startTime,
              end: endTime,
              color: color,
              timed: true,
              appointmentId: this.appointments[i].id,
            });
          }
        }
      }

      this.overlay = false;
      this.events = events;
    },
    async groupBookColor(appoints) {
      this.groupColor = false;
      for (let i = 0; i < appoints.length; i++) {
        if (appoints[i].personId === this.user.userID) {
          this.groupColor = true;
          return;
        }
      }
    },
    async directToCancel() {
      this.selectedOpen = false;
      this.showDeleteConfirmation = false;
      if (this.selectedAppointment.status === "pending") {
        await this.confirmAppointment(
          false,
          this.user,
          this.selectedAppointment
        );
      } else {
        await this.cancelAppointment(this.selectedAppointment, this.user);
      }
      await this.initializeData();
    },
    async findEmail() {
      let tempStudent = {
        id: "",
        email: "",
        fName: "",
        lName: "",
      };
      let onlyTutor = true;
      await PersonServices.getPersonForEmail(this.studentEmail).then(
        (response) => {
          tempStudent = response.data;
        }
      );
      if (this.user.userID == tempStudent.id) {
        this.emailStatus = "You cannot sign yourself up for an appointment.";
        this.emailFound = true;
        return;
      } else if (tempStudent.id == this.tutors[0].id) {
        this.emailStatus =
          "You cannot sign up the tutor for their own appointment.";
        this.emailFound = true;
        return;
      } else if (!tempStudent.email.includes("not found")) {
        this.studentNameInput = false;
        await PersonServices.getAllForGroup(this.group.id).then(
          async (responseGroup) => {
            let people = responseGroup.data;
            for (let i = 0; i < people.length; i++) {
              if (people[i].id == tempStudent.id) {
                await RoleServices.getRoleByGroupForPerson(
                  this.group.id,
                  tempStudent.id
                ).then(async (result) => {
                  let role = result.data;
                  for (let k = 0; k < role.length; k++) {
                    if (role[k].type.includes("Student")) {
                      onlyTutor = false;
                    }
                  }
                  if (onlyTutor) {
                    await RoleServices.getAllForGroup(this.group.id).then(
                      async (responseRole) => {
                        let roles = responseRole.data;
                        for (let i = 0; i < roles.length; i++) {
                          if (roles[i].type == "Student") {
                            let personRole = {
                              status: "applied",
                              roleId: roles[i].id,
                              personId: tempStudent.id,
                              dateSigned: Date(),
                              agree: false,
                            };
                            await PersonRoleServices.addPersonRole(personRole);
                            this.emailStatus =
                              tempStudent.fName +
                              " " +
                              tempStudent.lName +
                              " has been added as a student!";
                            this.emailFound = true;
                            return;
                          }
                        }
                      }
                    );
                  }
                });
                this.emailStatus =
                  "Student " +
                  tempStudent.fName +
                  " " +
                  tempStudent.lName +
                  " found!";
                this.walkInStudent = tempStudent;
                this.emailFound = true;
                this.checkGroupBooking();
                return;
              }
            }
            this.emailStatus =
              "Student " +
              tempStudent.fName +
              " " +
              tempStudent.lName +
              " has been added to " +
              this.group.name +
              "!";
            this.walkInStudent = tempStudent;
            await RoleServices.getAllForGroup(this.group.id).then(
              (responseRole) => {
                let roles = responseRole.data;
                for (let i = 0; i < roles.length; i++) {
                  if (roles[i].type == "Student") {
                    let personRole = {
                      status: "applied",
                      roleId: roles[i].id,
                      personId: tempStudent.id,
                      dateSigned: Date(),
                      agree: false,
                    };
                    PersonRoleServices.addPersonRole(personRole);
                    this.emailFound = true;
                    return;
                  }
                }
              }
            );
          }
        );
      } else {
        this.studentNameInput = true;
        this.emailStatus = "No Student Found"; // get rid of popup and add to the open selecte event, then if email not found, add more blanks for student name
        this.isGroupBook = false;
        this.emailFound = false;
        this.studentfName = "";
        this.studentlName = "";
      }
    },
    // add a student to the system and then to the current group
    async adminAdd() {
      let student = {
        fName: this.studentfName,
        lName: this.studentlName,
        email: this.studentEmail,
        createdAt: Date(),
        updatedAt: Date(),
      };
      await PersonServices.addPerson(student).then(async (response) => {
        let tempStudent = response.data;
        this.walkInStudent = tempStudent;
        await RoleServices.getAllForGroup(this.group.id)
          .then((responseRole) => {
            let roles = responseRole.data;
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].type == "Student") {
                let personRole = {
                  status: "applied",
                  roleId: roles[i].id,
                  personId: response.data.id,
                  dateSigned: Date(),
                  agree: false,
                };
                PersonRoleServices.addPersonRole(personRole);
                return;
              }
            }
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      });
    },
    checkAppointmentIfPast() {
      let checkDate = new Date();
      checkDate.setHours(
        checkDate.getHours() - checkDate.getTimezoneOffset() / 60
      );
      checkDate.setHours(0, 0, 0, 0);
      let checkTime = new Date();
      let tempHours = checkTime.getHours();
      // check minutes for group's booking buffer
      let tempMins = checkTime.getMinutes();
      if (this.group.bookPastMinutes > 0) {
        tempMins -= this.group.bookPastMinutes;
        while (tempMins < 0) {
          tempMins += 60;
          tempHours--;
        }
      } else if (this.group.bookPastMinutes < 0) {
        tempMins -= this.group.bookPastMinutes;
        while (tempMins > 59) {
          tempMins -= 60;
          tempHours++;
        }
      }
      let tempSecs = checkTime.getSeconds();
      if (tempHours < 10) {
        tempHours = "0" + tempHours;
      }
      if (tempMins < 10) {
        tempMins = "0" + tempMins;
      }
      if (tempSecs < 10) {
        tempSecs = "0" + tempSecs;
      }
      checkTime = tempHours + ":" + tempMins + ":" + tempSecs;
      if (this.selectedAppointment.date < checkDate.toISOString()) {
        this.datePast = true;
      } else if (checkDate.toISOString() === this.selectedAppointment.date) {
        if (checkTime > this.selectedAppointment.startTime) {
          this.datePast = true;
        } else this.datePast = false;
      } else {
        this.datePast = false;
      }
    },
  },
};
</script>
