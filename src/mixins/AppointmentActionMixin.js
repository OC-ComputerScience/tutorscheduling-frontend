import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import TwilioServices from "@/services/twilioServices.js";
import { SendTextsMixin } from "./SendTextsMixin";

export const AppointmentActionMixin = {
  mixins: [SendTextsMixin],
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
        let textInfo = {
          appointmentId: this.appointment.id,
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
        await TwilioServices.sendPendingMessage(this.appointment.id);
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
        let textInfo = {
          appointmentId: this.appointment.id,
          adminFirstName: fromUser.fName,
          adminLastName: fromUser.lName,
          studentFirstName: student.fName,
          studentLastName: student.lName,
        };
        // TODO make sure texts are sent to every tutor linked to group appointment
        await TwilioServices.sendMessageFromAdmin(textInfo);
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
          firstName: fromUser.fName,
          lastName: fromUser.lName,
        };
        await TwilioServices.sendGroupMessage(textInfo);
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
      await AppointmentServices.updateForGoogle(updateAppt.id, updateAppt);
      await this.sendEditedMessage(fromUser, appointment.id);
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
          await TwilioServices.sendConfirmedMessage(appointment.id);
        }
      } else {
        // don't need to update google cal because it's not even on there yet
        confirmAppt.status = "tutorCancel";
        await AppointmentServices.updateAppointment(
          confirmAppt.id,
          confirmAppt
        ).then(async () => {
          await this.sendCanceledMessage(fromUser, appointment.id);
        });
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
          await this.sendCanceledMessage(fromUser, appointment.id);
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
          await this.sendCanceledMessage(fromUser, appointment.id);
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
            await this.sendCanceledMessage(fromUser, appointment.id);
            for (
              let i = 0;
              i < this.appointment.personappointment.length;
              i++
            ) {
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
          await this.sendCanceledMessage(fromUser, appointment.id);
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
