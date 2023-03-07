import apiClient from "@/services/services.js";

export default {
  sendMessage(user) {
    return apiClient.post("twilio/sendMessage", user);
  },
  sendApplicationMessage(textInfo) {
    return apiClient.post(`twilio/sendApplication`, textInfo);
  },
  sendRequestMessage(textInfo) {
    return apiClient.post(`twilio/sendRequest`, textInfo);
  },
  sendMessageFromAdmin(textInfo) {
    return apiClient.post(`twilio/sendMessageFromAdmin`, textInfo);
  },
  sendPendingMessage(appointmentId) {
    return apiClient.post(`twilio/sendPending/${appointmentId}`);
  },
  sendConfirmedMessage(appointmentId) {
    return apiClient.post(`twilio/sendConfirmed/${appointmentId}`);
  },
};
