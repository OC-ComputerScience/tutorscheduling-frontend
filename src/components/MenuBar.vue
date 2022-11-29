<template>
  <div>
    <v-app-bar app color="primary" dark>
      <router-link :to="_link">
        <v-img
          class="mr-4"
          src="../assets/oc_logo_social.png"
          max-height="50"
          max-width="50"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title class="title">
        <div>{{ this.title }}</div>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items
        v-for="item in activeMenus"
        :key="item.link"
        class="hidden-md-and-down"
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
      <v-menu
        v-if="
          user != null &&
          selectedGroup != '' &&
          currentPersonRoleID !== 0 &&
          selectedRole !== '' &&
          selectedRole !== undefined &&
          selectedRole !== null
        "
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="accent" dark v-bind="attrs" v-on="on" class="mr-4 ml-4">
            {{ selectedGroup }}
          </v-btn>
        </template>
        <v-list>
          <!--<v-list-item
                        v-for="group in groups"
                        :key="group"
                        @click="(selectedGroup = group); resetMenu()"
                    >
                        <v-list-item-title>{{ group }}</v-list-item-title>
                    </v-list-item> -->
          <v-list-group
            v-for="(group, i) in user.access"
            :key="i"
            no-action
            sub-group
            @click.stop.prevent
          >
            <template v-slot:activator>
              <v-list-item-title v-text="group.name"></v-list-item-title>
            </template>

            <v-list-item
              v-for="(role, j) in group.roles"
              :key="j"
              @click="
                selectedRole = role;
                selectedGroup = group.name;
                resetMenu();
              "
            >
              <v-list-item-content>
                <v-list-item-title v-text="role"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-menu>
      <v-menu
        bottom
        min-width="200px"
        rounded
        offset-y
        v-if="
          user != null &&
          currentPersonRoleID !== 0 &&
          selectedRole !== '' &&
          selectedRole !== undefined &&
          selectedRole !== null
        "
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon x-large v-on="on" v-bind="attrs">
            <v-avatar
              v-if="
                user != null &&
                currentPersonRoleID !== 0 &&
                selectedRole !== '' &&
                selectedRole !== undefined &&
                selectedRole !== null
              "
              color="secondary"
            >
              <span class="accent--text font-weight-bold">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <v-avatar color="secondary" class="mt-2 mb-2">
                <span class="accent--text font-weight-bold">{{
                  initials
                }}</span>
              </v-avatar>
              <h3>{{ name }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="goToRightInfo()">
                Edit Account
              </v-btn>
              <v-divider
                class="my-3"
                v-if="!selectedRole.includes('Admin')"
              ></v-divider>
              <v-btn
                depressed
                rounded
                text
                :to="{ name: 'apply' }"
                v-if="!selectedRole.includes('Admin')"
              >
                Apply
              </v-btn>
              <v-divider
                class="my-3"
                v-if="!selectedRole.includes('Admin')"
              ></v-divider>
              <v-btn
                depressed
                rounded
                text
                :to="{ name: 'help', params: { id: currentPersonRoleID } }"
                v-if="!selectedRole.includes('Admin')"
              >
                Help
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="logout()"> Logout </v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
      <v-app-bar-nav-icon
        v-if="
          user !== null &&
          currentPersonRoleID !== 0 &&
          selectedRole !== '' &&
          selectedRole !== undefined &&
          selectedRole !== null
        "
        dark
        class="hidden-lg-and-up"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer
      v-if="
        drawer &&
        user !== null &&
        currentPersonRoleID !== 0 &&
        selectedRole !== '' &&
        selectedRole !== undefined &&
        selectedRole !== null
      "
      class="hidden-lg-and-up"
      v-model="drawer"
      app
      right
      :mini-variant.sync="$vuetify.breakpoint.smAndDown"
      color="primary"
    >
      <v-list>
        <v-list-item
          exact
          v-for="item in activeMenus"
          :to="{ name: item.name, params: { id: currentPersonRoleID } }"
          :color="item.color"
          :key="item.text"
        >
          <v-list-item-action>
            <v-icon color="white" v-if="item.icon">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="white--text"
              >{{ item.text }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import AuthServices from "@/services/authServices.js";
import GroupServices from "@/services/groupServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

export default {
  name: "App",
  data: () => ({
    user: {},
    drawer: false,
    title: "OC Tutoring",
    initials: "",
    name: "",
    roles: [],
    groups: [],
    incompleteGroups: [],
    hasTopics: true,
    selectedGroup: "",
    selectedRole: "",
    activeMenus: [],
    currentPersonRoleID: 0,
    menus: [
      {
        link: "adminHome",
        name: "adminHome",
        color: "white",
        text: "Home",
        icon: "mdi-home",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "tutorHome",
        name: "tutorHome",
        color: "white",
        text: "Home",
        icon: "mdi-home",
        roles: "Tutor",
      },
      {
        link: "studentHome",
        name: "studentHome",
        color: "white",
        text: "Home",
        icon: "mdi-home",
        roles: "Student",
      },
      {
        link: "mainCalendar",
        name: "mainCalendar",
        color: "white",
        text: "Calendar",
        icon: "mdi-calendar",
        roles: "HeadAdmin,Admin,Supervisor,Tutor,Student",
      },
      {
        link: "requestList",
        name: "requestList",
        color: "white",
        text: "Requests",
        icon: "mdi-alert",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "personList",
        name: "personList",
        color: "white",
        text: "People",
        icon: "mdi-account-multiple",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "pendingList",
        name: "pendingList",
        color: "white",
        text: "Applications",
        icon: "mdi-text-account",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "topicList",
        name: "topicList",
        color: "white",
        text: "Topics",
        icon: "mdi-bookshelf",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "roleList",
        name: "roleList",
        color: "white",
        text: "Roles",
        icon: "mdi-folder-account",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "locationList",
        name: "locationList",
        color: "white",
        text: "Locations",
        icon: "mdi-map-marker",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "reportList",
        name: "reportList",
        color: "white",
        text: "Reports",
        icon: "mdi-chart-line",
        roles: "HeadAdmin,Admin,Supervisor",
      },
      {
        link: "groupList",
        name: "groupList",
        color: "white",
        text: "Groups",
        roles: "Headdmin",
      },
      {
        link: "availabilityAdd",
        name: "availabilityAdd",
        color: "white",
        text: "Availability",
        icon: "mdi-clipboard-text-clock",
        roles: "Tutor",
      },
      {
        link: "requestAdd",
        name: "requestAdd",
        color: "white",
        text: "Request",
        icon: "mdi-alert",
        roles: "Student",
      },
    ],
  }),
  async created() {
    // ensures that their name gets set properly from store
    this.user = Utils.getStore("user");
    if (this.user != null) {
      this.title = "OC Tutoring";
      this.initials = this.user.fName[0] + this.user.lName[0];
      this.name = this.user.fName + " " + this.user.lName;
    }
  },
  async mounted() {
    await this.resetMenu();
  },
  computed: {
    _link() {
      return (
        "/" +
        this.selectedRole.toLowerCase() +
        "Home/" +
        this.currentPersonRoleID
      );
    },
  },
  methods: {
    menuAction(route) {
      if (
        this.currentPersonRoleID === 0 &&
        (this.selectedRole === "" ||
          this.selectedRole === undefined ||
          this.selectedRole === null)
      ) {
        this.$router.push({ name: "login" });
      } else
        this.$router.push({
          name: route,
          params: { id: this.currentPersonRoleID },
        });
    },
    async setGroupsAndRoles() {
      this.user = Utils.getStore("user");
      if (this.user != null) {
        this.title = "OC Tutoring";
        this.initials = this.user.fName[0] + this.user.lName[0];
        this.name = this.user.fName + " " + this.user.lName;
        this.groups = [];
        this.user.access.forEach((element) => {
          this.groups.push(element.name);
        });
        for (let i = 0; i < this.user.access.length; i++) {
          if (
            this.selectedGroup === "" ||
            this.selectedGroup === undefined ||
            this.selectedGroup === null
          ) {
            this.selectedGroup = this.user.access[0].name;
            this.user.selectedGroup = this.selectedGroup;
            Utils.setStore("user", this.user);
          } else {
            this.user.selectedGroup = this.selectedGroup;
            Utils.setStore("user", this.user);
          }
          if (
            this.selectedRole === "" ||
            this.selectedRole === undefined ||
            this.selectedRole === null
          ) {
            this.selectedRole = this.user.access[0].roles[0].type;
          }
          this.user.selectedRole = this.selectedRole;
          Utils.setStore("user", this.user);
          await this.getPersonRoles();
        }
      } else this.title = "";
    },
    async resetMenu() {
      this.user = Utils.getStore("user");
      if (this.user !== null) {
        await this.getIncompletePersonRoles()
          .then(async () => {
            if (this.incompleteGroups.length === 0) {
              await this.getIncompleteTopics().then(async () => {
                if (this.hasTopics) {
                  await this.setGroupsAndRoles().then(() => {
                    if (
                      this.selectedGroup === "" &&
                      this.user.selectedGroup === undefined
                    ) {
                      this.selectedGroup = this.groups[0];
                      this.user.selectedGroup = this.selectedGroup;
                      Utils.setStore("user", this.user);
                    } else if (this.selectedGroup === "")
                      this.selectedGroup = this.user.selectedGroup;

                    if (
                      this.user != null &&
                      this.currentPersonRoleID !== 0 &&
                      this.selectedRole !== "" &&
                      this.selectedRole !== undefined &&
                      this.selectedRole !== null
                    ) {
                      this.activeMenus = this.menus;
                      this.activeMenus = this.menus.filter((menu) =>
                        menu.roles.includes(this.selectedRole)
                      );
                      if (this.selectedRole.includes("Student"))
                        this.limitStudentMenu();
                      else if (this.selectedRole.includes("Tutor"))
                        this.limitTutorMenu();
                      else if (this.selectedRole.includes("Admin"))
                        this.limitAdminMenu();
                    } else {
                      this.activeMenus = this.menus.filter((menu) =>
                        menu.roles.includes("None")
                      );
                    }
                    this.menuAction(this.activeMenus[0].name);
                  });
                } else {
                  if (this.user != null) {
                    this.title = "OC Tutoring";
                    this.initials = this.user.fName[0] + this.user.lName[0];
                    this.name = this.user.fName + " " + this.user.lName;
                  }
                  this.$router.push({ name: "tutorTopics" });
                }
              });
            } else if (this.incompleteGroups.length !== 0) {
              if (this.user != null) {
                this.title = "OC Tutoring";
                this.initials = this.user.fName[0] + this.user.lName[0];
                this.name = this.user.fName + " " + this.user.lName;
              }
              this.$router.push({ name: "contract" });
            }
          })
          .catch((error) => {
            if (error == 401) {
              console.log("Not authorized");
              this.logout();
              this.$router.push({ name: "login" });
            }
          });
      }
    },
    async getIncompletePersonRoles() {
      await GroupServices.getIncompleteGroupsForPerson(this.user.userID)
        .then((response) => {
          this.incompleteGroups = [];
          for (let i = 0; i < response.data.length; i++) {
            let group = response.data[i];
            this.incompleteGroups.push(group);
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            console.log("error: " + error.response.status);
            this.logout();
            this.$router.push({ name: "login" });
            throw 401;
          }
          console.log("There was an real error:", error.response.status);
        });
    },
    async getIncompleteTopics() {
      await GroupServices.getGroupTopicsForTutor(this.user.userID)
        .then((response) => {
          this.hasTopics = true;
          for (let i = 0; i < response.data.length && this.hasTopics; i++) {
            let group = response.data[i];
            if (group.topic.length === 0) {
              this.hasTopics = false;
            }
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            console.log("error: " + error.response.status);
            this.logout();
            this.$router.push({ name: "login" });
            throw 401;
          }
          console.log("There was an error:", error.response);
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
                if (this.selectedRole.includes(role.type)) {
                  this.currentPersonRoleID = role.personrole[0].id;
                }
              }
            }
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            console.log("error: " + error.response.status);
            this.logout();
            this.$router.push({ name: "login" });
            throw 401;
          }
          console.log("There was an error:", error.response);
        });
    },
    goToRightInfo() {
      if (this.selectedRole.includes("Student"))
        this.$router.push({ name: "studentInfo" });
      else if (this.selectedRole.includes("Tutor"))
        this.$router.push({ name: "tutorInfo" });
      else if (this.selectedRole.includes("Admin"))
        this.$router.push({ name: "adminInfo" });
    },
    logout() {
      AuthServices.logoutUser(this.user)
        .then((response) => {
          console.log(response);
          Utils.removeItem("user");
          this.$router.go();
          this.$router.push({ name: "login" });
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    async limitTutorMenu() {
      if (
        this.selectedRole.includes("tutor") ||
        this.selectedRole.includes("Tutor")
      ) {
        let approved = false;
        await PersonRoleServices.getPersonRole(this.currentPersonRoleID)
          .then((response) => {
            if (
              response.data.status.includes("approved") ||
              response.data.status.includes("Approved")
            ) {
              approved = true;
            }
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });

        if (!approved) {
          // makes only tutor home page show up on menu bar
          this.activeMenus = this.activeMenus.filter((menu) =>
            menu.name.includes("tutorHome")
          );
        }
      }
    },
    async limitStudentMenu() {
      if (
        this.selectedRole.includes("student") ||
        this.selectedRole.includes("Student")
      ) {
        let approved = false;
        await PersonRoleServices.getPersonRole(this.currentPersonRoleID)
          .then((response) => {
            if (
              response.data.status.includes("approved") ||
              response.data.status.includes("Approved")
            ) {
              approved = true;
            }
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });

        if (!approved) {
          // makes only student home page show up on menu bar
          this.activeMenus = this.activeMenus.filter((menu) =>
            menu.name.includes("studentHome")
          );
        }
      }
    },
    async limitAdminMenu() {
      if (
        this.selectedRole.includes("admin") ||
        this.selectedRole.includes("Admin")
      ) {
        let approved = false;
        await PersonRoleServices.getPersonRole(this.currentPersonRoleID)
          .then((response) => {
            if (
              response.data.status.includes("approved") ||
              response.data.status.includes("Approved")
            ) {
              approved = true;
            }
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });

        if (!approved) {
          // makes only admin home page show up on menu bar
          this.activeMenus = this.activeMenus.filter((menu) =>
            menu.name.includes("adminDashboard")
          );
        }
      }
    },
  },
};
</script>
