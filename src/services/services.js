import axios from "axios";
import Utils from "@/config/utils.js";
import AuthServices from "./authServices.js";
import Router from "../router.js";

var baseurl = "";
if (process.env.NODE_ENV === "development") {
  baseurl = "http://localhost/tutoring-api/";
} else {
  baseurl = "/tutoring-api/";
}

const apiClient = axios.create({
  baseURL: baseurl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
    crossDomain: true,
  },
  transformRequest: (data, headers) => {
    let user = Utils.getStore("user");
    if (user != null) {
      let token = user.token;
      let authHeader = "";
      if (token != null && token != "") authHeader = "Bearer " + token;
      headers.common["Authorization"] = authHeader;
    }
    return JSON.stringify(data);
  },
  transformResponse: function (data) {
    data = JSON.parse(data);
    if (data.message !== undefined && data.message.includes("Unauthorized")) {
      AuthServices.logoutUser(Utils.getStore("user")).catch((error) => {
        console.log("error", error);
      });
      Utils.removeItem("user");
      Router.push({ name: "login" }).catch((err) => {
        // Ignore the vuex err regarding  navigating to the page they are already on.
        if (
          err.name !== "NavigationDuplicated" &&
          !err.message.includes(
            "Avoided redundant navigation to current location"
          )
        ) {
          // But print any other errors to the console
          console.log(err);
        }
      });
    }
    return data;
  },
});

export default apiClient;
