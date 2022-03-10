<template>
    <div>
        <v-app-bar
            app
            color="primary"
            dark
        >
            <v-toolbar-title class="title">
                <div>{{ this.title }}</div>    
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn
                    v-for="item in activeMenus"
                    exact
                    :key="item.link"
                    :ref="item.link"
                    link
                    :to="{ name: item.name, params: { id: user.userId } }"
                    :color="item.color"
                    text
                    >{{ item.text }}</v-btn
                >
            </v-toolbar-items>
            <v-spacer></v-spacer>
            <v-avatar class="this.user !== null" color="secondary">
                    <span class="primary--text">{{ this.initials }}</span>
                </v-avatar>
        </v-app-bar>

        <!-- <v-app-bar dark color="#811429" class="hidden-lg-and-up">
            <v-img
                class="mx-2"
                max-height="40"
                max-width="40"
                contain
            ></v-img>
            <v-toolbar-title ref="toolbar-title">{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-app-bar-nav-icon
                dark
                @click="drawer = !drawer"
            ></v-app-bar-nav-icon>
        </v-app-bar>
        <v-list>
                <v-list-item
                    exact
                    v-for="menu in activeMenus"
                    :to="{ name: menu.name, params: { id: user.userId } }"
                    :color="menu.color"
                    :key="menu.text"
                >
                    <v-list-item-action>
                        <v-icon v-if="menu.icon">{{ menu.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ menu.text }} </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list> -->
    </div>
</template>

<script>
import Utils from '@/config/utils.js';
export default {
    name: 'App',
    data: () => ({
        user: {},
        title: '',
        initials: '',
        menus: [
            {
                link: 'login',
                name: 'login',
                color: 'white',
                text: 'Login',
                roles: 'None'
            },
            // {
            //     link: 'logout',
            //     name: 'logout',
            //     color: 'white',
            //     text: 'Logout',
            //     roles: 'HeadAdmin,Admin,Tutor,Student'
            // },
            {
                link: 'groupList',
                name: 'groupList',
                color: 'white',
                text: 'Groups',
                roles: 'HeadAdmin,Admin'
            },
            {
                link: 'personList',
                name: 'personList',
                color: 'white',
                text: 'People',
                roles: 'HeadAdmin,Admin'
            },
            {
                link: 'topicList',
                name: 'topicList',
                color: 'white',
                text: 'Topics',
                roles: 'HeadAdmin,Admin'
            },
            {
                link: 'locationList',
                name: 'locationList',
                color: 'white',
                text: 'Locations',
                roles: 'HeadAdmin,Admin'
            },
            {
                link: 'roleList',
                name: 'roleList',
                color: 'white',
                text: 'Roles',
                roles: 'HeadAdmin,Admin'
            },
            {
                link: 'availabilityAdd',
                name: 'availabilityAdd',
                color: 'white',
                text: 'Availability',
                roles: 'HeadAdmin,Admin,Tutor'
            },
            {
                link: 'mainCalendar',
                name: 'mainCalendar',
                color: 'white',
                text: 'Calendar',
                roles: 'HeadAdmin,Admin,Tutor,Student'
            },
            {
                link: 'tutorHome',
                name: 'tutorHome',
                color: 'white',
                text: 'Home',
                roles: 'Tutor'
            },
        ],
        activeMenus: [],
    }),
    created() {
        this.user = Utils.getStore('user');
        if (this.user != null) {
            this.title = 'OC Tutoring';
            this.initials = this.user.fName[0] + this.user.lName[0];
        }
        else this.title = 'no user logged in';
        console.log(this.user);
        if (this.user != null) {
            this.activeMenus = this.menus;
            // this.activeMenus = this.menus.filter(menu =>
            //     menu.roles.includes(this.user.roles),
            // );
        } else {
            this.activeMenus = this.menus.filter(menu =>
                menu.roles.includes('None'),
            );
        }
    },
    methods: {
        menuAction(route) {
            this.$router.push({ name: route });
        },
    },
};
</script>