import Vue from 'vue'
import Router from 'vue-router'

import Login from './views/Login.vue'

// Admin Views. Views are sorted into sections for this project, so check that the path is correct below.
import GroupList    from '@/views/AdminViews/GroupViews/GroupList.vue';
import GroupEdit    from '@/views/AdminViews/GroupViews/GroupEdit.vue';
import GroupAdd     from '@/views/AdminViews/GroupViews/GroupAdd.vue';
import GroupView    from '@/views/AdminViews/GroupViews/GroupView.vue';

Vue.use(Router)

const router =  new Router({
  mode: 'history',
  linkExactActiveClass: 'active',
  base:
    process.env.NODE_ENV === 'development'? "/" : "/tutoring-api/",
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
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
      path: '/groupView/:id',
      name: 'groupView',
      component: GroupView,
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
/*
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
*/

export default router;
