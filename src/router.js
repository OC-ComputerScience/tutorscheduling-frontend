import Vue from 'vue'
import Router from 'vue-router'

import Login from './views/Login.vue';
import Contract from './views/Contract.vue';
import Apply from './views/Apply.vue';
import Help from './views/Help.vue';

// Admin Views. Views are sorted into sections for this project, so check that the path is correct below.
import AdminHome from './views/AdminViews/AdminHome.vue'
import AdminInfo from './views/AdminViews/AdminInfo.vue'
import AdminDashboard from './views/AdminViews/AdminDashboard.vue'

//Groups
import GroupList    from './views/AdminViews/GroupViews/GroupList.vue';
import GroupEdit    from './views/AdminViews/GroupViews/GroupEdit.vue';
import GroupAdd     from './views/AdminViews/GroupViews/GroupAdd.vue';
import GroupView    from './views/AdminViews/GroupViews/GroupView.vue';

// People
import PersonList    from './views/AdminViews/PersonViews/PersonList.vue';
import PersonAdd     from './views/AdminViews/PersonViews/PersonAdd.vue';
import PersonView    from './views/AdminViews/PersonViews/PersonView.vue';

// Topic
import TopicList    from './views/AdminViews/TopicViews/TopicList.vue';
import TopicEdit    from './views/AdminViews/TopicViews/TopicEdit.vue';
import TopicAdd     from './views/AdminViews/TopicViews/TopicAdd.vue';
import TopicView    from './views/AdminViews/TopicViews/TopicView.vue';

// Location
import LocationList    from './views/AdminViews/LocationViews/LocationList.vue';
import LocationEdit    from './views/AdminViews/LocationViews/LocationEdit.vue';
import LocationAdd     from './views/AdminViews/LocationViews/LocationAdd.vue';
import LocationView    from './views/AdminViews/LocationViews/LocationView.vue';

// Role
import RoleList    from './views/AdminViews/RoleViews/RoleList.vue';
import RoleEdit    from './views/AdminViews/RoleViews/RoleEdit.vue';
import RoleAdd     from './views/AdminViews/RoleViews/RoleAdd.vue';
import RoleView    from './views/AdminViews/RoleViews/RoleView.vue';

// Request
import RequestList    from './views/AdminViews/RequestViews/RequestList.vue';
import RequestAdd     from './views/StudentViews/RequestAdd.vue';

// Reports
import ReportList    from './views/AdminViews/ReportViews/ReportList.vue';

// Approvals
import PendingList    from './views/AdminViews/ApprovalViews/PendingList.vue';
import PendingView    from './views/AdminViews/ApprovalViews/PendingView.vue';

// Availability
import AvailabilityAdd    from './views/AdminViews/AvailabilityViews/AvailabilityAdd.vue';

// Calendar
import MainCalendar    from './views/CalendarViews/MainCalendar.vue';

// Tutor Pages
import TutorHome from './views/TutorViews/TutorHome.vue'
import TutorInfo from './views/TutorViews/TutorInfo.vue'
import TutorTopics from './views/TutorViews/TutorTopics.vue'

// Student Pages
import StudentHome from './views/StudentViews/StudentHome.vue'
import StudentInfo from './views/StudentViews/StudentInfo.vue'

// Feedback
import StudentAppointmentFeedback from './views/FeedbackViews/StudentAppointmentFeedback.vue'
import TutorAppointmentFeedback from './views/FeedbackViews/TutorAppointmentFeedback.vue'

Vue.use(Router)

const router =  new Router({
  mode: 'hash',
  linkExactActiveClass: 'active',
  base:
//    process.env.NODE_ENV === 'development'? "/" : "/tutorScheduling/", - for AWS
    process.env.NODE_ENV === 'development'? "/" : "/",
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/contract',
      name: 'contract',
      component: Contract
    },
    {
      path: '/apply',
      name: 'apply',
      component: Apply
    },
    {
      path: '/help',
      name: 'help',
      component: Help
    },
    {
      path: '/groupList',
      name: 'groupList',
      component: GroupList
    },
    {
      path: '/groupEdit/:id',
      name: 'groupEdit',
      component: GroupEdit,
      props: true
    },
    {
      path: '/groupAdd',
      name: 'groupAdd',
      component: GroupAdd
    },
    {
      path: '/GroupView/:id',
      name: 'groupView',
      component: GroupView,
      props: true
    },
    {
      path: '/personList',
      name: 'personList',
      component: PersonList
    },
    {
      path: '/personAdd',
      name: 'personAdd',
      component: PersonAdd
    },
    {
      path: '/personView/:id',
      name: 'personView',
      component: PersonView,
      props: true
    },
    {
      path: '/topicList',
      name: 'topicList',
      component: TopicList
    },
    {
      path: '/topicEdit/:id',
      name: 'topicEdit',
      component: TopicEdit,
      props: true
    },
    {
      path: '/topicAdd',
      name: 'topicAdd',
      component: TopicAdd,
      props: true
    },
    {
      path: '/topicView/:id',
      name: 'topicView',
      component:TopicView,
      props: true
    },
    {
      path: '/locationList',
      name: 'locationList',
      component: LocationList
    },
    {
      path: '/locationEdit/:id',
      name: 'locationEdit',
      component: LocationEdit,
      props: true
    },
    {
      path: '/locationAdd',
      name: 'locationAdd',
      component: LocationAdd,
      props: true
    },
    {
      path: '/locationView/:id',
      name: 'locationView',
      component:LocationView,
      props: true
    },
    {
      path: '/roleList',
      name: 'roleList',
      component: RoleList
    },
    {
      path: '/roleEdit/:id',
      name: 'roleEdit',
      component: RoleEdit,
      props: true
    },
    {
      path: '/roleAdd',
      name: 'roleAdd',
      component: RoleAdd,
      props: true
    },
    {
      path: '/roleView/:id',
      name: 'roleView',
      component: RoleView,
      props: true
    },
    {
      path: '/pendingView/:id',
      name: 'pendingView',
      component: PendingView,
      props: true
    },
    {
      path: '/pendingList',
      name: 'pendingList',
      component: PendingList,
      props: true
    },
    {
      path: '/reportList',
      name: 'reportList',
      component: ReportList,
      props: true
    },
    {
      path: '/requestList',
      name: 'requestList',
      component: RequestList
    },
    {
      path: '/requestAdd',
      name: 'requestAdd',
      component: RequestAdd,
    },
    {
      path: '/availabilityAdd',
      name: 'availabilityAdd',
      component: AvailabilityAdd
    },
    {
      path: '/calendar/:id',
      name: 'mainCalendar',
      component: MainCalendar,
      props: true
    },
    {
      path: '/tutorHome/:id',
      name: 'tutorHome',
      component: TutorHome,
      props: true
    },
    {
      path: '/tutorInfo',
      name: 'tutorInfo',
      component: TutorInfo
    },
    {
      path: '/tutorTopics',
      name: 'tutorTopics',
      component: TutorTopics
    },
    {
      path: '/studentHome/:id',
      name: 'studentHome',
      component: StudentHome,
      props: true
    },
    {
      path: '/studentInfo',
      name: 'studentInfo',
      component: StudentInfo
    },
    {
      path: '/adminHome/:id',
      name: 'adminHome',
      component: AdminHome,
      props: true
    },
    {
      path: '/adminDashboard/:id',
      name: 'adminDashboard',
      component: AdminDashboard,
      props: true
    },
    {
      path: '/adminInfo',
      name: 'adminInfo',
      component: AdminInfo
    },
    {
      path: '/studentAppointmentFeedback/:id/:userId',
      name: 'studentAppointmentFeedback',
      component: StudentAppointmentFeedback,
      props: true
    },
    {
      path: '/tutorAppointmentFeedback/:id/:userId',
      name: 'tutorAppointmentFeedback',
      component: TutorAppointmentFeedback,
      props: true
    },
    /*
    {
      path: '*',
      component: NotFoundComponent
    }
    */
  ]
})

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('user')
  if (authRequired && !loggedIn) {
    return next('/login')
  }
  next()
})


export default router;

