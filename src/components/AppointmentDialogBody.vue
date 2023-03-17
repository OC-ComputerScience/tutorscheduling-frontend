<template>
  <v-card min-width="350px">
    <v-card-title :class="event.color + ' white--text mb-6'">{{
      event.name
    }}</v-card-title>
    <v-card-text>
      <b>Time slot:</b>
      {{ calcTime(appointment.startTime) }}-{{ calcTime(appointment.endTime) }}
      <br />
      <b>Tutors: </b>
      {{ tutorString }}
      <br />
      <b>Students: </b>
      {{ studentString }}

      <v-select
        v-model="appointment.locationId"
        :items="locations"
        item-text="name"
        item-value="id"
        label="Location"
        required
        :readonly="!canEditLocation"
        @change="saveChanges = true"
      >
      </v-select>

      <v-select
        v-model="appointment.topicId"
        :items="currentTopics"
        item-text="name"
        item-value="id"
        label="Topic"
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
        label="Pre-Appointment Info"
        hint="What do you need help with?"
        persistent-hint
        required
        auto-grow
        rows="2"
        :readonly="!canEditPreSession"
        @change="saveChanges = true"
      ></v-textarea>

      <span v-if="adminAddStudent">
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
            v-if="emailStatus != ''"
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
      <!-- close button can be seen ALWAYS -->

      <!-- save changes button can be seen AND pressed if: -->
      <!-- 1. save changes boolean is set
2. not cancelled (applies to all cases)
3. not past (applies to all cases) -->

      <!-- cancel appointment button can be seen AND pressed if: -->
      <!-- 1. student and pending (or as privilege tutor or admin) 
2. student and booked (or as privilege tutor or admin)
3. tutor and booked
4. tutor and available
5. not past (applies to all cases) -->

      <v-spacer></v-spacer>
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
        v-if="showEnableConfirmRejectButtons"
        color="error"
        @click="
          showDeleteConfirmation = true;
          secondTime = true;
        "
      >
        Reject
      </v-btn>
      <v-btn color="grey white--text" @click="$emit('closeTopicDialog')">
        {{ saveChanges ? "Discard Changes" : "Close" }}
      </v-btn>
      <v-btn
        v-if="showEnableSignUpButton"
        color="green"
        :disabled="adminAddStudent"
        @click="adminAddStudent = true"
      >
        Sign Up Student
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="disableConfirmDialog" persistent max-width="750px">
      <DeleteConfirmationComponent
        type="appointment"
        :item="appointment"
        @handleReturningCancel="disableConfirmDialog = false"
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
import DeleteConfirmationComponent from "../DeleteConfirmationComponent.vue";
import { TimeFunctionsMixin } from "../../mixins/TimeFunctionsMixin";

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
      locations: [],
      currentTopics: [],
      appointment: this.sentAppointment,
      event: this.sentEvent,
      startTimes: [],
      endTimes: [],
      newStart: null,
      newEnd: null,
      displayedStart: "",
      displayedEnd: "",
      canEditLocation: false,
      canEditTopic: false,
      canEditFirstTime: false,
      canEditSecondTime: false,
      canEditPreSession: false,
      canSplitTime: false,
      disableConfirmDialog: false,
      enableBookButton: false,
      hasFoundEmail: false,
      isDatePast: false,
      needStudentInfo: false,
      saveChanges: false,
      showBookButton: false,
      showEnableConfirmRejectButtons: false,
      showEnableSignUpButton: false,
      tutorString: "",
      studentString: "",
    };
  },
  watch: {
    async sentAppointment(newAppointment) {
      this.appointment = newAppointment;
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
      if (this.canEditLocation) {
        await this.getLocationsForGroup();
      }
      if (this.canEditTopic) {
        await this.getTopicsForTutor();
      }
    },
  },
  async created() {
    this.user = Utils.getStore("user");
  },
  methods: {
    setupPersonStrings() {
      if (this.event.tutors > 1) {
        this.event.tutors.forEach((tutor) => {
          this.tutorString += `${tutor.person.fName} ${tutor.person.lName}, `;
        });
      } else if (this.event.tutors.length === 1) {
        this.tutorString += `${this.event.tutors[0].person.fName} ${this.event.tutors[0].person.lName}`;
      }

      if (this.event.students > 1) {
        this.event.students.forEach((student) => {
          this.studentString += `${student.person.fName} ${student.person.lName}, `;
        });
      } else if (this.event.students.length === 1) {
        this.studentString += `${this.event.students[0].person.fName} ${this.event.students[0].person.lName}`;
      } else {
        this.studentString = "None";
      }
    },
    setCanEditLocation() {
      // 1. tutor - private booked, group
      // 2. student - private not booked
      // 3. privilege tutor - private not booked
      // 4. admin
      // 5. not cancelled or past (applies to all cases)
      this.canEditLocation =
        ((this.hasRole("Tutor") &&
          ((this.checkAppointmentType("Private") &&
            this.checkAppointmentStatus("booked")) ||
            this.checkAppointmentType("Group"))) ||
          ((this.hasRole("Student") ||
            this.hasPrivilege("Sign up students for appointments")) &&
            this.checkAppointmentType("Private") &&
            !this.checkAppointmentStatus("booked")) ||
          this.hasRole("Admin")) &&
        !this.checkAppointmentStatus("Cancel") &&
        !this.isDatePast;
    },
    setCanEditTopic() {
      // 1. tutor - group with no students
      // 2. student - private not booked
      // 3. privilege tutor - private not booked
      // 4. admin - private not booked, group with no students
      // 5. not cancelled or past (applies to all cases)
      this.canEditTopic =
        (((this.hasRole("Tutor") || this.hasRole("Admin")) &&
          this.checkAppointmentType("Group") &&
          this.event.students.length === 0) ||
          ((this.hasRole("Student") ||
            this.hasRole("Admin") ||
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
      // 1. tutor and group
      // 2. student - private not booked
      // 3. privilege tutor - private not booked
      // 4. admin
      // 5. not cancelled or past (applies to all cases)
      this.canEditPreSession =
        ((this.hasRole("Tutor") && this.checkAppointmentType("Group")) ||
          ((this.hasRole("Student") ||
            this.hasPrivilege("Sign up students for appointments")) &&
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
      // 4. not past (applies to all cases)
      this.showBookButton =
        (this.hasRole("Student") ||
          this.hasRole("Admin") ||
          this.hasPrivilege("Sign up students for appointments")) &&
        this.checkAppointmentStatus("available") &&
        (this.checkAppointmentStatus("Private") ||
          !this.checkStudentInGroupAppointment()) &&
        !this.isDatePast;
    },
    setEnableBookButton() {
      // 1. student - group available, private available with topic, location, start, and end time filled out
      // 2. privilege tutor - group available and student signed up, private available with student signed up and topic, location, start, and end time filled out
      // 3. admin - group available and student signed up, private available with student signed up and topic, location, start, and end time filled out
      this.enableBookButton =
        (this.hasRole("Student") ||
          ((this.hasRole("Admin") ||
            this.hasPrivilege("Sign up students for appointments")) &&
            this.adminAddStudent &&
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
    setShowEnableSignUpButton() {
      // 1. privilege tutor or admin and available appointment
      // 2. not past (applies to all cases)
      this.showSignUpButton =
        (this.hasRole("Admin") ||
          this.hasPrivilege("Sign up students for appointments")) &&
        this.checkAppointmentStatus("available") &&
        !this.isDatePast;
    },
    hasRole(type) {
      return (
        this.user.selectedRole.type !== null &&
        this.user.selectedRole.type === type
      );
    },
    hasPrivilege(privilege) {
      // TODO
      return this.personroleprivileges.find((priv) => {
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
    checkStudentInGroupAppointment() {
      return (
        this.checkAppointmentType("Group") &&
        this.appointment.students.find((student) => {
          return student.personId === this.user.userID;
        })
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
      // TODO double check that student isn't already in group appt.
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
        this.emailStatus = "No Student Found"; // get rid of popup and add to the open selecte event, then if email not found, add more blanks for student name
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
      await TopicServices.getTopicByGroupForPerson(
        this.appointment.group.id,
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
