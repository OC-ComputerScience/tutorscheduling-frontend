import apiClient from "@/services/services.js";

export default {
  
    ///Appointments CRUD commands
    getAllAppointments() {
      return apiClient.get("appointment");
    },
    getAppointments(start, length) {
      return apiClient.get(`appointments?start=${start}&length=${length}`);
    },
    getAppointment(id) {
      return apiClient.get("appointment/" + id);
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