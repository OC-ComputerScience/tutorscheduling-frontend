import Vue from "vue";
import Router from "vue-router";

import Apply from "./views/Apply.vue";
import Calendar from "./views/Calendar.vue";
import Contract from "./views/Contract.vue";
import Help from "./views/Help.vue";
import Login from "./views/Login.vue";
import MyInfo from "./views/MyInfo.vue";
import PageNotFound from "./views/PageNotFound.vue";

// Admin Screens
import AdminApprove from "./views/Admin/AdminApprove.vue";
import AdminHome from "./views/Admin/AdminHome.vue";
import AdminReports from "./views/Admin/AdminReports.vue";
import AdminRequests from "./views/Admin/AdminRequests.vue";

//Group
import GroupList from "./views/Admin/Group/GroupList.vue";
import GroupEdit from "./views/Admin/Group/GroupEdit.vue";
import GroupAdd from "./views/Admin/Group/GroupAdd.vue";
import GroupView from "./views/Admin/Group/GroupView.vue";

// Location
import LocationList from "./views/Admin/Location/LocationList.vue";
import LocationEdit from "./views/Admin/Location/LocationEdit.vue";
import LocationAdd from "./views/Admin/Location/LocationAdd.vue";
import LocationView from "./views/Admin/Location/LocationView.vue";

// Person
import PersonList from "./views/Admin/Person/PersonList.vue";
import PersonAdd from "./views/Admin/Person/PersonAdd.vue";
import PersonView from "./views/Admin/Person/PersonView.vue";

// Role
import RoleList from "./views/Admin/Role/RoleList.vue";
import RoleEdit from "./views/Admin/Role/RoleEdit.vue";
import RoleAdd from "./views/Admin/Role/RoleAdd.vue";
import RoleView from "./views/Admin/Role/RoleView.vue";

// Topic
import TopicList from "./views/Admin/Topic/TopicList.vue";
import TopicEdit from "./views/Admin/Topic/TopicEdit.vue";
import TopicAdd from "./views/Admin/Topic/TopicAdd.vue";
import TopicView from "./views/Admin/Topic/TopicView.vue";

// Student Screens

import StudentAddRequest from "./views/Student/StudentAddRequest.vue";
import StudentAppointmentFeedback from "./views/Student/StudentAppointmentFeedback.vue";
import StudentHome from "./views/Student/StudentHome.vue";

// Tutor Screens

import TutorAddAvailability from "./views/Tutor/TutorAddAvailability.vue";
import TutorAddTopics from "./views/Tutor/TutorAddTopics.vue";
import TutorAppointmentFeedback from "./views/Tutor/TutorAppointmentFeedback.vue";
import TutorHome from "./views/Tutor/TutorHome.vue";

Vue.use(Router);

const router = new Router({
  mode: "hash",
  linkExactActiveClass: "active",
  base:
    //    process.env.NODE_ENV === 'development'? "/" : "/tutorScheduling/", - for AWS
    process.env.NODE_ENV === "development" ? "/" : "/",
  routes: [
    {
      path: "/apply/:id",
      name: "apply",
      component: Apply,
      props: true,
    },
    {
      path: "/calendar/:id",
      name: "calendar",
      component: Calendar,
      props: true,
    },
    {
      path: "/contract/:id",
      name: "contract",
      component: Contract,
    },
    {
      path: "/help/:id",
      name: "help",
      component: Help,
      props: true,
    },
    {
      path: "/",
      name: "login",
      alias: "/login",
      component: Login,
    },
    {
      path: "/myInfo/:id",
      name: "myInfo",
      component: MyInfo,
      props: true,
    },
    {
      path: "/groupAdd/:id",
      name: "groupAdd",
      component: GroupAdd,
      props: true,
    },
    {
      path: "/groupEdit/:id",
      name: "groupEdit",
      component: GroupEdit,
      props: true,
    },
    {
      path: "/groupList/:id",
      name: "groupList",
      component: GroupList,
      props: true,
    },
    {
      path: "/groupView/:id/:groupId",
      name: "groupView",
      component: GroupView,
      props: true,
    },
    {
      path: "/locationAdd/:id",
      name: "locationAdd",
      component: LocationAdd,
      props: true,
    },
    {
      path: "/locationEdit/:id",
      name: "locationEdit",
      component: LocationEdit,
      props: true,
    },
    {
      path: "/locationList/:id",
      name: "locationList",
      component: LocationList,
      props: true,
    },
    {
      path: "/locationView/:id/:locationId",
      name: "locationView",
      component: LocationView,
      props: true,
    },
    {
      path: "/personAdd/:id",
      name: "personAdd",
      component: PersonAdd,
      props: true,
    },
    {
      path: "/personList/:id",
      name: "personList",
      component: PersonList,
      props: true,
    },
    {
      path: "/personView/:id/:personId",
      name: "personView",
      component: PersonView,
      props: true,
    },
    {
      path: "/roleAdd/:id",
      name: "roleAdd",
      component: RoleAdd,
      props: true,
    },
    {
      path: "/roleEdit/:id",
      name: "roleEdit",
      component: RoleEdit,
      props: true,
    },
    {
      path: "/roleList/:id",
      name: "roleList",
      component: RoleList,
      props: true,
    },
    {
      path: "/roleView/:id/:roleId",
      name: "roleView",
      component: RoleView,
      props: true,
    },
    {
      path: "/topicAdd/:id",
      name: "topicAdd",
      component: TopicAdd,
      props: true,
    },
    {
      path: "/topicEdit/:id",
      name: "topicEdit",
      component: TopicEdit,
      props: true,
    },
    {
      path: "/topicList/:id",
      name: "topicList",
      component: TopicList,
      props: true,
    },
    {
      path: "/topicView/:id/:topicId",
      name: "topicView",
      component: TopicView,
      props: true,
    },
    {
      path: "/adminApprove/:id",
      name: "adminApprove",
      component: AdminApprove,
      props: true,
    },
    {
      path: "/adminHome/:id",
      name: "adminHome",
      component: AdminHome,
      props: true,
    },
    {
      path: "/adminReports/:id",
      name: "adminReports",
      component: AdminReports,
      props: true,
    },
    {
      path: "/adminRequests/:id",
      name: "adminRequests",
      component: AdminRequests,
      props: true,
    },
    {
      path: "/studentAddRequest/:id",
      name: "studentAddRequest",
      component: StudentAddRequest,
      props: true,
    },
    {
      path: "/studentAppointmentFeedback/:id/:userId",
      name: "studentAppointmentFeedback",
      component: StudentAppointmentFeedback,
      props: true,
    },
    {
      path: "/studentHome/:id",
      name: "studentHome",
      component: StudentHome,
      props: true,
    },
    {
      path: "/tutorAddAvailability/:id",
      name: "tutorAddAvailability",
      component: TutorAddAvailability,
      props: true,
    },
    {
      path: "/tutorAppointmentFeedback/:id/:userId",
      name: "tutorAppointmentFeedback",
      component: TutorAppointmentFeedback,
      props: true,
    },
    {
      path: "/tutorAddTopics/:id",
      name: "tutorAddTopics",
      component: TutorAddTopics,
      props: true,
    },
    {
      path: "/tutorHome/:id",
      name: "tutorHome",
      component: TutorHome,
      props: true,
    },
    {
      path: "*",
      component: PageNotFound,
    },
  ],
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ["/"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");
  if (authRequired && !loggedIn) {
    return next("/");
  }
  next();
});

export default router;
