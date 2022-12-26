// import GroupServices from "../services/groupServices";
// import Utils from "../config/utils";

import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";

export const AppointmentActionMixin = {
  data() {
    return {
      overlay: true,
      appointments: [],
      personAppointments: [],
      selectedAppointment: {},
    };
  },
  methods: {
    async getAppointments(groupId) {
      this.overlay = true;
      await AppointmentServices.findAppointmentsForGroup(groupId)
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
          //filter away cancelled appointments
          if (
            this.appointments[i].status.includes("studentCancel") ||
            this.appointments[i].status.includes("tutorCancel")
          ) {
            filtered = false;
          }
        }
        //filter their appointments, all available appointments, all group appointments, and their cancelled appointments for TUTORS
        else if (this.checkRole("Tutor")) {
          //filter away cancelled appointments that aren't theirs
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
    async bookAppointment(groupId) {
      await AppointmentServices.getAppointment(this.selectedAppointment.id)
        .then(async (response) => {
          if (
            response.data.status == "available" &&
            response.data.type.includes("Private") &&
            !this.checkRole("Admin") &&
            !this.adminAddStudent
          ) {
            await this.splitAppointment().then(() => {
              this.getAppointments(groupId);
              this.selectedEvent.color = "yellow";
            });
          } else if (
            this.adminAddStudent &&
            !this.studentNameInput &&
            response.data.type.includes("Private")
          ) {
            await this.splitAppointmentForAdminAdd().then(() => {
              this.getAppointments(groupId);
              this.selectedEvent.color = "blue";
            });
          } else if (
            this.adminAddStudent &&
            this.studentNameInput &&
            response.data.type.includes("Private")
          ) {
            await this.adminAdd().then(() => {
              this.splitAppointmentForAdminAdd().then(() => {
                this.getAppointments(groupId);
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
            this.getAppointments(groupId);
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
      this.sendMessage(
        this.tutors[0],
        this.user.fName,
        this.user.lName,
        this.selectedAppointment.id
      );

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
  },
};
