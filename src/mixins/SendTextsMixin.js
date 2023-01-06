import AppointmentServices from "@/services/appointmentServices";
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
    async getAppointmentInfo(appointId) {
      await AppointmentServices.getInfoForText(appointId)
        .then(async (response) => {
          this.appointment = response.data[0];
          if (
            this.appointment.personappointment !== null &&
            this.appointment.personappointment !== undefined
          ) {
            this.appointment.students =
              this.appointment.personappointment.filter(
                (pa) => pa.isTutor === false
              );
            this.appointment.tutors = this.appointment.personappointment.filter(
              (pa) => pa.isTutor === true
            );
          }
        })
        .catch((error) => {
          this.message = error;
          console.log("There was an error:", error);
        });
    },
    async sendApplicationMessage(fromUser, admin, groupName) {
      let text = {
        phoneNum: admin.person.phoneNum,
        message:
          "You have a new tutor application from " +
          fromUser.fName +
          " " +
          fromUser.lName +
          " for " +
          groupName +
          ".\nPlease view this application: " +
          process.env.VUE_APP_CLIENT_URL,
      };
      await TwilioServices.sendMessage(text);
    },
    async sendRequestMessage(fromUser, admin) {
      let text = {
        phoneNum: admin.person.phoneNum,
        message:
          "You have a new request from " +
          fromUser.fName +
          " " +
          fromUser.lName +
          " for " +
          fromUser.selectedGroup +
          ".\nPlease view this request: " +
          process.env.VUE_APP_CLIENT_URL,
      };
      console.log(text);
      await TwilioServices.sendMessage(text);
    },
    async sendPendingMessage(appointId) {
      await this.getAppointmentInfo(appointId);
      let text = {
        phoneNum: this.appointment.tutors[0].person.phoneNum,
        message:
          "You have a new pending private appointment." +
          "\n    Date: " +
          this.formatDate(this.appointment.date) +
          "\n    Time: " +
          this.calcTime(this.appointment.startTime) +
          "\n    Location: " +
          this.appointment.location.name +
          "\n    Topic: " +
          this.appointment.topic.name +
          "\n    Student: " +
          this.appointment.students[0].person.fName +
          " " +
          this.appointment.students[0].person.lName +
          "\nPlease view this pending appointment: " +
          process.env.VUE_APP_CLIENT_URL,
      };
      await TwilioServices.sendMessage(text);
    },
    async sendConfirmedMessage(appointId) {
      await this.getAppointmentInfo(appointId);
      let text = {
        phoneNum: this.appointment.students[0].person.phoneNum,
        message:
          "The " +
          this.appointment.type.toLowerCase() +
          " appointment you booked for " +
          this.appointment.topic.name +
          " on " +
          this.formatDate(this.appointment.date) +
          " at " +
          this.calcTime(this.appointment.startTime) +
          " has been confirmed by " +
          this.appointment.tutors[0].person.fName +
          " " +
          this.appointment.tutors[0].person.lName +
          ". \nPlease review this appointment: " +
          process.env.VUE_APP_CLIENT_URL,
      };
      await TwilioServices.sendMessage(text);
    },
    async sendMessageFromAdmin(admin, student, appointId) {
      await this.getAppointmentInfo(appointId);
      let text = {
        phoneNum: this.appointment.tutors[0].person.phoneNum,
        message: "",
      };
      if (this.appointment.type === "Private") {
        text.message =
          "You have a new booked private appointment." +
          "\n    Date: " +
          this.formatDate(this.appointment.date) +
          "\n    Time: " +
          this.calcTime(this.appointment.startTime) +
          "\n    Location: " +
          this.appointment.location.name +
          "\n    Topic: " +
          this.appointment.topic.name +
          "\n    Student: " +
          student.fName +
          " " +
          student.lName +
          "\n    Booked by: " +
          admin.fName +
          " " +
          admin.lName +
          "\nPlease view this booked appointment: " +
          process.env.VUE_APP_CLIENT_URL;
      } else if (this.appointment.type === "Group") {
        text.message =
          "A student has joined your group appointment." +
          "\n    Date: " +
          this.formatDate(this.appointment.date) +
          "\n    Time: " +
          this.calcTime(this.appointment.startTime) +
          "\n    Location: " +
          this.appointment.location.name +
          "\n    Topic: " +
          this.appointment.topic.name +
          "\n    Student: " +
          student.fName +
          " " +
          student.lName +
          "\n    Booked by: " +
          admin.fName +
          " " +
          admin.lName +
          "\nPlease view this group appointment: " +
          process.env.VUE_APP_CLIENT_URL;
      }
      if (text.message !== "") {
        await TwilioServices.sendMessage(text);
      }
    },
    // always text the first tutor of a group appointment if someone joins
    async sendGroupMessage(fromUser, appointId) {
      await this.getAppointmentInfo(appointId);
      let text = {
        phoneNum: this.appointment.tutors[0].person.phoneNum,
        message:
          "A " +
          fromUser.selectedRole.type.toLowerCase() +
          " has joined your group appointment." +
          "\n    Date: " +
          this.formatDate(this.appointment.date) +
          "\n    Time: " +
          this.calcTime(this.appointment.startTime) +
          "\n    Location: " +
          this.appointment.location.name +
          "\n    Topic: " +
          this.appointment.topic.name +
          "\n    " +
          fromUser.selectedRole.type +
          ": " +
          fromUser.fName +
          " " +
          fromUser.lName +
          "\nPlease review the changes: " +
          process.env.VUE_APP_CLIENT_URL,
      };
      await TwilioServices.sendMessage(text);
    },
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
          if (text.phoneNum !== "") {
            await TwilioServices.sendMessage(text);
          }
        }
      }

      // notify all students involved besides themselves
      for (let i = 0; i < this.appointment.students.length; i++) {
        if (this.appointment.students[i].personId !== fromUser.userID) {
          text.phoneNum = this.appointment.students[i].person.phoneNum;
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
