import apiClient from "@/services/services.js";

export default {
  
    ///Availabilitys CRUD commands
    getAllAppointments() {
      return apiClient.get("appointment");
    },
    getAppointment(id) {
      return apiClient.get("appointment/" + id);
    },
    getAppointmentForPerson(personId) {
      return apiClient.get("appointment/person/" + personId)
    },
    getAppointmentForGroup(groupId) {
      return apiClient.get("appointment/group/" + groupId)
    },
    getAppointmentForPersonForGroup(groupId, personId) {
      return apiClient.get("appointment/group/" + groupId + "/person/" + personId)
    },
    addAppointment(appointment) {
      return apiClient.post("appointment", appointment);
    },
    updateAppointment(appointmentId, appointment) {
      return apiClient.put("appointment/" + appointmentId, appointment);
    },
    deleteAppointment(appointmentId) {
      return apiClient.delete("appointment/" + appointmentId);
    }
  };