import apiClient from "@/services/services.js";

export default {
    sendMessage(user) {
        return apiClient.post("twilio/sendMessage", user);
    },
};