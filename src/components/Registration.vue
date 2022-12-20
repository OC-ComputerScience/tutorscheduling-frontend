<template>
  <div>
    <v-dialog
      v-if="this.user !== null"
      v-model="roleDialog"
      v-bind:persistent="!hasAnyRoles ? true : false"
      max-width="800">
      <v-card tile>
        <v-card-title>
          {{ this.user.fName }}, what best describes your situation right now?
        </v-card-title>
        <br />
        <v-card-text>
          <v-row align-center>
            <v-col class="d-flex justify-center align-center">
              <v-btn
                v-bind:color="
                  roleSelect == 'Student' ? 'primary' : 'grey lighten-2'
                "
                x-large
                @click="roleSelect = 'Student'">
                <v-icon class="mx-2">mdi-chair-school</v-icon> Student
              </v-btn>
            </v-col>
            <v-col class="d-flex justify-center align-center">
              <v-btn
                v-bind:color="
                  roleSelect == 'Tutor' ? 'primary' : 'grey lighten-2'
                "
                x-large
                @click="roleSelect = 'Tutor'">
                <v-icon class="mx-2">mdi-human-male-board-poll</v-icon> Tutor
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center align-center">
              I want tutoring in some of my classes.
            </v-col>
            <v-col class="d-flex justify-center align-center">
              I want to help provide quality tutoring to other students.
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            @click="
              roleDialog = false;
              groupDialog = true;
              haveRoleAlready();
            ">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-if="this.user !== null"
      v-model="groupDialog"
      v-bind:persistent="!hasAnyRoles ? true : false"
      max-width="1000">
      <v-card tile>
        <v-card-title>
          {{ this.user.fName }}, which group would you like to be a
          {{ this.roleSelect.toLowerCase() }} in?
        </v-card-title>
        <br />
        <v-card-text>
          <v-row>
            <v-col v-for="group in groups" :key="group.id">
              <v-card
                :disabled="group.haveRole"
                v-bind:color="
                  groupSelect === group.id ? 'primary' : 'grey lighten-2'
                "
                height="200"
                elevation="10"
                v-on="
                  !group.haveRole
                    ? { click: () => (groupSelect = group.id) }
                    : {}
                ">
                <v-card-title
                  v-bind:class="
                    groupSelect === group.id ? 'white--text' : 'black--text'
                  ">
                  {{ group.name }}
                </v-card-title>
                <v-card-text
                  v-bind:class="
                    groupSelect === group.id ? 'white--text' : 'black--text'
                  ">
                  {{ group.description }}
                  <v-overlay
                    :absolute="absolute"
                    :opacity="opacity"
                    :value="group.haveRole">
                    <h3>
                      {{ group.sentenceHaveRole }}
                    </h3>
                  </v-overlay>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="accent"
            text
            @click="
              roleDialog = true;
              groupDialog = false;
              groupSelect = '';
            ">
            Back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            :disabled="groupSelect === ''"
            @click="savePersonRoles()">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SelectGroupView v-if="openSelect"></SelectGroupView>
  </div>
</template>

<script>
import GroupServices from "@/services/groupServices";
import RoleServices from "@/services/roleServices";
import PersonRoleServices from "@/services/personRoleServices";
import TwilioServices from "@/services/twilioServices";
import Utils from "@/config/utils.js";
import SelectGroupView from "./SelectGroupView.vue";

export default {
  name: "Registration",
  components: {
    SelectGroupView,
  },
  data() {
    return {
      roleDialog: true,
      groupDialog: false,
      openSelect: false,
      absolute: true,
      opacity: 0.75,
      roleSelect: "Student",
      groupSelect: "",
      groups: [],
      admins: [],
      person: {},
      roles: [],
      personroles: [],
      personrole: {},
      roleCounter: 0,
      user: {},
      hasAnyRoles: false,
    };
  },
  async created() {
    await this.getGroups();
    this.user = Utils.getStore("user");
    this.hasAnyRoles = this.user.access.length > 0;
  },
  methods: {
    async haveRoleAlready() {
      let groups = [];
      this.user.access.forEach((element) => {
        groups.push(element.name);
      });
      for (let k = 0; k < this.groups.length; k++) {
        this.groups[k].haveRole = false;
        this.groups[k].sentenceHaveRole = "";
        if (this.hasAnyRoles) {
          for (let i = 0; i < groups.length; i++) {
            if (groups[i].includes(this.groups[k].name)) {
              let role = "";
              this.user.access[i].roles.forEach((element) => {
                role += element.type;
              });
              if (role.includes(this.roleSelect)) {
                this.groups[k].haveRole = true;
                this.groups[k].sentenceHaveRole = "You already have this role.";
              }
            }
          }
        }
      }
    },
    async getPersonRoles() {
      await RoleServices.getIncompleteRoleForPerson(this.user.userID)
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let role = response.data[i];
            this.personroles.push(role);
          }
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });

      // if the user doesn't have any incomplete roles, get normal roles
      if (this.personroles.length === 0) {
        await RoleServices.getRoleForPerson(this.user.userID)
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              let role = response.data[i];
              this.personroles.push(role);
            }
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });
      }
    },
    async getGroups() {
      await GroupServices.getAllGroups()
        .then((response) => {
          this.groups = response.data;
          this.groups.sort(function (a, b) {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async addGroupRoles(id) {
      await RoleServices.getAllForGroup(id)
        .then((response) => {
          response.data.forEach((data) => {
            this.roles.push(data);
          });
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async savePersonRoles() {
      await this.addGroupRoles(this.groupSelect);

      for (let i = 0; i < this.roles.length; i++) {
        const role = this.roles[i];
        if (role.type === this.roleSelect) {
          this.personrole = {
            status: "applied",
            agree: false,
            dateSigned: Date(),
            personId: this.user.userID,
            roleId: role.id,
          };
          await PersonRoleServices.addPersonRole(this.personrole)
            .then(async (response) => {
              let status = response.data.status;
              // send notification to admins if new person role is a tutor
              if (role.type.toLowerCase() === "tutor" && status === "applied") {
                await this.getAdmins(role.groupId);

                for (let i = 0; i < this.admins.length; i++) {
                  let tempA = this.admins[i];
                  if (
                    await this.checkPrivilege(
                      "Receive notifications for applications",
                      tempA.personroleprivilege
                    )
                  )
                    this.sendMessage(tempA, role.groupId);
                }
              }
            })
            .catch((error) => {
              this.message = error;
              console.log("There was an error:", error);
            });
        }
      }

      this.setAccess();
    },
    async setAccess() {
      // reset the access after a new role is added to a person
      await GroupServices.getGroupsForPerson(this.user.userID)
        .then((response) => {
          this.user.access = [];
          for (let i = 0; i < response.data.length; i++) {
            let element = response.data[i];
            let roles = [];
            for (let j = 0; j < element.role.length; j++) {
              let item = element.role[j];
              let role = {
                type: item.type,
                personRoleId: item.personrole[0].id,
              };
              roles.push(role);
            }
            let group = {
              name: element.name,
              roles: roles,
            };
            this.user.access.push(group);
          }
          // resave user in store
          Utils.setStore("user", this.user);
          this.goToPage();
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async goToPage() {
      await this.getPersonRoles().then(() => {
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            if (role.type.includes("Admin")) {
              this.$router.push({
                name: "adminHome",
                params: { id: pRole.id },
              });
            } else if (
              (role.type.includes("Student") &&
                !pRole.status.includes("approved") &&
                !pRole.agree) ||
              (role.type.includes("Tutor") && !pRole.agree)
            ) {
              this.$router.push({ name: "contract", params: { id: pRole.id } });
            }
            // make a tutor sign up for topics if they haven't been approved yet
            else if (
              role.type.includes("Tutor") &&
              pRole.status.includes("applied")
            ) {
              this.$router.push({ name: "tutorAddTopics" });
            } else if (
              role.type.includes("Student") &&
              pRole.status.includes("approved")
            ) {
              this.$router.push({
                name: "studentHome",
                params: { id: pRole.id },
              });
            } else if (
              role.type.includes("Tutor") &&
              pRole.status.includes("approved") &&
              pRole.agree
            ) {
              this.$router.push({
                name: "tutorHome",
                params: { id: pRole.id },
              });
            }
            break;
          }
        }
      });
    },
    async checkPrivilege(privilege, personroleprivileges) {
      let hasPriv = false;
      for (let i = 0; i < personroleprivileges.length; i++) {
        let priv = personroleprivileges[i];
        if (priv.privilege === privilege) hasPriv = true;
      }
      return hasPriv;
    },
    async getAdmins(groupId) {
      await RoleServices.getAllForGroupByType(groupId, "Admin")
        .then((response) => {
          this.admins = response.data[0].personrole;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    sendMessage(admin, groupId) {
      let temp = {
        phoneNum: admin.person.phoneNum,
        message: "",
      };

      temp.message =
        "You have a new tutor application from " +
        this.user.fName +
        " " +
        this.user.lName +
        " for " +
        this.groups.find((group) => group.id == groupId).name +
        ".\nPlease view this application at http://tutorscheduling.oc.edu/";

      TwilioServices.sendMessage(temp);
    },
  },
};
</script>
