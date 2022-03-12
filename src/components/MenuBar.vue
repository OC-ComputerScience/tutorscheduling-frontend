<template>
    <div>
        <v-app-bar
            app
            color="primary"
            dark
        >
            <v-img
                class="mr-4"
                src="../assets/oc_logo_social.png"
                max-height="50"
                max-width="50"
                contain
            ></v-img>
            <v-toolbar-title class="title">
                <div>{{ this.title }}</div>    
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items
                v-for="item in activeMenus"
                :key="item.link"
            >
                <v-btn v-if="item.name !== 'logout'"
                    exact                    
                    :ref="item.link"
                    link
                    :to="{ name: item.name, params: { id: user.userId } }"
                    :color="item.color"
                    text
                >
                    {{ item.text }}
                </v-btn>
                <v-btn v-else
                    exact                    
                    @click="logout"
                    :color="item.color"
                    text
                >
                    {{ item.text }}
                </v-btn>
            </v-toolbar-items>
            <v-menu v-if="this.user != null" offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    color="accent"
                    dark
                    v-bind="attrs"
                    v-on="on"
                    class="mr-4 ml-4"
                    >
                    {{ selectedGroup }}
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                        v-for="group in groups"
                        :key="group"
                        @click="(selectedGroup = group); resetMenu()"
                    >
                        <v-list-item-title>{{ group }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-avatar v-if="this.user != null" color="secondary">
                    <span class="accent--text font-weight-bold" >{{ this.initials }}</span>
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
import AuthServices from '@/services/authServices.js'

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
            {
                link: 'tutorHome',
                name: 'tutorHome',
                color: 'white',
                text: 'Home',
                roles: 'Tutor'
            },
            {
                link: 'tutorInfo',
                name: 'tutorInfo',
                color: 'white',
                text: 'My Info',
                roles: 'Tutor'
            },
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
                link: 'mainCalendar',
                name: 'mainCalendar',
                color: 'white',
                text: 'Calendar',
                roles: 'HeadAdmin,Admin,Tutor,Student'
            },
            {
                link: 'availabilityAdd',
                name: 'availabilityAdd',
                color: 'white',
                text: 'Availability',
                roles: 'HeadAdmin,Admin,Tutor'
            },
            {
                link: 'logout',
                name: 'logout',
                color: 'white',
                text: 'Logout',
                roles: 'HeadAdmin,Admin,Tutor,Student'
            },
        ],
        groups: [],
        selectedGroup: '',
        selectedRoles: '',
        activeMenus: [],
    }),
    async created() {
        await this.setGroupsAndRoles()
        .then(() => {
            console.log(this.user);
            this.selectedGroup = this.groups[0];
            this.resetMenu();
        })
    },
    async computed() {
        await this.setGroupsAndRoles()
        .then(() => {
            console.log(this.user);
            this.selectedGroup = this.groups[0];
            this.resetMenu();
        })
    },
    methods: {
        menuAction(route) {
            this.$router.push({ name: route });
        },
        async setGroupsAndRoles() {
            this.user = Utils.getStore('user');
            if (this.user != null) {
                this.title = 'OC Tutoring';
                this.initials = this.user.fName[0] + this.user.lName[0];
                this.groups = [];
                this.user.access.forEach(element => {
                    this.groups.push(element.name);
                });
                for (let i = 0; i < this.user.access.length; i++) {
                    let group = this.user.access[i];
                    if (group.name.toString() === this.selectedGroup.toString()) {
                        this.selectedRoles = '';
                        console.log("in if statement")
                        for (let j = 0; j < group.roles.length; j++) {
                            this.selectedRoles += group.roles[j];
                            console.log(this.selectedRoles)
                        }
                    }
                }
            }
            else this.title = '';
        },
        async resetMenu() {
            await this.setGroupsAndRoles();
            if (this.user != null) {
                this.activeMenus = this.menus;
                this.activeMenus = this.menus.filter(menu =>
                    menu.roles.includes(this.selectedRoles),
                );
                console.log(this.selectedRoles);
                console.log(this.activeMenus);
            } 
            else {
                this.activeMenus = this.menus.filter(menu =>
                    menu.roles.includes('None'),
                );
            } 
            this.menuAction(this.activeMenus[0].name);
        },
        logout() {
            console.log("in logout function")
            AuthServices.logoutUser(this.user)
            .then(response => {
                console.log(response);
                Utils.removeItem('user')
                this.$router.push({ name: "login"})
            })
            .catch(error => {
                console.log('error', error);
            })
        }
    },
};
</script>