<template>
  <v-card min-width="350px">
    <v-card-title :class="appointment.color + ' white--text mb-6'">{{
      appointment.name
    }}</v-card-title>
    <v-card-text>
      <div class="text-subtitle black--text">
        {{ formatReadableDate(appointment.date) }} °
        {{ calcTime(appointment.startTime) }}-{{
          calcTime(appointment.endTime)
        }}
      </div>
      <br />
      <b>Tutors: </b>
      {{ tutorString }}
      <br />
      <b>Students: </b>
      {{ studentString }}
      <br />
      <span
        v-if="
          appointment.location.type === 'Online' && appointment.URL !== null
        "
      >
        <b>Google Meet Link: </b>
        <a :href="appointment.URL">{{ appointment.URL }}</a>
        <br />
      </span>
      <span v-if="canEditLocation">
        <v-select
          v-model="appointment.locationId"
          :items="locations"
          item-text="name"
          item-value="id"
          label="Location"
          prepend-icon="mdi-map-marker"
          required
          @change="saveChanges = true"
        >
        </v-select>
      </span>
      <span v-else>
        <v-text-field
          class="black--text"
          flat
          prepend-icon="mdi-map-marker"
          :value="appointment.location.name"
        >
        </v-text-field>
      </span>

      <v-select
        v-model="appointment.topicId"
        :items="currentTopics"
        item-text="name"
        item-value="id"
        label="Topic"
        prepend-icon="mdi-bookshelf"
        required
        :readonly="!canEditTopic"
        @change="saveChanges = true"
      >
      </v-select>

      <v-select
        v-model="displayedStart"
        :items="startTimes"
        item-text="timeText"
        item-value="time"
        label="Booked Start"
        prepend-icon="mdi-clock-edit-outline"
        required
        :readonly="!canEditFirstTime"
        @change="
          newStart = displayedStart;
          updateTimes();
          canEditSecondTime = true;
        "
      >
      </v-select>

      <v-select
        v-model="displayedEnd"
        :items="endTimes"
        item-text="timeText"
        item-value="time"
        label="Booked End"
        required
        :readonly="!canEditFirstTime || !canEditSecondTime"
        @change="
          newEnd = displayedEnd;
          updateTimes();
        "
      >
      </v-select>

      <v-textarea
        id="preSession"
        v-model="appointment.preSessionInfo"
        :counter="130"
        label="What do you need help with?"
        prepend-icon="mdi-help"
        required
        auto-grow
        rows="2"
        :readonly="!canEditPreSession"
        @change="saveChanges = true"
      ></v-textarea>

      <span v-if="isAdminAddStudent">
        <v-text-field
          v-model="addedStudent.email"
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
            v-if="emailStatus !== ''"
            v-model="emailStatus"
            readonly
            dense
          ></v-text-field>
        </v-row>
      </span>
      <span v-if="needStudentInfo">
        <v-text-field
          v-model="addedStudent.fName"
          label="Student's First Name"
          required
          dense
          max-width="300px"
        >
        </v-text-field>
        <v-text-field
          v-model="addedStudent.lName"
          label="Student's Last Name"
          required
          dense
          max-width="300px"
        >
        </v-text-field>
      </span>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey white--text" @click="$emit('closeAppointmentDialog')">
        {{ saveChanges ? "Discard Changes" : "Close" }}
      </v-btn>

      <v-btn
        v-if="showEnableSignUpButton"
        color="darkblue white--text"
        :disabled="isAdminAddStudent"
        @click="isAdminAddStudent = true"
      >
        Sign Up Student
      </v-btn>
      <v-btn
        v-if="showEnableCancelButton"
        color="red white--text"
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
        v-if="showEnableConfirmRejectButtons"
        color="error white--text"
        @click="
          showDeleteConfirmation = true;
          secondTime = true;
        "
      >
        Reject
      </v-btn>
      <v-btn
        v-if="showEnableConfirmRejectButtons"
        color="primary"
        @click="
          sendAppointmentForConfirmation();
          secondTime = true;
          selectedOpen = false;
        "
      >
        Confirm
      </v-btn>
      <v-btn
        v-if="showSaveButton"
        color="primary"
        :disabled="!saveChanges"
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
        v-if="showBookButton"
        color="primary"
        :disabled="!enableBookButton"
        @click="
          sendAppointmentForBooking();
          selectedOpen = false;
          secondTime = true;
        "
      >
        Book
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="showDeleteConfirmation" persistent max-width="750px">
      <DeleteConfirmationComponent
        type="appointment"
        :item="appointment"
        @handleReturningCancel="showDeleteConfirmation = false"
        @handleReturningSuccess="
          isDisabled
            ? changeTopicStatus('active')
            : changeTopicStatus('disabled')
        "
      ></DeleteConfirmationComponent>
    </v-dialog>
  </v-card>
</template>

<script>
//For info on people and their associated roles
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
// import PersonRolePrivilegeServices from "@/services/personRolePrivilegeServices.js";
//For info to be shown with appointments
import LocationServices from "@/services/locationServices.js";
import TopicServices from "@/services/topicServices.js";
//Plugin functions
import Utils from "@/config/utils.js";
import DeleteConfirmationComponent from "./DeleteConfirmationComponent.vue";
import { TimeFunctionsMixin } from "../mixins/TimeFunctionsMixin";

export default {
  name: "AppointmentDialogBody",
  components: {
    DeleteConfirmationComponent,
  },
  mixins: [TimeFunctionsMixin],
  props: {
    sentAppointment: {
      type: [Object],
      default() {
        return {
          startTime: "",
          endTime: "",
          locationId: "",
          topicId: "",
          preSessionInfo: "",
          groupId: "",
        };
      },
    },
    sentEvent: {
      type: [Object],
      default() {
        return {
          name: "",
          color: "",
          students: [],
          tutors: [],
        };
      },
    },
  },
  data() {
    return {
      user: {},
      addedStudent: {
        id: "",
        email: "",
        fName: "",
        lName: "",
      },
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        },
      },
      locations: [],
      currentTopics: [],
      appointment: this.sentAppointment,
      startTimes: [],
      endTimes: [],
      newStart: null,
      newEnd: null,
      displayedStart: "",
      displayedEnd: "",
      studentString: "",
      tutorString: "",
      emailStatus: "",
      canEditLocation: false,
      canEditTopic: false,
      canEditFirstTime: false,
      canEditSecondTime: false,
      canEditPreSession: false,
      canSplitTime: false,
      showDeleteConfirmation: false,
      enableBookButton: false,
      hasFoundEmail: false,
      isAdminAddStudent: false,
      isDatePast: false,
      isMemberOfAppointment: false,
      needStudentInfo: false,
      saveChanges: false,
      showBookButton: false,
      showSaveButton: false,
      showEnableCancelButton: false,
      showEnableConfirmRejectButtons: false,
      showEnableSignUpButton: false,
    };
  },
  watch: {
    async sentAppointment(newAppointment) {
      this.appointment = newAppointment;
      console.log("appointment", this.appointment);
      await this.resetEverything();
    },
  },
  async created() {
    console.log(this.appointment);
    await this.resetEverything();
  },
  methods: {
    async resetEverything() {
      this.tutorString = "";
      this.studentString = "";
      this.isAdminAddStudent = false;
      this.user = Utils.getStore("user");
      this.checkPersonInAppointment(this.user.userID);
      this.setupPersonStrings();
      this.setIsDatePast();
      this.setCanSplitTime();
      this.setCanEditLocation();
      this.setCanEditTopic();
      this.setCanEditFirstTime();
      this.setCanEditPreSession();
      this.setShowBookButton();
      this.setEnableBookButton();
      this.setShowEnableConfirmRejectButtons();
      this.setShowEnableSignUpButton();
      this.setShowSaveButton();
      this.setShowEnableCancelButton();
      await this.getLocationsForGroup();
      await this.getTopicsForTutor();
    },
    setupPersonStrings() {
      if (this.appointment.tutors > 1) {
        this.appointment.tutors.forEach((tutor) => {
          this.tutorString += `${tutor.person.fName} ${tutor.person.lName}, `;
        });
      } else if (this.appointment.tutors.length === 1) {
        this.tutorString += `${this.appointment.tutors[0].person.fName} ${this.appointment.tutors[0].person.lName}`;
      }

      if (this.appointment.students > 1) {
        this.appointment.students.forEach((student) => {
          this.studentString += `${student.person.fName} ${student.person.lName}, `;
        });
      } else if (this.appointment.students.length === 1) {
        this.studentString += `${this.appointment.students[0].person.fName} ${this.appointment.students[0].person.lName}`;
      } else {
        this.studentString = "None";
      }
    },
    setCanEditLocation() {
      // 1. tutor - owned private booked, group
      // 2. student - owned private pending, private available
      // 3. privilege tutor - private not booked
      // 4. admin
      // 5. not cancelled or past (applies to all cases)
      this.canEditLocation =
        ((this.hasRole("Tutor") &&
          this.isMemberOfAppointment &&
          ((this.checkAppointmentType("Private") &&
            this.checkAppointmentStatus("booked")) ||
            this.checkAppointmentType("Group"))) ||
          (this.hasRole("Student") &&
            this.checkAppointmentType("Private") &&
            (this.checkAppointmentStatus("available") ||
              (this.isMemberOfAppointment &&
                this.checkAppointmentStatus("pending")))) ||
          (this.hasPrivilege("Sign up students for appointments") &&
            this.checkAppointmentType("Private") &&
            !this.checkAppointmentStatus("booked")) ||
          this.hasRole("Admin")) &&
        !this.checkAppointmentStatus("Cancel") &&
        !this.isDatePast;
    },
    setCanEditTopic() {
      // 1. tutor - owned group with no students
      // 2. student - owned private pending, private available
      // 3. admin - group with no students, private not booked
      // 4. privilege tutor - private not booked
      // 5. not cancelled or past (applies to all cases)
      this.canEditTopic =
        ((this.hasRole("Tutor") &&
          this.isMemberOfAppointment &&
          this.checkAppointmentType("Group") &&
          this.appointment.students.length === 0) ||
          (this.hasRole("Student") &&
            this.checkAppointmentType("Private") &&
            (this.checkAppointmentStatus("available") ||
              (this.isMemberOfAppointment &&
                this.checkAppointmentStatus("pending")))) ||
          (this.hasRole("Admin") &&
            this.checkAppointmentType("Group") &&
            this.appointment.students.length === 0) ||
          ((this.hasRole("Admin") ||
            this.hasPrivilege("Sign up students for appointments")) &&
            this.checkAppointmentType("Private") &&
            !this.checkAppointmentStatus("booked"))) &&
        !this.checkAppointmentStatus("Cancel") &&
        !this.isDatePast;
    },
    setCanEditFirstTime() {
      // 1. student - available private
      // 2. privilege tutor - available private
      // 3. admin - available private
      // 4. group allows splitting (applies to all cases)
      // 5. start and end time of appointment is >= minimum appointment time (applies to all cases)
      // 6. not past (applies to all cases)
      this.canEditFirstTime =
        (this.hasRole("Student") ||
          this.hasRole("Admin") ||
          this.hasPrivilege("Sign up students for appointments")) &&
        this.checkAppointmentType("Private") &&
        this.checkAppointmentStatus("available") &&
        this.appointment.group.allowSplittingAppointments &&
        this.canSplitTime &&
        !this.isDatePast;
    },
    setCanEditPreSession() {
      // 1. tutor - owned group
      // 2. student - owned private pending, private available
      // 3. privilege tutor - private not booked
      // 4. admin
      // 5. not cancelled or past (applies to all cases)
      this.canEditPreSession =
        ((this.hasRole("Tutor") &&
          this.isMemberOfAppointment &&
          this.checkAppointmentType("Group")) ||
          (this.hasRole("Student") &&
            this.checkAppointmentType("Private") &&
            (this.checkAppointmentStatus("available") ||
              (this.isMemberOfAppointment &&
                this.checkAppointmentStatus("pending")))) ||
          (this.hasPrivilege("Sign up students for appointments") &&
            this.checkAppointmentType("Private") &&
            !this.checkAppointmentStatus("booked")) ||
          this.hasRole("Admin")) &&
        !this.checkAppointmentStatus("Cancel") &&
        !this.isDatePast;
    },
    setShowBookButton() {
      // 1. student - available but not already in group appointment
      // 2, privilege tutor - available
      // 3. admin - available
      // 4. tutor - group available but not already in group appointment
      // 4. not past (applies to all cases)
      this.showBookButton =
        (this.hasRole("Student") ||
          this.hasRole("Admin") ||
          this.hasPrivilege("Sign up students for appointments")) &&
        this.checkAppointmentStatus("available") &&
        (this.checkAppointmentStatus("Private") ||
          !this.isMemberOfAppointment) &&
        !this.isDatePast;
    },
    setEnableBookButton() {
      // 1. student - group available, private available with topic, location, start, and end time filled out
      // 2. privilege tutor - group available and student signed up, private available with student signed up and topic, location, start, and end time filled out
      // 3. admin - group available and student signed up, private available with student signed up and topic, location, start, and end time filled out
      // 4. tutor - group available
      // 4. not past (applies to all cases)
      this.enableBookButton =
        (this.hasRole("Student") ||
          (this.hasRole("Tutor") && this.checkAppointmentType("Group")) ||
          ((this.hasRole("Admin") ||
            this.hasPrivilege("Sign up students for appointments")) &&
            this.isAdminAddStudent &&
            this.addedStudent.fName !== "" &&
            this.addedStudent.lName !== "" &&
            this.hasFoundEmail)) &&
        this.checkAppointmentStatus("available") &&
        (this.checkAppointmentType("Group") ||
          (this.checkAppointmentType("Private") &&
            this.appointment.topicId !== null &&
            this.appointment.locationId !== null &&
            this.displayedStart !== "" &&
            this.displayedEnd !== "")) &&
        !this.isDatePast;
    },
    setShowEnableConfirmRejectButtons() {
      // 1. tutor and pending private
      // 2. not past (applies to all cases)
      this.showEnableConfirmRejectButtons =
        this.hasRole("Tutor") &&
        this.checkAppointmentStatus("pending") &&
        this.checkAppointmentStatus("Private") &&
        !this.isDatePast;
    },
    setShowSaveButton() {
      // 1. if user can edit anything
      this.showSaveButton =
        !this.checkAppointmentStatus("available") &&
        (this.canEditLocation || this.canEditTopic || this.canEditPreSession);
    },
    setShowEnableSignUpButton() {
      // 1. privilege tutor or admin and available appointment
      // 2. not past (applies to all cases)
      this.showEnableSignUpButton =
        (this.hasRole("Admin") ||
          this.hasPrivilege("Sign up students for appointments")) &&
        this.checkAppointmentStatus("available") &&
        !this.isDatePast;
    },
    setShowEnableCancelButton() {
      // 1. student - owned pending, booked, and group
      // 2. tutor - owned available, booked, and group appointments
      // 3. admin?
      // 4. privilege tutor?
      // 5. not past (applies to all cases)
      this.showEnableCancelButton =
        this.isMemberOfAppointment &&
        ((this.hasRole("Student") &&
          !this.checkAppointmentStatus("available")) ||
          (this.hasRole("Tutor") && !this.checkAppointmentStatus("pending"))) &&
        !this.isDatePast;
    },
    hasRole(type) {
      return (
        this.user.selectedRole.type !== null &&
        this.user.selectedRole.type === type
      );
    },
    hasPrivilege(privilege) {
      return this.appointment.personRolePrivileges.find((priv) => {
        return priv.privilege === privilege;
      });
    },
    checkAppointmentStatus(status) {
      return (
        this.appointment !== null && this.appointment.status.includes(status)
      );
    },
    checkAppointmentType(type) {
      return this.appointment !== null && this.appointment.type === type;
    },
    checkPersonInAppointment(personId) {
      this.isMemberOfAppointment = this.appointment.personappointment.find(
        (person) => {
          return person.personId === personId;
        }
      );
    },
    setCanSplitTime() {
      this.canSplitTime =
        this.subtractTimes(
          this.appointment.startTime,
          this.appointment.endTime
        ) >= this.appointment.group.minApptTime;
    },
    setIsDatePast() {
      let checkDate = new Date();
      checkDate.setHours(
        checkDate.getHours() - checkDate.getTimezoneOffset() / 60
      );
      checkDate.setHours(0, 0, 0, 0);
      let checkTime = new Date();
      let tempHours = checkTime.getHours();
      // check minutes for group's booking buffer
      let tempMins = checkTime.getMinutes();
      if (this.appointment.group.bookPastMinutes > 0) {
        tempMins -= this.appointment.group.bookPastMinutes;
        while (tempMins < 0) {
          tempMins += 60;
          tempHours--;
        }
      } else if (this.appointment.group.bookPastMinutes < 0) {
        tempMins -= this.appointment.group.bookPastMinutes;
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
      if (this.appointment.date < checkDate.toISOString()) {
        this.isDatePast = true;
      } else if (checkDate.toISOString() === this.appointment.date) {
        if (checkTime > this.appointment.startTime) {
          this.isDatePast = true;
        } else this.isDatePast = false;
      } else {
        this.isDatePast = false;
      }
    },
    updateTimes() {
      this.startTimes = this.generateTimeslots(
        this.appointment.startTime,
        this.newEnd,
        this.appointment.group.timeInterval
      );
      // adding this to make sure that you can't start an appointment at the end time
      // need to make sure that we handle the time interval vs the minimum appointment time correctly
      for (
        let i = 0;
        i <
        this.appointment.group.minApptTime /
          this.appointment.group.timeInterval;
        i++
      ) {
        this.startTimes.pop();
      }
      this.endTimes = this.generateTimeslots(
        this.newStart,
        this.appointment.endTime,
        this.appointment.group.minApptTime
      );
      // adding this to make sure you can't end an appointment at the start time
      this.endTimes.shift();
    },
    async findEmail() {
      await PersonServices.getStudentForPersonForGroup(
        this.addedStudent.email,
        this.appointment.groupId
      ).then((response) => {
        this.addedStudent = {
          id: response.data.id,
          fName: response.data.fName,
          lName: response.data.lName,
          email: response.data.email,
          personRoleId: response.data.personrole
            ? response.data.personrole[0].id
            : null,
        };
      });
      if (this.user.userID === this.addedStudent.id) {
        this.emailStatus = "You cannot sign yourself up for an appointment.";
        this.hasFoundEmail = true;
        return;
      } else if (
        this.appointment.tutors.find((tutor) => {
          return tutor.personId === this.addedStudent.id;
        })
      ) {
        this.emailStatus =
          "You cannot sign up a tutor for their own appointment.";
        this.hasFoundEmail = true;
        return;
      } else if (this.checkPersonInAppointment(this.addedStudent.id)) {
        this.emailStatus =
          "This student is already signed up for this appointment.";
        this.hasFoundEmail = true;
        return;
      } else if (!this.addedStudent.email.includes("not found")) {
        this.needStudentInfo = false;
        if (this.addedStudent.personRoleId === null) {
          // make a new person role for this group
          // find the student role for this group
          let personRole = {
            status: "applied",
            // roleId: roles[i].id,
            personId: this.addedStudent.id,
            dateSigned: Date(),
            agree: false,
          };
          await PersonRoleServices.addPersonRole(personRole);
          this.emailStatus =
            this.addedStudent.fName +
            " " +
            this.addedStudent.lName +
            " has been added as a student!";
          this.emailFound = true;
          return;
        } else {
          this.emailStatus =
            "Student " +
            this.addedStudent.fName +
            " " +
            this.addedStudent.lName +
            " found!";
          this.walkInStudent = this.addedStudent;
          this.emailFound = true;
          return;
        }
      } else {
        this.needStudentInfo = true;
        this.emailStatus = "No Student Found";
        this.hasFoundEmail = false;
      }
    },
    validateEmail() {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let email = pattern.test(this.addedStudent.email);
      return email
        ? this.addedStudent.email.includes("oc.edu") ||
            this.addedStudent.email.includes("eagles.oc.edu")
        : false;
    },
    async getLocationsForGroup() {
      await LocationServices.getActiveForGroup(this.appointment.groupId)
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
      await TopicServices.getTopicByGroupForPerson(
        this.appointment.groupId,
        this.appointment.tutors[0].personId
      )
        .then((response) => {
          this.currentTopics = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
  },
};
</script>
