import TwilioServices from "@/services/twilioServices";
import { TimeFunctionsMixin } from "./TimeFunctionsMixin";

export const SendTextsMixin = {
  mixins: [TimeFunctionsMixin],
  data() {
    return {
      appointment: {},
    };
  },
  methods: {
    async sendEditedMessage(fromUser, appointId) {
      await this.getAppointmentInfo(appointId);
      let text = {
        phoneNum: "",
        message:
          "Your " +
          this.appointment.type +
          " appointment for " +
          this.appointment.topic.name +
          " on " +
          this.formatDate(this.appointment.date) +
          " at " +
          this.calcTime(this.appointment.startTime) +
          " has been edited by " +
          fromUser.fName +
          " " +
          fromUser.lName +
          ".\nPlease review the changes: " +
          process.env.VUE_APP_CLIENT_URL,
      };

      // notify all tutors involved besides themselves
      for (let i = 0; i < this.appointment.tutors.length; i++) {
        if (this.appointment.tutors[i].personId !== fromUser.userID) {
          text.phoneNum = this.appointment.tutors[i].person.phoneNum;
          text.message +=
            "/tutorHome/" +
            this.appointment.tutors[0].person.personrole[0].id +
            "?appointmentId=" +
            this.appointment.id;
          if (text.phoneNum !== "") {
            await TwilioServices.sendMessage(text);
          }
        }
      }

      // notify all students involved besides themselves
      for (let i = 0; i < this.appointment.students.length; i++) {
        if (this.appointment.students[i].personId !== fromUser.userID) {
          text.phoneNum = this.appointment.students[i].person.phoneNum;
          text.message +=
            "/studentHome/" +
            this.appointment.students[0].person.personrole[0].id +
            "?appointmentId=" +
            this.appointment.id;
          if (text.phoneNum !== "") {
            await TwilioServices.sendMessage(text);
          }
        }
      }
    },
    async sendCanceledMessage(fromUser, appointId) {
      await this.getAppointmentInfo(appointId);
      let text = {
        phoneNum: "",
        message: "",
      };
      let ending = "";
      if (fromUser.selectedRole.type === "Student") {
        if (this.appointment.type === "Private") {
          ending = "\nThis appointment is now open again for booking.";
        }
      } else if (fromUser.selectedRole.type === "Tutor") {
        ending = "\nWe apologize for the inconvenience.";
      }

      if (
        this.appointment.type === "Private" ||
        (this.appointment.type === "Group" &&
          fromUser.selectedRole.type === "Tutor")
      ) {
        text.message =
          "Your " +
          this.appointment.type +
          " appointment for " +
          this.appointment.topic.name +
          " on " +
          this.formatDate(this.appointment.date) +
          " at " +
          this.calcTime(this.appointment.startTime) +
          " has been canceled by " +
          fromUser.fName +
          " " +
          fromUser.lName +
          "." +
          ending;
      } else if (
        this.appointment.type === "Group" &&
        fromUser.selectedRole.type === "Student"
      ) {
        text.message =
          "A student has left your group appointment." +
          "\n    Date: " +
          this.formatDate(this.appointment.date) +
          "\n    Time: " +
          this.calcTime(this.appointment.startTime) +
          "\n    Location: " +
          this.appointment.location.name +
          "\n    Topic: " +
          this.appointment.topic.name +
          "\n    Student: " +
          fromUser.fName +
          " " +
          fromUser.lName +
          ending;
      }

      // notify all tutors involved besides themselves
      for (let i = 0; i < this.appointment.tutors.length; i++) {
        if (this.appointment.tutors[i].personId !== fromUser.userID) {
          text.phoneNum = this.appointment.tutors[i].person.phoneNum;
          if (text.phoneNum !== "") {
            await TwilioServices.sendMessage(text).catch((error) => {
              this.message = error.response.data.message;
              console.log("There was an error:", error.response);
            });
          }
        }
      }

      // only notify all students involved besides themselves if tutor canceled
      if (fromUser.selectedRole.type === "Tutor") {
        for (let i = 0; i < this.appointment.students.length; i++) {
          if (this.appointment.students[i].personId !== fromUser.userID) {
            text.phoneNum = this.appointment.students[i].person.phoneNum;
            if (text.phoneNum !== "") {
              await TwilioServices.sendMessage(text).catch((error) => {
                this.message = error.response.data.message;
                console.log("There was an error:", error.response);
              });
            }
          }
        }
      }
    },
  },
};
