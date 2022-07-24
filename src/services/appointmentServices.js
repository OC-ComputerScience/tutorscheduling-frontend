import apiClient from "@/services/services.js";

export default {
  
    ///Availabilitys CRUD commands
    getAllAppointments() {
      return apiClient.get("appointment");
    },
    getAllForGroup(id) {
      return apiClient.get("appointment/group/" + id);
    },
    getGoogleCalPage() {
      return apiClient.get("appointment/googlecal");
    },
    getAppointment(id) {
      return apiClient.get("appointment/" + id);
    },
    getTutorForAppointment(id) {
      return apiClient.get("appointment/tutorAppointment/" + id);
    },
    getAppointmentForPerson(personId) {
      return apiClient.get("appointment/person/" + personId)
    },
    getAppointmentForGroup(groupId) {
      return apiClient.get("appointment/group/" + groupId)
    },
    findAppointmentsForGroup(groupId) { // function used to find appointments to put into the calendar
      return apiClient.get("appointment/allGroup/" + groupId)
    },
    getUpcomingAppointmentForGroup(groupId) {
      return apiClient.get("appointment/upGroup/" + groupId)
    },
    getAppointmentForPersonForGroup(groupId, personId) {
      return apiClient.get("appointment/group/" + groupId + "/person/" + personId)
    },
    getUpcomingAppointmentForPersonForGroup(groupId, personId) {
      return apiClient.get("appointment/upGroup/" + groupId + "/person/" + personId)
    },
    getPassedAppointmentForPersonForGroupTutor(groupId, personId) {
      return apiClient.get("appointment/passGroupTutor/" + groupId + "/person/" + personId)
    },
    getPassedAppointmentForPersonForGroupStudent(groupId, personId) {
      return apiClient.get("appointment/passGroupStudent/" + groupId + "/person/" + personId)
    },
    addAppointment(appointment) {
      return apiClient.post("appointment", appointment);
    },
    updateAppointment(appointmentId, appointment) {
      return apiClient.put("appointment/" + appointmentId, appointment);
    },
    updateForGoogle(appointmentId, appointment) {
      return apiClient.put("appointment/google/" + appointmentId, appointment);
    },
    deleteAppointment(appointmentId) {
      return apiClient.delete("appointment/" + appointmentId);
    }
  };
  