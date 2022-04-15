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
                <v-btn
                    exact                    
                    :ref="item.link"
                    link
                    :to="{ name: item.name, params: { id: currentPersonRoleID } }"
                    :color="item.color"
                    text
                >
                    {{ item.text }}
                </v-btn>
            </v-toolbar-items>
            <v-menu v-if="this.user != null && selectedGroup != ''" offset-y>
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
            <v-menu
                bottom
                min-width="200px"
                rounded
                offset-y
                v-if="user != null"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        x-large
                        v-on="on"
                        v-bind="attrs"
                    >
                        <v-avatar 
                            v-if="user != null"
                            color="secondary"
                        >
                            <span class="accent--text font-weight-bold">{{ initials }}</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-card>
                    <v-list-item-content class="justify-center">
                        <div class="mx-auto text-center">
                            <v-avatar
                                color="secondary"
                                class="mt-2 mb-2"
                            >
                                <span class="accent--text font-weight-bold">{{ initials }}</span>
                            </v-avatar>
                            <h3>{{ name }}</h3>
                            <p class="text-caption mt-1">
                                {{ user.email }}
                            </p>
                            <v-divider class="my-3"></v-divider>
                            <v-btn
                                depressed
                                rounded
                                text
                                @click="goToRightInfo()"
                            >
                                Edit Account
                            </v-btn>
                            <v-divider class="my-3" v-if="!selectedRoles.includes('Admin')"></v-divider>
                            <v-btn
                                depressed
                                rounded
                                text
                                :to="{ name: 'apply' }"
                                v-if="!selectedRoles.includes('Admin')"
                            >
                                Apply
                            </v-btn>
                            <v-divider class="my-3" v-if="!selectedRoles.includes('Admin')"></v-divider>
                            <v-btn
                                depressed
                                rounded
                                text
                                :to="{ name: 'help' }"
                                v-if="!selectedRoles.includes('Admin')"
                            >
                                Help
                            </v-btn>
                            <v-divider class="my-3"></v-divider>
                            <v-btn
                                depressed
                                rounded
                                text
                                @click="logout()"
                            >
                                Logout
                            </v-btn>
                        </div>
                    </v-list-item-content>
                </v-card>
            </v-menu>
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
import GroupServices from '@/services/groupServices.js'

export default {
    name: 'App',
    data: () => ({
        user: {},
        title: '',
        initials: '',
        name: '',
        roles: [],
        groups: [],
        incompleteGroups: [],
        hasTopics: true,
        selectedGroup: '',
        selectedRoles: '',
        activeMenus: [],
        currentPersonRoleID: 0,
        menus: [
            {
                link: 'tutorHome',
                name: 'tutorHome',
                color: 'white',
                text: 'Home',
                icon: 'mdi-home',
                roles: 'Tutor'
            },
            {
                link: 'studentHome',
                name: 'studentHome',
                color: 'white',
                text: 'Home',
                icon: 'mdi-home',
                roles: 'Student'
            },
            {
                link: 'adminHome',
                name: 'adminHome',
                color: 'white',
                text: 'Home',
                icon: 'mdi-home',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'mainCalendar',
                name: 'mainCalendar',
                color: 'white',
                text: 'Calendar',
                icon: 'mdi-calendar',
                roles: 'HeadAdmin,Admin,Supervisor,Tutor,Student'
            },
            {
                link: 'requestList',
                name: 'requestList',
                color: 'white',
                text: 'Requests',
                icon: 'mdi-alert',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'personList',
                name: 'personList',
                color: 'white',
                text: 'People',
                icon: 'mdi-account-multiple',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'pendingList',
                name: 'pendingList',
                color: 'white',
                text: 'Applications',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'topicList',
                name: 'topicList',
                color: 'white',
                text: 'Topics',
                icon: 'mdi-bookshelf',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'roleList',
                name: 'roleList',
                color: 'white',
                text: 'Roles',
                icon: 'mdi-folder-account',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'locationList',
                name: 'locationList',
                color: 'white',
                text: 'Locations',
                icon: 'mdi-map-marker',
                roles: 'HeadAdmin,Admin,Supervisor'
            },
            {
                link: 'groupList',
                name: 'groupList',
                color: 'white',
                text: 'Groups',
                roles: 'HeadAdmin'
            },
            {
                link: 'availabilityAdd',
                name: 'availabilityAdd',
                color: 'white',
                text: 'Availability',
                roles: 'Tutor'
            },
            {
                link: 'requestAdd',
                name: 'requestAdd',
                color: 'white',
                text: 'Request',
                roles: 'Student'
            },
        ],
    }),
    async created() {
        await this.resetMenu();
    },
    async mounted() {
        await this.resetMenu();
    },
    methods: {
        menuAction(route) {
            console.log(this.currentPersonRoleID);
            this.$router.push({ name: route, params: { id: this.currentPersonRoleID }  });
        },
        async setGroupsAndRoles() {
            this.user = Utils.getStore('user');
            if (this.user != null) {
                this.title = 'OC Tutoring';
                //console.log(this.initials)
                this.initials = this.user.fName[0] + this.user.lName[0];
                //console.log(this.initials)
                this.name = this.user.fName + ' ' + this.user.lName;
                this.groups = [];
                this.user.access.forEach(element => {
                    this.groups.push(element.name);
                });
                for (let i = 0; i < this.user.access.length; i++) {
                    let group = this.user.access[i];
                    if (group.name.toString() === this.selectedGroup.toString()) {
                        // save selected group
                        this.user.selectedGroup = group.name;
                        Utils.setStore("user", this.user);
                        //console.log(this.user)
                        this.selectedRoles = '';
                        for (let j = 0; j < group.roles.length; j++) {
                            this.selectedRoles += group.roles[j];
                            //console.log(this.user.access)
                        }
                        await this.getPersonRoles();
                    }
                }
            }
            else this.title = '';
        },
        async resetMenu() {
            this.user = Utils.getStore('user');
            if (this.user !== null) {
                await this.getIncompletePersonRoles()
                .then(async () => {
                    if(this.incompleteGroups.length === 0) {
                        await this.getIncompleteTopics()
                        .then(async () => {
                            if (this.hasTopics) {
                                await this.setGroupsAndRoles()
                                .then(() => {
                                    
                                    if (this.selectedGroup === '' && this.user.selectedGroup === undefined)
                                        this.selectedGroup = this.groups[0];
                                    else if (this.selectedGroup === '')
                                        this.selectedGroup = this.user.selectedGroup;
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
                                })
                            }
                            else {
                                if (this.user != null) {
                                    this.title = 'OC Tutoring';
                                    //console.log(this.initials)
                                    this.initials = this.user.fName[0] + this.user.lName[0];
                                    //console.log(this.initials)
                                    this.name = this.user.fName + ' ' + this.user.lName;
                                }
                                this.$router.push({ name: "tutorTopics" });
                            }
                        })
                    }
                    else if(this.incompleteGroups.length !== 0) {
                        if (this.user != null) {
                            this.title = 'OC Tutoring';
                            //console.log(this.initials)
                            this.initials = this.user.fName[0] + this.user.lName[0];
                            //console.log(this.initials)
                            this.name = this.user.fName + ' ' + this.user.lName;
                        }
                        this.$router.push({ name: "contract" });
                    }
                })
            }
        },
        async getIncompletePersonRoles() {
            await GroupServices.getIncompleteGroupsForPerson(this.user.userID)
            .then((response) => {
                this.incompleteGroups = [];
                console.log(response)
                for (let i = 0; i < response.data.length; i++) {
                    let group = response.data[i];
                    console.log(group);
                    this.incompleteGroups.push(group);
                }
            })
            .catch((error) => {
                console.log("There was an error:", error.response);
            });
        },
        async getIncompleteTopics() {
            await GroupServices.getGroupTopicsForTutor(this.user.userID)
            .then(response => {
                this.hasTopics = true;
                //console.log(response)
                for (let i = 0; i < response.data.length && this.hasTopics; i++) {
                    let group = response.data[i];
                    console.log(group.topic)
                    if (group.topic.length === 0) {
                        this.hasTopics = false;
                    }
                }
            })
            .catch(error => {
                console.log("There was an error:", error.response)
            });
        },
        async getPersonRoles() {
            await GroupServices.getGroupsForPerson(this.user.userID)
            .then((response) => {
                for (let i = 0; i < response.data.length; i++) {
                    let group = response.data[i];
                    if (this.selectedGroup.includes(group.name)) {
                        for (let j = 0; j < group.role.length; j++) {
                            let role = group.role[j];
                            if(this.selectedRoles.includes(role.type)) {
                                this.currentPersonRoleID = role.personrole[0].id;
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                console.log("There was an error:", error.response);
            });
        },
        goToRightInfo() {
            if (this.selectedRoles.includes("Student"))
                this.$router.push({ name: "studentInfo"});
            else if (this.selectedRoles.includes("Tutor"))
                this.$router.push({ name: "tutorInfo"});
            else if (this.selectedRoles.includes("Admin"))
                this.$router.push({ name: "adminInfo"});
        },
        logout() {
            console.log("in logout function")
            AuthServices.logoutUser(this.user)
            .then(response => {
                console.log(response);
                Utils.removeItem('user')
                this.$router.go();
                this.$router.push({ name: "login"})
            })
            .catch(error => {
                console.log('error', error);
            })
        }
    },
};
</script>