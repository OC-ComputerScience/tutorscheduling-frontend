import axios from "axios";
import AuthServices from "@/services/authServices";
import Utils from "@/config/utils.js";
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
});

const authInterceptor = async (config) => {
  let user = Utils.getStore("user");
  if (user !== null && user !== undefined) {
    if (user.sessionExpirationDate < new Date()) {
      console.log(Router.currentRoute);
      if (Router.currentRoute.path !== "/") {
        await Router.push({
          path: "/",
          query: { redirect: Router.currentRoute.fullPath },
        }).catch((err) => {
          // Ignore the vuex err regarding navigating to the page they are already on.
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
    }
    if (user.token != null && user.token != "") {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
};

apiClient.interceptors.request.use(authInterceptor);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    console.log(error);
    // fix expired token issue
    if (
      Utils.getStore("user") !== null &&
      Utils.getStore("user") !== undefined &&
      error.response.status === 498
    ) {
      await AuthServices.logoutUser(Utils.getStore("user"))
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (
      error.response.status === 401 ||
      error.response.status === 440 ||
      error.response.status === 498
    ) {
      if (
        Utils.getStore("user") !== null &&
        Utils.getStore("user") !== undefined
      ) {
        Utils.removeItem("user");
      }
      console.log(Router.currentRoute);
      if (Router.currentRoute.path !== "/") {
        await Router.push({
          path: "/",
          query: { redirect: Router.currentRoute.fullPath },
        }).catch((err) => {
          // Ignore the vuex err regarding navigating to the page they are already on.
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
    }

    return Promise.reject(error);
  }
);

export default apiClient;
