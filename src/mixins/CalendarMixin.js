import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import TwilioServices from "@/services/twilioServices.js";
import { TimeFunctionsMixin } from "./TimeFunctionsMixin";

export const CalendarMixin = {
  mixins: [TimeFunctionsMixin],
  methods: {
    async getUpdatedAppointment(appointmentId) {
      let appointment = {};
      await AppointmentServices.getAppointmentInfo(appointmentId).then(
        async (response) => {
          appointment = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          if (
            appointment &&
            appointment.personappointment !== null &&
            appointment.personappointment !== undefined
          ) {
            appointment.students = appointment.personappointment.filter(
              (pa) => pa.isTutor === false || pa.isTutor === 0
            );
            appointment.tutors = appointment.personappointment.filter(
              (pa) => pa.isTutor === true || pa.isTutor === 1
            );
          }
        }
      );

      return appointment;
    },
    async getAppointmentsForGroup(groupId) {
      let appointments = [];

      await AppointmentServices.findAppointmentsForGroup(groupId).then(
        async (response) => {
          appointments = response.data;
          for (let i = 0; i < appointments.length; i++) {
            let appointment = appointments[i];
            if (
              appointment.personappointment !== null &&
              appointment.personappointment !== undefined
            ) {
              appointment.students = appointment.personappointment.filter(
                (pa) => pa.isTutor === false
              );
              appointment.tutors = appointment.personappointment.filter(
                (pa) => pa.isTutor === true
              );
            }
          }
        }
      );

      return appointments;
    },
    setUpCalendarEvent(appointment) {
      let startTime = new Date(appointment.date);
      let startTimes = appointment.startTime.split(":");
      startTime.setHours(startTime.getHours() + parseInt(startTimes[0]));
      startTime.setMinutes(startTime.getMinutes() + parseInt(startTimes[1]));
      let endTime = new Date(appointment.date);
      let endTimes = appointment.endTime.split(":");
      endTime.setHours(endTime.getHours() + parseInt(endTimes[0]));
      endTime.setMinutes(endTime.getMinutes() + parseInt(endTimes[1]));

      appointment.newStart = appointment.startTime;
      appointment.newEnd = appointment.endTime;

      appointment.eventStart = startTime;
      appointment.eventEnd = endTime;

      let studentName =
        appointment.students.length > 0
          ? `${appointment.students[0].person.fName} 
            ${appointment.students[0].person.lName}`
          : "Open";
      let tutorName =
        appointment.tutors.length > 0
          ? `${appointment.tutors[0].person.fName} 
            ${appointment.tutors[0].person.lName}`
          : "Open";

      //Set color for each event
      switch (appointment.status) {
        case "pending":
          appointment.color = "yellow";
          break;
        case "studentCancel":
        case "tutorCancel":
        case "noShow":
          appointment.color = "error";
          break;
        case "booked":
          appointment.color = "blue";
          break;
        case "complete":
          appointment.color = "darkblue";
          break;
        default:
          appointment.color = "grey";
          break;
      }

      if (
        appointment.type === "Group" &&
        !(
          appointment.status.includes("Cancel") ||
          appointment.status === "complete" ||
          appointment.status === "noShow"
        )
      ) {
        if (appointment.isMemberOfAppointment) {
          appointment.color = "blue";
        } else {
          appointment.color = "teal";
        }
      }

      let topicName = "Open";
      if (
        appointment.topic &&
        appointment.topic.name &&
        (appointment.topic.groupId === undefined ||
          Number(appointment.topic.groupId) === Number(appointment.groupId))
      ) {
        topicName = appointment.topic.name;
      }

      //Note the format of each event, what data is associated with it
      if (appointment.type === "Group") {
        if (appointment.status.includes("Cancel")) {
          appointment.name = `Group - Canceled by ${tutorName}`;
        } else if (appointment.status === "noShow") {
          appointment.name = `Group - No Show`;
        } else {
          if (appointment.isTutor && appointment.students.length === 0) {
            appointment.color = "grey";
          }
          appointment.name = `Group - ${topicName} Tutoring`;
        }
      } else if (appointment.type === "Private") {
        if (appointment.status === "available") {
          appointment.name = `${tutorName} - ${topicName} Tutoring`;
        } else if (
          !(
            appointment.status.includes("Cancel") ||
            appointment.status === "noShow"
          )
        ) {
          appointment.name = `${studentName} - ${topicName} Tutoring`;
        } else {
          if (appointment.status === "tutorCancel") {
            appointment.name = `Canceled by ${tutorName}`;
          } else if (appointment.status === "studentCancel") {
            appointment.name = `Canceled by ${studentName}`;
          } else if (appointment.status === "noShow") {
            appointment.name = `No Show by ${studentName}`;
          }
        }
      }
    },
    async bookAppointment(isAdminAdd, appointment, fromUser, student, tutorSetLocation) {
      try {
        // First check if the appointment is still available
        const currentAppointment = await AppointmentServices.getAppointment(appointment.id);
        if (currentAppointment.data.status !== "available") {
          throw new Error("This appointment is no longer available.");
        }

        // Only check for overlapping appointments if this is a private appointment
        if (appointment.type === "Private") {
          const overlappingAppointments =
            await AppointmentServices.checkOverlappingAppointments({
            tutorId: appointment.tutors[0].personId,
            date: appointment.date,
            startTime: appointment.newStart || appointment.startTime,
            endTime: appointment.newEnd || appointment.endTime,
            excludeAppointmentId: appointment.id
          });
          const overlapping =
            overlappingAppointments.data || overlappingAppointments;
          
          if (overlapping && overlapping.length > 0) {
            throw new Error("This time slot is no longer available as it overlaps with another booking.");
          }

          await this.splitAppointment(isAdminAdd, appointment, fromUser, student, tutorSetLocation);
        } else if (appointment.type === "Group") {
          // For group appointments, check if this student is already in the appointment
          const isStudentAlreadyBooked = appointment.students.some(
            existingStudent => existingStudent.personId === (student?.id || fromUser.userID)
          );
          
          if (isStudentAlreadyBooked) {
            throw new Error("You are already booked for this group session.");
          }

          for (let i = 0; i < appointment.tutors.length; i++) {
            const overlappingAppointments =
              await AppointmentServices.checkOverlappingAppointments({
                tutorId: appointment.tutors[i].personId,
                date: appointment.date,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                excludeAppointmentId: appointment.id,
              });
            const overlapping =
              overlappingAppointments.data || overlappingAppointments;
            if (overlapping && overlapping.length > 0) {
              throw new Error(
                "This time slot is no longer available as it overlaps with another booking."
              );
            }
          }
          
          await this.bookGroupSession(isAdminAdd, appointment, fromUser, student);
        }
      } catch (error) {
        throw error;
      }
    },
    // Split appointments into more availability slots when part of slot is booked
    async splitAppointment(
      isAdminAdd,
      appointment,
      fromUser,
      student,
      tutorSetLocation
    ) {
      //If the start of the booked slot isn't the start of the slot, generate an open slot
      if (
        appointment.startTime < appointment.newStart &&
        this.subtractTimes(appointment.startTime, appointment.newStart) >=
          appointment.minApptTime
      ) {
        let temp = {
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.newStart,
          type: appointment.type,
          status: "available",
          groupId: appointment.groupId,
          locationId: tutorSetLocation ? appointment.locationId : null,
        };
        await AppointmentServices.addAppointment(temp).then(
          async (response) => {
            // private will only have one tutor
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: appointment.tutors[0].personId,
            };
            await PersonAppointmentServices.addPersonAppointment(pap);
          }
        );
      }
      //If the end of the booked slot isn't the end of the slot, generate an open slot
      if (
        appointment.endTime > appointment.newEnd &&
        this.subtractTimes(appointment.newEnd, appointment.endTime) >=
          appointment.minApptTime
      ) {
        let temp = {
          date: appointment.date,
          startTime: appointment.newEnd,
          endTime: appointment.endTime,
          type: appointment.type,
          status: "available",
          preSessionInfo: "",
          groupId: appointment.groupId,
          locationId: tutorSetLocation ? appointment.locationId : null,
        };
        await AppointmentServices.addAppointment(temp).then(
          async (response) => {
            // private will only have one tutor
            let pap = {
              isTutor: true,
              appointmentId: response.data.id,
              personId: appointment.tutors[0].personId,
            };
            await PersonAppointmentServices.addPersonAppointment(pap);
          }
        );
      }

      // add person appointment
      let pap = {
        isTutor: false,
        appointmentId: appointment.id,
      };

      // make temp appointment
      let temp = {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.newStart,
        endTime: appointment.newEnd,
        type: appointment.type,
        status: appointment.status,
        preSessionInfo: appointment.preSessionInfo,
        groupId: appointment.groupId,
        locationId:  appointment.locationId ,
        topicId: appointment.topicId,
        googleEventId: appointment.googleEventId,
      };

      // handle if admin/tutor with privilege added appointment
      if (isAdminAdd) {
        pap.personId = student.id;
        await PersonAppointmentServices.addPersonAppointment(pap);
        await AppointmentServices.updateAppointment(appointment.id, temp);
        await this.notifyBookedAppointment({
          appointmentId: appointment.id,
          fromUser,
          student,
          isAdminAdd: true,
        });
      } // handle if student added appointment
      else {
        pap.personId = fromUser.userID ? fromUser.userID : fromUser.id;
        await PersonAppointmentServices.addPersonAppointment(pap);
        temp.status = "pending";
        await AppointmentServices.updateAppointment(appointment.id, temp);
        await this.notifyBookedAppointment({
          appointmentId: appointment.id,
          fromUser,
          isAdminAdd: false,
        });
      }
    },
    appointmentTextLocationName(appointment) {
      if (!appointment || !appointment.location) {
        return "";
      }
      if (
        appointment.location.type &&
        appointment.location.type.includes("Online") &&
        appointment.URL
      ) {
        return appointment.URL;
      }
      return appointment.location.name || "";
    },
    appointmentTutorRoleId(appointment) {
      const tutor =
        appointment && appointment.tutors && appointment.tutors[0];
      const personRole =
        tutor &&
        tutor.person &&
        tutor.person.personrole &&
        tutor.person.personrole[0];
      return personRole ? personRole.id : "";
    },
    async notifyBookedAppointment({
      appointmentId,
      fromUser,
      student,
      isAdminAdd,
    }) {
      try {
        const appointment = await this.getUpdatedAppointment(appointmentId);
        if (!appointment || !appointment.id) {
          return;
        }
        const tutor = appointment.tutors && appointment.tutors[0];
        const textInfo = {
          appointmentId: appointment.id,
          appointmentType: appointment.type,
          tutorPhoneNum:
            tutor && tutor.person ? tutor.person.phoneNum : "",
          tutorPersonRoleId: this.appointmentTutorRoleId(appointment),
          date: this.formatDate(appointment.date),
          startTime: this.formatTimeFromString(appointment.startTime),
          locationName: this.appointmentTextLocationName(appointment),
          topicName: appointment.topic ? appointment.topic.name : "",
          adminFirstName: fromUser.fName,
          adminLastName: fromUser.lName,
          studentFirstName: isAdminAdd ? student.fName : fromUser.fName,
          studentLastName: isAdminAdd ? student.lName : fromUser.lName,
        };
        if (isAdminAdd) {
          if (appointment.status === "booked") {
            await TwilioServices.sendMessageFromAdmin(textInfo);
          } else if (appointment.status === "pending") {
            await TwilioServices.sendPendingMessage(textInfo);
          }
        } else {
          await TwilioServices.sendPendingMessage(textInfo);
        }
      } catch (error) {
        console.log("Could not send booking notification:", error);
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
          appointmentId: appointment.id,
          appointmentType: appointment.type,
          tutorPhoneNum: "",
          tutorPersonRoleId: "",
          date: this.formatDate(appointment.date),
          startTime: this.formatTimeFromString(appointment.startTime),
          locationName:
            appointment.location.type.includes("Online") &&
            appointment.URL !== null
              ? appointment.URL
              : appointment.location.name,
          topicName: appointment.topic.name,
          adminFirstName: fromUser.fName,
          adminLastName: fromUser.lName,
          studentFirstName: student.fName,
          studentLastName: student.lName,
        };
        // send message to all tutors of group appointment
        for (let i = 0; i < appointment.tutors.length; i++) {
          textInfo.tutorPhoneNum = appointment.tutors[i].person.phoneNum;
          textInfo.tutorPersonRoleId =
            appointment.tutors[i].person.personrole[0].id;
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
          appointmentId: appointment.id,
          roleType: fromUser.selectedRole.type,
          tutorPhoneNum: "",
          tutorPersonRoleId: "",
          date: this.formatDate(appointment.date),
          startTime: this.formatTimeFromString(appointment.startTime),
          locationName:
            appointment.location.type.includes("Online") &&
            appointment.URL !== null
              ? appointment.URL
              : appointment.location.name,
          topicName: appointment.topic.name,
          fromFirstName: fromUser.fName,
          fromLastName: fromUser.lName,
        };
        // send message to all tutors of group appointment
        for (let i = 0; i < appointment.tutors.length; i++) {
          textInfo.tutorPhoneNum = appointment.tutors[i].person.phoneNum;
          textInfo.tutorPersonRoleId =
            appointment.tutors[i].person.personrole[0].id;
          await TwilioServices.sendGroupMessage(textInfo);
        }
      }
      // need to update group session in google
      await AppointmentServices.updateAppointment(appointment.id, appointment);
    },
    async editAppointment(fromUser, appointment) {
      let updatedAppointment = {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        status: appointment.status,
        preSessionInfo: appointment.preSessionInfo,
        groupId: appointment.groupId,
        topicId: appointment.topicId,
        locationId: appointment.locationId,
        tutorSetLocation: appointment.tutorSetLocation,
        googleEventId: appointment.googleEventId,
      };
      let textInfo = {
        appointmentId: appointment.id,
        appointmentType: appointment.type,
        roleType: "",
        toPhoneNum: "",
        toPersonRoleId: "",
        date: this.formatDate(appointment.date),
        startTime: this.formatTimeFromString(appointment.startTime),
        topicName: appointment.topic.name,
        fromFirstName: fromUser.fName,
        fromLastName: fromUser.lName,
      };
      await AppointmentServices.updateAppointment(
        updatedAppointment.id,
        updatedAppointment
      );
      // send message to all tutors of group appointment
      for (let i = 0; i < appointment.personappointment.length; i++) {
        if (appointment.personappointment[i].personId !== fromUser.userID) {
          textInfo.roleType = appointment.personappointment[i].isTutor
            ? "Tutor"
            : "Student";
          textInfo.toPhoneNum =
            appointment.personappointment[i].person.phoneNum;
          textInfo.toPersonRoleId =
            appointment.personappointment[i].person.personrole[0].id;
          await TwilioServices.sendEditedMessage(textInfo);
        }
      }
    },
    async confirmAppointment(confirm, fromUser, appointment) {
      let updatedAppointment = {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        status: appointment.status,
        preSessionInfo: appointment.preSessionInfo,
        groupId: appointment.groupId,
        topicId: appointment.topicId,
        locationId: appointment.locationId,
        tutorSetLocation: appointment.tutorSetLocation,
        googleEventId: appointment.googleEventId,
      };
      if (confirm) {
        if (appointment.type === "Private") {
          updatedAppointment.status = "booked";
          await AppointmentServices.updateAppointment(
            updatedAppointment.id,
            updatedAppointment
          );

          let textInfo = {
            appointmentId: appointment.id,
            appointmentType: appointment.type,
            studentPhoneNum: appointment.students[0].person.phoneNum,
            studentPersonRoleId:
              appointment.students[0].person.personrole[0].id,
            date: this.formatDate(appointment.date),
            startTime: this.formatTimeFromString(appointment.startTime),
            topicName: appointment.topic.name,
            tutorFirstName: fromUser.fName,
            tutorLastName: fromUser.lName,
          };
          await TwilioServices.sendConfirmedMessage(textInfo);
        }
      } else {
        console.log(appointment);
        // don't need to update google cal because it's not even on there yet
        updatedAppointment.status = "tutorCancel";
        let textInfo = {
          appointmentType: appointment.type,
          toPhoneNum: appointment.students[0].person.phoneNum,
          toPersonRoleId: appointment.students[0].person.personrole[0].id,
          date: this.formatDate(appointment.date),
          startTime: this.formatTimeFromString(appointment.startTime),
          topicName: appointment.topic.name,
          fromFirstName: fromUser.fName,
          fromLastName: fromUser.lName,
          fromRoleType: "Tutor",
        };
        console.log(textInfo);
        await TwilioServices.sendCanceledMessage(textInfo);
        await AppointmentServices.updateAppointment(
          updatedAppointment.id,
          updatedAppointment
        );
      }
    },
  },
};
