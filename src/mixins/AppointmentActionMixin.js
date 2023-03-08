import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import TwilioServices from "@/services/twilioServices.js";
import { TimeFunctionsMixin } from "./TimeFunctionsMixin";

export const AppointmentActionMixin = {
  mixins: [TimeFunctionsMixin],
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
    async getAppointmentsForGroup(groupId) {
      let appointments = [];

      await AppointmentServices.findAppointmentsForGroup(groupId)
        .then(async (response) => {
          appointments = response.data;
          for (let i = 0; i < appointments.length; i++) {
            let appoint = appointments[i];
            if (
              appoint.personappointment !== null &&
              appoint.personappointment !== undefined
            ) {
              appoint.students = appoint.personappointment.filter(
                (pa) => pa.isTutor === false
              );
              appoint.tutors = appoint.personappointment.filter(
                (pa) => pa.isTutor === true
              );
            }
          }
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });

      return appointments;
    },
    async getAllPersonAppointments() {
      let personAppointments = [];
      await PersonAppointmentServices.getAllPersonAppointments()
        .then(async (response) => {
          personAppointments = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
      return personAppointments;
    },
    async bookAppointment(isAdminAdd, appointment, fromUser, student) {
      await this.getAppointmentInfo(appointment.id);
      if (this.appointment.type === "Private") {
        await this.splitAppointment(isAdminAdd, appointment, fromUser, student);
      } else if (this.appointment.type === "Group") {
        await this.bookGroupSession(isAdminAdd, appointment, fromUser, student);
      }
    },
    // Split appointments into more availability slots when part of slot is booked
    async splitAppointment(isAdminAdd, appointment, fromUser, student) {
      await this.getAppointmentInfo(appointment.id);

      if (this.appointment.status !== "available") {
        return;
      }

      //If the start of the booked slot isn't the start of the slot, generate an open slot
      if (
        this.appointment.startTime < appointment.newStart &&
        this.subtractTimes(this.appointment.startTime, appointment.newStart) >=
          appointment.minApptTime
      ) {
        let temp = {
          date: this.appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.newStart,
          type: this.appointment.type,
          status: this.appointment.status,
          preSessionInfo: "",
          groupId: this.appointment.groupId,
        };
        await AppointmentServices.addAppointment(temp).then(
          async (response) => {
            // private will only have one tutor
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: this.appointment.tutors[0].personId,
            };
            await PersonAppointmentServices.addPersonAppointment(pap);
          }
        );
      }
      //If the end of the booked slot isn't the end of the slot, generate an open slot
      if (
        this.appointment.endTime > appointment.newEnd &&
        this.subtractTimes(appointment.newEnd, this.appointment.endTime) >=
          appointment.minApptTime
      ) {
        let temp = {
          date: this.appointment.date,
          startTime: appointment.newEnd,
          endTime: appointment.endTime,
          type: this.appointment.type,
          status: this.appointment.status,
          preSessionInfo: "",
          groupId: this.appointment.groupId,
          //locationId: this.appointment.locationId,
          //topicId: this.appointment.topicId,
        };
        await AppointmentServices.addAppointment(temp).then(
          async (response) => {
            // private will only have one tutor
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: this.appointment.tutors[0].personId,
            };
            await PersonAppointmentServices.addPersonAppointment(pap);
          }
        );
      }

      // add person appointment
      let pap = {
        isTutor: false,
        appointmentId: this.appointment.id,
      };

      // make temp appointment
      let temp = {
        id: this.appointment.id,
        date: this.appointment.date,
        startTime: appointment.newStart,
        endTime: appointment.newEnd,
        type: this.appointment.type,
        preSessionInfo: appointment.preSessionInfo,
        groupId: this.appointment.groupId,
        locationId: appointment.locationId,
        topicId: appointment.topicId,
        googleEventId: appointment.googleEventId,
      };

      // handle if admin/tutor with privilege added appointment
      if (isAdminAdd) {
        pap.personId = student.id;
        await PersonAppointmentServices.addPersonAppointment(pap);
        temp.status = "booked";
        await AppointmentServices.updateForGoogle(this.appointment.id, temp);
        // get information for texting
        await this.getAppointmentInfo(appointment.id);
        let textInfo = {
          appointmentId: this.appointment.id,
          appointmentType: this.appointment.type,
          tutorPhoneNum: this.appointment.tutors[0].person.phoneNum,
          tutorPersonRoleId: this.appointment.tutors[0].person.personrole[0].id,
          date: this.formatDate(this.appointment.date),
          startTime: this.calcTime(this.appointment.startTime),
          locationName: this.appointment.location.name,
          topicName: this.appointment.topic.name,
          adminFirstName: fromUser.fName,
          adminLastName: fromUser.lName,
          studentFirstName: student.fName,
          studentLastName: student.lName,
        };
        await TwilioServices.sendMessageFromAdmin(textInfo);
      } // handle if student added appointment
      else {
        pap.personId = fromUser.userID ? fromUser.userID : fromUser.id;
        await PersonAppointmentServices.addPersonAppointment(pap);
        temp.status = "pending";
        await AppointmentServices.updateAppointment(this.appointment.id, temp);
        // get information for texting
        await this.getAppointmentInfo(appointment.id);
        let textInfo = {
          appointmentId: this.appointment.id,
          tutorPhoneNum: this.appointment.tutors[0].person.phoneNum,
          tutorPersonRoleId: this.appointment.tutors[0].person.personrole[0].id,
          date: this.formatDate(this.appointment.date),
          startTime: this.calcTime(this.appointment.startTime),
          locationName: this.appointment.location.name,
          topicName: this.appointment.topic.name,
          studentFirstName: fromUser.fName,
          studentLastName: fromUser.lName,
        };
        await TwilioServices.sendPendingMessage(textInfo);
      }
    },
    async bookGroupSession(isAdminAdd, appointment, fromUser, student) {
      let pap = {
        isTutor: false,
        appointmentId: appointment.id,
      };
      if (isAdminAdd) {
        // add person appointment
        pap.personId = student.id;
        await PersonAppointmentServices.addPersonAppointment(pap);
        // get information for texting
        await this.getAppointmentInfo(appointment.id);
        let textInfo = {
          appointmentId: this.appointment.id,
          appointmentType: this.appointment.type,
          tutorPhoneNum: "",
          tutorPersonRoleId: "",
          date: this.formatDate(this.appointment.date),
          startTime: this.calcTime(this.appointment.startTime),
          locationName: this.appointment.location.name,
          topicName: this.appointment.topic.name,
          adminFirstName: fromUser.fName,
          adminLastName: fromUser.lName,
          studentFirstName: student.fName,
          studentLastName: student.lName,
        };
        // send message to all tutors of group appointment
        for (let i = 0; i < this.appointment.tutors.length; i++) {
          textInfo.tutorPhoneNum = this.appointment.tutors[i].person.phoneNum;
          textInfo.tutorPersonRoleId =
            this.appointment.tutors[i].person.personrole[0].id;
          await TwilioServices.sendMessageFromAdmin(textInfo);
        }
      } else {
        if (fromUser.selectedRole.type === "Tutor") {
          pap.isTutor = true;
        }
        pap.personId = fromUser.userID;
        //Update stored data
        await PersonAppointmentServices.addPersonAppointment(pap);
        let textInfo = {
          appointmentId: this.appointment.id,
          roleType: fromUser.selectedRole.type,
          tutorPhoneNum: "",
          tutorPersonRoleId: "",
          date: this.formatDate(this.appointment.date),
          startTime: this.calcTime(this.appointment.startTime),
          locationName: this.appointment.location.name,
          topicName: this.appointment.topic.name,
          fromFirstName: fromUser.fName,
          fromLastName: fromUser.lName,
        };
        // send message to all tutors of group appointment
        for (let i = 0; i < this.appointment.tutors.length; i++) {
          textInfo.tutorPhoneNum = this.appointment.tutors[i].person.phoneNum;
          textInfo.tutorPersonRoleId =
            this.appointment.tutors[i].person.personrole[0].id;
          await TwilioServices.sendGroupMessage(textInfo);
        }
      }
      // need to update group session in google
      await AppointmentServices.updateForGoogle(appointment.id, appointment);
    },
    async editAppointment(fromUser, appointment) {
      let updateAppt = {
        id: appointment.id,
        date: appointment.originalDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        status: appointment.status,
        preSessionInfo: appointment.preSessionInfo,
        groupId: appointment.groupId,
        topicId: appointment.topicId,
        locationId: appointment.locationId,
        googleEventId: appointment.googleEventId,
      };
      await this.getAppointmentInfo(appointment.id);
      let textInfo = {
        appointmentId: this.appointment.id,
        appointmentType: this.appointment.type,
        roleType: "",
        toPhoneNum: "",
        toPersonRoleId: "",
        date: this.formatDate(this.appointment.date),
        startTime: this.calcTime(this.appointment.startTime),
        topicName: this.appointment.topic.name,
        fromFirstName: fromUser.fName,
        fromLastName: fromUser.lName,
      };
      // send message to all tutors of group appointment
      for (let i = 0; i < this.appointment.personappointment.length; i++) {
        if (
          this.appointment.personappointment[i].personId !== fromUser.userID
        ) {
          textInfo.roleType = this.appointment.personappointment[i].isTutor
            ? "Tutor"
            : "Student";
          textInfo.toPhoneNum =
            this.appointment.personappointment[i].person.phoneNum;
          textInfo.toPersonRoleId =
            this.appointment.personappointment[i].person.personrole[0].id;
          await TwilioServices.sendEditedMessage(textInfo);
        }
      }
      await AppointmentServices.updateForGoogle(updateAppt.id, updateAppt);
    },
    async confirmAppointment(confirm, fromUser, appointment) {
      let confirmAppt = {
        id: appointment.id,
        date: appointment.originalDate,
        startTime: appointment.originalStart,
        endTime: appointment.originalEnd,
        type: appointment.type,
        status: appointment.status,
        preSessionInfo: appointment.preSessionInfo,
        groupId: appointment.groupId,
        topicId: appointment.topicId,
        locationId: appointment.locationId,
        googleEventId: appointment.googleEventId,
      };
      if (confirm) {
        if (appointment.type === "Private") {
          confirmAppt.status = "booked";
          await AppointmentServices.updateForGoogle(
            confirmAppt.id,
            confirmAppt
          );
          // get information for texting
          await this.getAppointmentInfo(appointment.id);
          let textInfo = {
            appointmentId: this.appointment.id,
            appointmentType: this.appointment.type,
            studentPhoneNum: this.appointment.students[0].person.phoneNum,
            studentPersonRoleId:
              this.appointment.students[0].person.personrole[0].id,
            date: this.formatDate(this.appointment.date),
            startTime: this.calcTime(this.appointment.startTime),
            topicName: this.appointment.topic.name,
            tutorFirstName: fromUser.fName,
            tutorLastName: fromUser.lName,
          };
          await TwilioServices.sendConfirmedMessage(textInfo);
        }
      } else {
        // don't need to update google cal because it's not even on there yet
        confirmAppt.status = "tutorCancel";
        let textInfo = {
          appointmentType: this.appointment.type,
          toPhoneNum: this.appointment.students[0].person.phoneNum,
          toPersonRoleId: this.appointment.students[0].person.personrole[0].id,
          date: this.formatDate(this.appointment.date),
          startTime: this.calcTime(this.appointment.startTime),
          topicName: this.appointment.topic.name,
          fromFirstName: fromUser.fName,
          fromLastName: fromUser.lName,
          fromRoleType: "Tutor",
        };
        console.log(textInfo);
        await TwilioServices.sendCanceledMessage(textInfo);
        await AppointmentServices.updateAppointment(
          confirmAppt.id,
          confirmAppt
        );
      }
    },
    async cancelAppointment(appointment, fromUser) {
      // student
      //   private pending
      //   private booked
      //   group
      // tutor
      //   private available or group available with no students
      //   everything else
      let updateAppt = {
        id: appointment.id,
        date: appointment.originalDate,
        startTime: appointment.originalStart,
        endTime: appointment.originalEnd,
        type: appointment.type,
        status: appointment.status,
        preSessionInfo: appointment.preSessionInfo,
        groupId: appointment.groupId,
        topicId: appointment.topicId,
        locationId: appointment.locationId,
      };
      await this.getAppointmentInfo(appointment.id);
      if (fromUser.selectedRole.type === "Student") {
        if (this.appointment.type === "Private") {
          let textInfo = {
            appointmentType: this.appointment.type,
            toPhoneNum: this.appointment.tutors[0].person.phoneNum,
            toPersonRoleId: this.appointment.tutors[0].person.personrole[0].id,
            date: this.formatDate(this.appointment.date),
            startTime: this.calcTime(this.appointment.startTime),
            topicName: this.appointment.topic.name,
            fromFirstName: fromUser.fName,
            fromLastName: fromUser.lName,
            fromRoleType: "Student",
          };
          console.log(textInfo);
          await TwilioServices.sendCanceledMessage(textInfo);
          if (this.appointment.status === "pending") {
            updateAppt.status = "available";
            updateAppt.locationId = null;
            updateAppt.topicId = null;
            updateAppt.preSessionInfo = "";
            // don't need to update google event because it doesn't exist
            await AppointmentServices.updateAppointment(
              updateAppt.id,
              updateAppt
            );
            // only need to delete the student's personappointment
            await PersonAppointmentServices.deletePersonAppointment(
              this.appointment.students[0].id
            );
          } else if (this.appointment.status === "booked") {
            await this.cancelFeedbackMessage(
              this.appointment.personappointment,
              fromUser
            );
            updateAppt.status = "studentCancel";
            await AppointmentServices.updateForGoogle(
              updateAppt.id,
              updateAppt
            );
            // need to make a new appointment for the same time
            let temp = {
              date: appointment.date,
              startTime: appointment.originalStart,
              endTime: appointment.originalEnd,
              type: appointment.type,
              status: "available",
              preSessionInfo: "",
              groupId: appointment.groupId,
            };
            await AppointmentServices.addAppointment(temp).then(
              async (response) => {
                // private will only have one tutor
                let pap = {
                  isTutor: true,
                  appointmentId: response.data.id,
                  personId: this.appointment.tutors[0].personId,
                };
                await PersonAppointmentServices.addPersonAppointment(pap);
              }
            );
          }
        } else if (this.appointment.type === "Group") {
          let textInfo = {
            appointmentType: this.appointment.type,
            toPhoneNum: this.appointment.tutors[0].person.phoneNum,
            toPersonRoleId: this.appointment.tutors[0].person.personrole[0].id,
            date: this.formatDate(this.appointment.date),
            startTime: this.calcTime(this.appointment.startTime),
            topicName: this.appointment.topic.name,
            fromFirstName: fromUser.fName,
            fromLastName: fromUser.lName,
            fromRoleType: "Student",
          };
          console.log(textInfo);
          await TwilioServices.sendCanceledMessage(textInfo);
          let studentPersonAppointment = this.appointment.students.filter(
            (student) => student.personId === fromUser.userID
          )[0];
          // delete student's pa
          await PersonAppointmentServices.deletePersonAppointment(
            studentPersonAppointment.id
          );
          await AppointmentServices.updateForGoogle(updateAppt.id, updateAppt);
        }
      } else if (fromUser.selectedRole.type === "Tutor") {
        if (
          this.appointment.status === "available" &&
          this.appointment.students.length === 0
        ) {
          // if an available group appointment has more tutors, send messages and delete all personappointments
          if (
            this.appointment.type === "Group" &&
            this.appointment.tutors.length > 1
          ) {
            let textInfo = {
              appointmentType: this.appointment.type,
              toPhoneNum: "",
              toPersonRoleId: "",
              date: this.formatDate(this.appointment.date),
              startTime: this.calcTime(this.appointment.startTime),
              topicName: this.appointment.topic.name,
              fromFirstName: fromUser.fName,
              fromLastName: fromUser.lName,
              fromRoleType: "Tutor",
            };
            console.log(textInfo);
            for (
              let i = 0;
              i < this.appointment.personappointment.length;
              i++
            ) {
              // TODO if a tutor cancels and there is another tutor in the appointment, don't delete the whole appointment
              // send canceled texts to everyone but the one who canceled
              if (
                this.appointment.personappointment[i].personId !==
                fromUser.userID
              ) {
                textInfo.toPhoneNum =
                  this.appointment.personappointment[i].person.phoneNum;
                textInfo.toPersonRoleId =
                  this.appointment.personappointment[i].person.personrole[0].id;
                await TwilioServices.sendCanceledMessage(textInfo);
              }
              let pa = this.appointment.personappointment[i];
              await PersonAppointmentServices.deletePersonAppointment(pa.id);
            }
          } else {
            await PersonAppointmentServices.deletePersonAppointment(
              this.appointment.personappointment[0].id
            );
          }
          await AppointmentServices.deleteAppointment(this.appointment.id);
        } else {
          // just set appointment to canceled if tutor canceled
          await this.cancelFeedbackMessage(
            this.appointment.personappointment,
            fromUser
          );
          let textInfo = {
            appointmentType: this.appointment.type,
            toPhoneNum: "",
            toPersonRoleId: "",
            date: this.formatDate(this.appointment.date),
            startTime: this.calcTime(this.appointment.startTime),
            topicName: this.appointment.topic.name,
            fromFirstName: fromUser.fName,
            fromLastName: fromUser.lName,
            fromRoleType: "Tutor",
          };
          console.log(textInfo);
          for (let i = 0; i < this.appointment.personappointment.length; i++) {
            // TODO if a tutor cancels and there is another tutor in the appointment, don't delete the whole appointment
            // send canceled texts to everyone but the one who canceled
            if (
              this.appointment.personappointment[i].personId !== fromUser.userID
            ) {
              textInfo.toPhoneNum =
                this.appointment.personappointment[i].person.phoneNum;
              textInfo.toPersonRoleId =
                this.appointment.personappointment[i].person.personrole[0].id;
              await TwilioServices.sendCanceledMessage(textInfo);
            }
          }
          updateAppt.status = "tutorCancel";
          await AppointmentServices.updateForGoogle(updateAppt.id, updateAppt);
        }
      }
    },
    async cancelFeedbackMessage(personAppointments, fromUser) {
      for (let i = 0; i < personAppointments.length; i++) {
        let pa = personAppointments[i];
        let temp = {
          id: pa.id,
          isTutor: pa.isTutor,
          feedbacknumber: pa.feedbacknumber,
          feedbacktext: `Canceled by ${fromUser.fName} ${fromUser.lName}`,
          appointmentId: pa.appointmentId,
          personId: pa.personId,
        };
        await PersonAppointmentServices.updatePersonAppointment(temp.id, temp);
      }
    },
  },
};
