import apiClient from "@/services/services.js";

export default {
    loginUser(user) {
      return apiClient.post("login", user, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          crossDomain: true,
          Authorization: "Basic " + btoa(user.username + ":" + user.password)
        }
      });
    },
    logoutUser() {
      return apiClient.post("logout");
    }
  };