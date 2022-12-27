<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
        <InformationComponent
          message="Select an appointment to view information, book the appointment,
            make changes, etc.
            <br />
            You can filter the appointments by a desired <b>Topic</b> or <b>Tutor</b>."></InformationComponent>
        <v-spacer></v-spacer>
        <v-toolbar-title>{{ this.role.type }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        this.alert
      }}</v-alert>
      <v-dialog persistent v-model="showDeleteConfirmation" max-width="750px">
        <DeleteConfirmationComponent
          type="appointment"
          :item="selectedAppointment"
          @handleReturningCancel="showDeleteConfirmation = false"
          @handleReturningSuccess="
            directToCancel()
          "></DeleteConfirmationComponent>
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
                @click="viewMonth()">
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
                  dense
                  v-model="selectedTopic"
                  :items="topics"
                  item-text="name"
                  item-value="id"
                  label="Topic"
                  outlined
                  @change="loadAppointments()"></v-select>
              </v-col>
              <v-col cols="3" align-self="start">
                <v-select
                  dense
                  v-model="selectedTutor"
                  :items="tutorSelect"
                  item-text="name"
                  item-value="id"
                  label="Tutor"
                  outlined
                  @change="loadAppointments()"></v-select>
              </v-col>
              <v-btn
                outlined
                class="mr-4"
                color="grey darken-2"
                @click="viewKey()"
                right>
                Key
              </v-btn>
              <!-- Dropdown menu to select format -->
              <!-- Will modify to only include relevant formats -->
              <v-menu bottom right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    outlined
                    color="grey darken-2"
                    v-bind="attrs"
                    v-on="on">
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
              @click:date="viewDay"></v-calendar>

            <!--Pop-up that appears when an event is selected -->

            <!-- add another v-menu for group session v private-->
            <v-menu
              v-model="selectedOpen"
              :open-on-click="false"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x>
              <v-card color="grey lighten-4" min-width="350px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                  <v-btn icon>
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    v-html="selectedEvent.name"></v-toolbar-title>
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

                  <!-- make location and topic changable if the appointment type is private-->
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
                        @change="saveChanges = true">
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
                        ">
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
                        @change="saveChanges = true">
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
                        @change="saveChanges = true">
                      </v-select>
                    </v-container>
                  </span>
                  <!-- show time ad an changeable value for private lessons-->
                  <v-container v-if="checkStatus('available')">
                    <span
                      v-if="
                        appointmentType.includes('Private') &&
                        group.allowSplittingAppointments &&
                        selectedAppointment.endTime -
                          selectedAppointment.startTime >=
                          group.minApptTime
                      ">
                      <v-select
                        v-model="displayedStart"
                        :items="startTimes"
                        item-text="timeText"
                        item-value="time"
                        label="Booked Start"
                        required
                        @change="
                          newStart = displayedStart;
                          updateTimes();
                        "
                        :disabled="
                          (checkRole('Tutor') &&
                            (!checkPrivilege(
                              'Sign up students for appointments'
                            ) ||
                              !adminAddStudent)) ||
                          datePast
                        "
                        dense>
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
                        readonly>
                      </v-text-field>
                    </span>
                  </v-container>
                  <v-container v-if="checkStatus('available')">
                    <span
                      v-if="
                        appointmentType.includes('Private') &&
                        group.allowSplittingAppointments &&
                        selectedAppointment.endTime -
                          selectedAppointment.startTime >=
                          group.minApptTime
                      ">
                      <v-select
                        v-model="displayedEnd"
                        :items="endTimes"
                        item-text="timeText"
                        item-value="time"
                        label="Booked End"
                        required
                        @change="
                          newEnd = displayedEnd;
                          updateTimes();
                        "
                        :disabled="
                          (checkRole('Tutor') &&
                            (!checkPrivilege(
                              'Sign up students for appointments'
                            ) ||
                              !adminAddStudent)) ||
                          datePast
                        "
                        dense>
                      </v-select>
                    </span>
                    <span v-else>
                      <v-text-field
                        v-model="displayedEnd"
                        label="Booked End"
                        type="time"
                        required
                        dense
                        readonly>
                      </v-text-field>
                    </span>
                  </v-container>
                  <!-- put in presession-info for appointment for private appointments/ add a readonly if  group-->
                  <span v-if="appointmentType.includes('Private')">
                    <v-textarea
                      v-model="selectedAppointment.preSessionInfo"
                      id="preSession"
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
                      @change="saveChanges = true"></v-textarea>
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
                      @change="saveChanges = true"></v-textarea>
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
                      v-on:keyup.enter="findEmail()">
                    </v-text-field>
                    <v-row>
                      <v-btn
                        color="green"
                        text
                        @click="findEmail()"
                        :disabled="!validateEmail()">
                        Search
                      </v-btn>
                      <v-text-field
                        v-if="emailStatus != ''"
                        v-model="emailStatus"
                        readonly
                        dense></v-text-field>
                    </v-row>
                  </span>
                  <span v-if="studentNameInput">
                    <v-text-field
                      v-model="studentfName"
                      label="Student's First Name"
                      required
                      dense
                      max-width="300px">
                    </v-text-field>
                    <v-text-field
                      v-model="studentlName"
                      label="Student's Last Name"
                      required
                      dense
                      max-width="300px">
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
                    @click="
                      bookAppointment(selectedAppointment.id, group.id);
                      selectedOpen = false;
                    "
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
                    ">
                    Book
                  </v-btn>
                  <v-btn
                    v-if="
                      checkRole('Tutor') && !appointmentType.includes('Group')
                    "
                    color="#12f000"
                    @click="confirmAppointment(true)"
                    :disabled="!checkStatus('pending') || datePast">
                    Confirm
                  </v-btn>
                  <v-btn
                    v-if="
                      checkRole('Tutor') && !appointmentType.includes('Group')
                    "
                    color="error"
                    @click="showDeleteConfirmation = true"
                    :disabled="!checkStatus('pending') || datePast">
                    Reject
                  </v-btn>
                  <v-btn color="accent" @click="selectedOpen = false">
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
                      editAppointment();
                      selectedOpen = false;
                    ">
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
                    @click="showDeleteConfirmation = true">
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
                    @click="adminAddStudent = true"
                    :disabled="adminAddStudent">
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
            width="100">
            Grey
          </v-btn>
          <span>
            - This event marks an open timeslot that is available to be booked
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
            - This event marks a requested timeslot that has been canceled by
            the tutor.</span
          >
          <br />
          <v-btn elevation="0" color="blue" class="white--text" width="100">
            Blue
          </v-btn>
          <span>
            - This event marks a timeslot that has been booked and notes an
            upcoming meeting.</span
          >
          <br />
          <v-btn elevation="0" color="green" class="white--text" width="100">
            Green
          </v-btn>
          <span>
            - This event marks a timeslot that for a meeting that has been
            completed, and is used for keeping track of user reviews.</span
          >
          <br />
          <v-btn elevation="0" color="purple" class="white--text" width="100">
            Purple
          </v-btn>
          <span>
            - This event marks a timeslot that for a group session that allows
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
import { SendTextsMixin } from "../mixins/SendTextsMixin";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "Calendar",
  props: ["id"],
  mixins: [AppointmentActionMixin, SendTextsMixin, TimeFunctionsMixin],
  components: {
    DeleteConfirmationComponent,
    InformationComponent,
  },
  data: () => ({
    showDeleteConfirmation: false,
    showAlert: false,
    alert: "",
    alertType: "success",
    overlay: true,
    message: "Calendar",
    mode: "stack",
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
    allTopics: null,
    allPeople: null,
    // check if date past
    datePast: false,
  }),
  async created() {
    this.user = Utils.getStore("user");
    this.getGroupByPersonRoleId();
    this.role = this.user.selectedRole;
    // this.getRole();
    this.getPrivilegesForPersonRole();
    this.getAppointments(this.group.id);
    this.loadTopics();
    this.loadPeople();
    this.isTutorOfSelectedEvent();
  },
  methods: {
    // //Initialize data for calendar
    async getAppointments() {
      this.overlay = true;
      await this.getGroupByPersonRoleId();
      await AppointmentServices.findAppointmentsForGroup(this.group.id)
        .then(async (response) => {
          this.appointments = response.data;
          await PersonAppointmentServices.getAllPersonAppointments()
            .then(async (response) => {
              this.personAppointments = response.data;
              await this.loadAppointments();
            })
            .catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
      this.overlay = false;
    },
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group;
          this.getTopicsForGroup();
          this.getTutorsForGroup();
          this.getLocations();
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
          temp.push({ name: "Any", id: -1 });
          this.topics = temp;
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
    //Update on a session being booked
    async bookAppointment() {
      await AppointmentServices.getAppointment(this.selectedAppointment.id)
        .then(async (response) => {
          if (
            response.data.status == "available" &&
            response.data.type.includes("Private") &&
            !this.checkRole("Admin") &&
            !this.adminAddStudent
          ) {
            await this.splitAppointment().then(() => {
              this.getAppointments(this.group.id);
              this.selectedEvent.color = "yellow";
            });
          } else if (
            this.adminAddStudent &&
            !this.studentNameInput &&
            response.data.type.includes("Private")
          ) {
            await this.splitAppointmentForAdminAdd().then(() => {
              this.getAppointments(this.group.id);
              this.selectedEvent.color = "blue";
            });
          } else if (
            this.adminAddStudent &&
            this.studentNameInput &&
            response.data.type.includes("Private")
          ) {
            await this.adminAdd().then(() => {
              this.splitAppointmentForAdminAdd().then(() => {
                this.getAppointments(this.group.id);
                this.selectedEvent.color = "blue";
              });
            });
          } else if (response.data.type.includes("Group")) {
            this.bookGroupSession();
          } else {
            this.alertType = "warning";
            this.alert =
              "This appointment has already been booked. Try a different time.";
            this.showAlert = true;
            this.getAppointments(this.group.id);
            this.selectedOpen = false;
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    //Update on tutor confirming booking
    async confirmAppointment(confirm) {
      if (confirm) {
        if (this.appointmentType.includes("Private")) {
          this.selectedAppointment.status = "booked";
          await AppointmentServices.updateForGoogle(
            this.selectedAppointment.id,
            this.selectedAppointment
          )
            .then(async () => {
              await this.sendConfirmedMessage(this.selectedAppointment.id);
              this.getAppointments(this.group.id);
              this.selectedEvent.color = "blue";
            })
            .catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
        }
        this.alertType = "success";
        this.alert =
          "You have successfully confirmed your " +
          this.selectedAppointment.type +
          " appointment on " +
          this.selectedAppointment.date +
          " at " +
          this.selectedAppointment.startTime +
          ".";
        this.showAlert = true;
      } else {
        // don't need to update google cal because it's not even on there yet
        this.selectedAppointment.status = "tutorCancel";
        await AppointmentServices.updateAppointment(
          this.selectedAppointment.id,
          this.selectedAppointment
        )
          .then(() => {
            this.sendCanceledMessage(this.user, this.selectedAppointment.id);
            this.getAppointments(this.group.id);
            this.selectedEvent.color = "red";
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
        this.alertType = "warning";
        this.alert =
          "You have successfully rejected your " +
          this.selectedAppointment.type +
          " appointment on " +
          this.selectedAppointment.date +
          " at " +
          this.selectedAppointment.startTime +
          ".";
        this.showAlert = true;
      }
    },
    //Add personAppointments from Group Sessions
    async bookGroupSession() {
      //Load person info
      if (this.adminAddStudent && this.studentNameInput) {
        await this.adminAdd()
          .then(async () => {
            this.person.isTutor = false;
            this.person.appointmentId = this.selectedAppointment.id;
            this.person.personId = this.walkInStudent.id;
            await PersonAppointmentServices.addPersonAppointment(this.person)
              .then(() => {
                this.getAppointments(this.group.id);
              })
              .catch((error) => {
                this.alertType = "error";
                this.alert = error.response.data.message;
                this.showAlert = true;
                console.log("There was an error:", error.response);
              });
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
        await this.sendMessageFromAdmin(
          this.user,
          this.walkInStudent,
          this.selectedAppointment.id
        );
      } else if (this.adminAddStudent && !this.studentNameInput) {
        this.person.isTutor = false;
        this.person.appointmentId = this.selectedAppointment.id;
        this.person.personId = this.walkInStudent.id;
        await PersonAppointmentServices.addPersonAppointment(this.person)
          .then(() => {
            this.getAppointments(this.group.id);
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
        await this.sendMessageFromAdmin(
          this.user,
          this.walkInStudent,
          this.selectedAppointment.id
        );
      } else {
        if (this.checkRole("Tutor")) {
          this.person.isTutor = true;
        } else {
          this.person.isTutor = false;
        }
        this.person.appointmentId = this.selectedAppointment.id;
        this.person.personId = this.user.userID;
        //Update stored data
        await PersonAppointmentServices.addPersonAppointment(this.person)
          .then(() => {
            this.getAppointments(this.group.id);
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
        await this.sendGroupMessage(this.user, this.selectedAppointment.id);
      }
      // need to update group session in google
      await AppointmentServices.updateForGoogle(
        this.selectedAppointment.id,
        this.selectedAppointment
      ).catch((error) => {
        this.alertType = "error";
        this.alert = error.response.data.message;
        this.showAlert = true;
        console.log("There was an error:", error.response);
      });

      this.alertType = "success";
      this.alert =
        "You have successfully booked a " +
        this.selectedAppointment.type +
        " appointment on " +
        this.selectedAppointment.date +
        " at " +
        this.selectedAppointment.startTime +
        ".";
      this.showAlert = true;
    },

    //Split appointments into more availablity slots when part of slot is booked by an Admin
    async splitAppointmentForAdminAdd() {
      if (!this.checkStatus("available")) {
        return;
      }
      //If the start of the booked slot isn't the start of the slot, generate an open slot
      if (this.selectedAppointment.startTime < this.newStart) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.selectedAppointment.startTime,
          endTime: this.newStart,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        };
        await AppointmentServices.addAppointment(temp)
          .then(async (response) => {
            this.tutors.forEach(async (t) => {
              let pap = {
                isTutor: true,
                appointmentId: response.data.id,
                personId: t.id,
              };
              await PersonAppointmentServices.addPersonAppointment(pap).catch(
                (error) => {
                  this.alertType = "error";
                  this.alert = error.response.data.message;
                  this.showAlert = true;
                  console.log("There was an error:", error.response);
                }
              );
            });
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
      //If the end of the booked slot isn't the end of the slot, generate an open slot
      if (this.selectedAppointment.endTime > this.newEnd) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.newEnd,
          endTime: this.selectedAppointment.endTime,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        };
        await AppointmentServices.addAppointment(temp)
          .then((response) => {
            this.tutors.forEach(async (t) => {
              let pap = {
                isTutor: true,
                appointmentId: response.data.id,
                personId: t.id,
              };
              await PersonAppointmentServices.addPersonAppointment(pap).catch(
                (error) => {
                  this.alertType = "error";
                  this.alert = error.response.data.message;
                  this.showAlert = true;
                  console.log("There was an error:", error.response);
                }
              );
            });
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
      //Load appointment info
      this.selectedAppointment.status = "booked";
      this.selectedAppointment.endTime = this.newEnd;
      this.selectedAppointment.startTime = this.newStart;
      //Load person info
      this.person.isTutor = false;
      this.person.appointmentId = this.selectedAppointment.id;
      this.person.personId = this.walkInStudent.id;
      //Update stored data
      await AppointmentServices.updateForGoogle(
        this.selectedAppointment.id,
        this.selectedAppointment
      ).catch((error) => {
        this.alertType = "error";
        this.alert = error.response.data.message;
        this.showAlert = true;
        console.log("There was an error:", error.response);
      });
      await PersonAppointmentServices.addPersonAppointment(this.person).catch(
        (error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        }
      );
      await this.sendMessageFromAdmin(
        this.user,
        this.walkInStudent,
        this.selectedAppointment.id
      );
      this.adminAddStudent = false;
      this.alertType = "success";
      this.alert =
        "You have successfully booked a " +
        this.selectedAppointment.type +
        " appointment for " +
        this.walkInStudent.fName +
        " " +
        this.walkInStudent.lName +
        " with " +
        this.tutors[0].fName +
        " " +
        this.tutors[0].lName +
        " on " +
        this.selectedAppointment.date +
        " at " +
        this.selectedAppointment.startTime +
        ".";
      this.showAlert = true;
    },

    // Split appointments into more availablity slots when part of slot is booked
    async splitAppointment() {
      if (!this.checkStatus("available")) {
        return;
      }
      //If the start of the booked slot isn't the start of the slot, generate an open slot
      if (this.selectedAppointment.startTime < this.newStart) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.selectedAppointment.startTime,
          endTime: this.newStart,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
        };
        await AppointmentServices.addAppointment(temp)
          .then((response) => {
            this.tutors.forEach(async (t) => {
              let pap = {
                isTutor: true,
                appointmentId: response.data.id,
                personId: t.id,
              };
              await PersonAppointmentServices.addPersonAppointment(pap).catch(
                (error) => {
                  this.alertType = "error";
                  this.alert = error.response.data.message;
                  this.showAlert = true;
                  console.log("There was an error:", error.response);
                }
              );
            });
          })
          .catch((error) => {
            console.log(error);
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
      //If the end of the booked slot isn't the end of the slot, generate an open slot
      if (this.selectedAppointment.endTime > this.newEnd) {
        let temp = {
          date: this.selectedAppointment.date,
          startTime: this.newEnd,
          endTime: this.selectedAppointment.endTime,
          type: this.selectedAppointment.type,
          status: this.selectedAppointment.status,
          preSessionInfo: "",
          groupId: this.selectedAppointment.groupId,
          //locationId: this.selectedAppointment.locationId,
          //topicId: this.selectedAppointment.topicId,
        };
        await AppointmentServices.addAppointment(temp)
          .then((response) => {
            this.tutors.forEach(async (t) => {
              let pap = {
                isTutor: true,
                appointmentId: response.data.id,
                personId: t.id,
              };
              await PersonAppointmentServices.addPersonAppointment(pap).catch(
                (error) => {
                  this.alertType = "error";
                  this.alert = error.response.data.message;
                  this.showAlert = true;
                  console.log("There was an error:", error.response);
                }
              );
            });
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
      //Load appointment info
      this.selectedAppointment.status = "pending";
      this.selectedAppointment.endTime = this.newEnd;
      this.selectedAppointment.startTime = this.newStart;
      //Load person info
      this.person.isTutor = false;
      this.person.appointmentId = this.selectedAppointment.id;
      this.person.personId = this.$store.state.loginUser.userID;
      //Update stored data
      await AppointmentServices.updateAppointment(
        this.selectedAppointment.id,
        this.selectedAppointment
      ).catch((error) => {
        this.alertType = "error";
        this.alert = error.response.data.message;
        this.showAlert = true;
        console.log("There was an error:", error.response);
      });
      await PersonAppointmentServices.addPersonAppointment(this.person).catch(
        (error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        }
      );
      await this.sendPendingMessage(this.selectedAppointment.id);

      this.alertType = "success";
      this.alert =
        "You have successfully booked a " +
        this.selectedAppointment.type +
        " appointment with " +
        this.tutors[0].fName +
        " " +
        this.tutors[0].lName +
        " on " +
        this.selectedAppointment.date +
        " at " +
        this.selectedAppointment.startTime +
        ".";
      this.showAlert = true;
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
        this.group.timeInterval
      );
      // adding this to make sure you can't end an appointment at the start time
      this.endTimes.shift();
    },
    //Load data for info associated with events
    async getTopic(topicId) {
      await TopicServices.getTopic(topicId)
        .then((response) => {
          this.topic = response.data;
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
              this.selectedAppointment.endTime -
                this.selectedAppointment.startTime >=
                this.group.minApptTime
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
    getPersonName(id) {
      return this.allPeople.get(id).fName + " " + this.allPeople.get(id).lName;
    },
    //Get the name of the student for the appointments
    async getStudentNameForAppointment(appoints) {
      var student = appoints.filter((person) => !person.isTutor);
      if (student.length !== 0) {
        var studentId = student[0].personId;
        this.studentName = this.getPersonName(studentId);
      } else this.studentName = "Open";
    },
    //Get the name of the tutor for the appointments
    async getTutorNameForAppointment(appoints) {
      var tutor = appoints.filter((person) => person.isTutor);
      if (tutor.length !== 0) {
        var tutorId = tutor[0].personId;
        this.tutorName = this.getPersonName(tutorId);
      } else this.tutorName = "Open";
    },
    async loadTopics() {
      this.allTopics = new Map();
      TopicServices.getAllTopics()
        .then((response) => {
          let tempTopics = response.data;
          tempTopics.forEach((topic) => {
            this.allTopics.set(topic.id, topic.name);
          });
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },

    getTopicName(id) {
      return this.allTopics.get(id);
    },
    async loadPeople() {
      this.allPeople = new Map();
      PersonServices.getAllPersons()
        .then((response) => {
          let tempPersons = response.data;
          tempPersons.forEach((person) => {
            this.allPeople.set(person.id, person);
          });
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
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
        await this.isStudentInGroupAppoint(
          this.appointments[i].personappointment
        );
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
      if (this.selectedAppointment.status === "pending")
        await this.confirmAppointment(false);
      else if (this.selectedAppointment.status === "booked")
        await this.cancelAppointment();
      this.selectedOpen = false;
      this.showDeleteConfirmation = false;
    },
    //method for canceling appointments
    async cancelAppointment() {
      this.sendCanceledMessage(this.user, this.selectedAppointment.id);
      //delete appointment as a student of a private session
      if (
        this.selectedAppointment.type.includes("Private") &&
        this.checkRole("Student") &&
        this.checkStatus("booked")
      ) {
        this.selectedAppointment.status = "studentCancel";
        await AppointmentServices.updateForGoogle(
          this.selectedAppointment.id,
          this.selectedAppointment
        ).then(async () => {
          let temp = {
            date: this.selectedAppointment.date,
            startTime: this.selectedAppointment.startTime,
            endTime: this.selectedAppointment.endTime,
            type: this.selectedAppointment.type,
            status: "available",
            preSessionInfo: "",
            groupId: this.selectedAppointment.groupId,
          };
          await AppointmentServices.addAppointment(temp)
            .then(async (response) => {
              this.tutors.forEach(async (t) => {
                let pap = {
                  isTutor: true,
                  appointmentId: response.data.id,
                  personId: t.id,
                };
                await PersonAppointmentServices.addPersonAppointment(pap);
              });
              await this.getAppointments(this.group.id);
              //this.$router.go(0);
            })
            .catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
        });
      } else if (
        this.selectedAppointment.type.includes("Private") &&
        this.checkRole("Student") &&
        this.checkStatus("pending")
      ) {
        this.selectedAppointment.status = "available";
        this.selectedAppointment.locationId = null;
        this.selectedAppointment.topicId = null;
        this.selectedAppointment.preSessionInfo = "";
        // don't need to update google event because it doesn't exist
        await AppointmentServices.updateAppointment(
          this.selectedAppointment.id,
          this.selectedAppointment
        ).catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
        for (let i = 0; i < this.personAppointments.length; i++) {
          if (
            this.personAppointments[i].appointmentId ==
              this.selectedAppointment.id &&
            !this.personAppointments[i].isTutor &&
            this.personAppointments[i].personId == this.user.userID
          ) {
            await PersonAppointmentServices.deletePersonAppointment(
              this.personAppointments[i].id
            );
            await this.getAppointments(this.group.id);
            //this.$router.go(0);
          }
        }
      }
      //delete appointment as a student of a group session
      else if (
        this.selectedAppointment.type.includes("Group") &&
        this.checkRole("Student")
      ) {
        for (let i = 0; i < this.personAppointments.length; i++) {
          if (
            this.personAppointments[i].appointmentId ==
              this.selectedAppointment.id &&
            !this.personAppointments[i].isTutor &&
            this.personAppointments[i].personId == this.user.userID
          ) {
            await PersonAppointmentServices.deletePersonAppointment(
              this.personAppointments[i].id
            );
            await AppointmentServices.updateForGoogle(
              this.selectedAppointment.id,
              this.selectedAppointment
            ).catch((error) => {
              this.alertType = "error";
              this.alert = error.response.data.message;
              this.showAlert = true;
              console.log("There was an error:", error.response);
            });
            await this.getAppointments(this.group.id);
            //this.$router.go(0);
          }
        }
      }
      //delete appointment as a tutor of a private session
      else if (
        this.selectedAppointment.type.includes("Private") &&
        this.checkRole("Tutor")
      ) {
        for (let i = 0; i < this.personAppointments.length; i++) {
          if (
            this.personAppointments[i].appointmentId ==
              this.selectedAppointment.id &&
            this.personAppointments[i].isTutor
          ) {
            for (let j = 0; j < this.personAppointments.length; j++) {
              if (
                this.personAppointments[j].appointmentId ==
                  this.selectedAppointment.id &&
                !this.personAppointments[j].isTutor
              ) {
                this.selectedAppointment.status = "tutorCancel";
                await AppointmentServices.updateForGoogle(
                  this.selectedAppointment.id,
                  this.selectedAppointment
                );
                await this.getAppointments(this.group.id);
                return;
              }
            }

            await PersonAppointmentServices.deletePersonAppointment(
              this.personAppointments[i].id
            );

            await AppointmentServices.deleteAppointment(
              this.selectedAppointment.id
            );

            await this.getAppointments(this.group.id);
            //this.$router.go(0);
          }
        }
      }
      //delete appointment as a tutor of a group session
      else if (
        this.selectedAppointment.type.includes("Group") &&
        this.checkRole("Tutor")
      ) {
        for (let i = 0; i < this.personAppointments.length; i++) {
          if (
            this.personAppointments[i].appointmentId ==
              this.selectedAppointment.id &&
            this.personAppointments[i].isTutor &&
            this.personAppointments[i].personId == this.user.userID
          ) {
            await PersonAppointmentServices.getAllPersonAppointments()
              .then((response) => {
                this.personAppointments = response.data;
              })
              .catch((error) => {
                this.alertType = "error";
                this.alert = error.response.data.message;
                this.showAlert = true;
                console.log("There was an error:", error.response);
              });
            let found = false;
            for (let j = 0; j < this.personAppointments.length; j++) {
              if (
                this.personAppointments[j].appointmentId ==
                  this.selectedAppointment.id &&
                this.personAppointments[j].isTutor &&
                this.personAppointments[j].personId != this.user.userID
              ) {
                found = true;
              }
            }
            if (this.students.length > 0 && this.tutors.length == 1) {
              this.selectedAppointment.status = "tutorCancel";
              await AppointmentServices.updateForGoogle(
                this.selectedAppointment.id,
                this.selectedAppointment
              ).catch((error) => {
                this.alertType = "error";
                this.alert = error.response.data.message;
                this.showAlert = true;
                console.log("There was an error:", error.response);
              });
            } else if (found) {
              await PersonAppointmentServices.deletePersonAppointment(
                this.personAppointments[i].id
              ).catch((error) => {
                this.alertType = "error";
                this.alert = error.response.data.message;
                this.showAlert = true;
                console.log("There was an error:", error.response);
              });
            } else {
              await AppointmentServices.deleteAppointment(
                this.selectedAppointment.id
              ).catch((error) => {
                this.alertType = "error";
                this.alert = error.response.data.message;
                this.showAlert = true;
                console.log("There was an error:", error.response);
              });
            }
            await this.getAppointments(this.group.id);

            //this.$router.go(0);
          }
        }
      }
      this.alertType = "warning";
      this.alert =
        "You have successfully canceled your " +
        this.selectedAppointment.type +
        " appointment on " +
        this.selectedAppointment.date +
        " at " +
        this.selectedAppointment.startTime +
        ".";
      this.showAlert = true;
    },
    async findEmail() {
      if (this.validateEmail()) {
        await PersonServices.getPersonForEmail(this.studentEmail)
          .then((response) => {
            let temp = response.data;
            let onlyTutor = true;
            if (this.user.userID == temp.id) {
              this.emailStatus =
                "You cannot sign yourself up for an appointment.";
              this.emailFound = true;
              return;
            } else if (temp.id == this.tutors[0].id) {
              this.emailStatus =
                "You cannot sign-up the tutor for their own appointment.";
              this.emailFound = true;
              return;
            } else if (!temp.email.includes("not found")) {
              this.studentNameInput = false;
              PersonServices.getAllForGroup(this.group.id).then(
                async (responseGroup) => {
                  let people = responseGroup.data;
                  for (let i = 0; i < people.length; i++) {
                    if (people[i].id == temp.id) {
                      await RoleServices.getRoleByGroupForPerson(
                        this.group.id,
                        temp.id
                      ).then(async (result) => {
                        let role = result.data;
                        for (let k = 0; k < role.length; k++) {
                          if (role[k].type.includes("Student")) {
                            onlyTutor = false;
                          }
                        }
                        if (onlyTutor) {
                          await RoleServices.getAllForGroup(this.group.id).then(
                            (responseRole) => {
                              let roles = responseRole.data;
                              for (let i = 0; i < roles.length; i++) {
                                if (roles[i].type == "Student") {
                                  let personRole = {
                                    status: "applied",
                                    roleId: roles[i].id,
                                    personId: temp.id,
                                    dateSigned: Date(),
                                    agree: false,
                                  };
                                  PersonRoleServices.addPersonRole(personRole);
                                  this.emailStatus =
                                    temp.fName +
                                    " " +
                                    temp.lName +
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
                        "Student " + temp.fName + " " + temp.lName + " found!";
                      this.walkInStudent = temp;
                      this.emailFound = true;
                      this.checkGroupBooking();
                      return;
                    }
                  }
                  this.emailStatus =
                    "Student " +
                    temp.fName +
                    " " +
                    temp.lName +
                    " has been added to " +
                    this.group.name +
                    "!";
                  this.walkInStudent = temp;
                  RoleServices.getAllForGroup(this.group.id).then(
                    (responseRole) => {
                      let roles = responseRole.data;
                      for (let i = 0; i < roles.length; i++) {
                        if (roles[i].type == "Student") {
                          let personRole = {
                            status: "applied",
                            roleId: roles[i].id,
                            personId: temp.id,
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
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
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
        let temp = response.data;
        this.walkInStudent = temp;
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
    async editAppointment() {
      await AppointmentServices.updateForGoogle(
        this.selectedAppointment.id,
        this.selectedAppointment
      )
        .then(async () => {
          this.sendEditedMessage(this.user, this.selectedAppointment.id);
          this.alertType = "success";
          this.alert =
            "You have successfully updated your " +
            this.selectedAppointment.type +
            " appointment on " +
            this.selectedAppointment.date +
            " at " +
            this.selectedAppointment.startTime +
            ".";
          this.showAlert = true;
          await this.getAppointments(this.group.id);
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
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
      if (
        (this.checkRole("Admin") ||
          this.checkPrivilege("Sign up students for appointments")) &&
        this.group.bookPastMinutes > 0
      ) {
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
