<template>
  <div class="signup-buttons">
    <v-row justify="center">
      <div display="flex" id="parent_id"></div>
    </v-row>

    <v-dialog v-model="dialog" persistent max-width="800">
      <v-card tile>
        <v-card-title>
          <span class="text-h5"
            >Hello, {{ this.user.fName }}! Finish setting up your account
            below:</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-text-field
                v-model="phoneNum"
                id="phoneNum"
                :counter="50"
                label="Mobile Phone Number"
                hint="123-456-7890"
                persistent-hint
                required
                v-on:keyup.enter="
                  dialog = false;
                  savePhoneNum();
                "
              ></v-text-field>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            @click="
              dialog = false;
              savePhoneNum();
            "
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog2" persistent max-width="800">
      <v-card tile>
        <v-card-title>
          <span class="text-h5"
            >Hello, {{ this.user.fName }}! Select below:</span
          >
        </v-card-title>
        <br />
        <v-card-text>
          <h2 class="black--text">Choose your role:</h2>
          <v-list>
            <v-list-item>
              <v-checkbox
                v-model="student"
                :label="`Student`"
                :rules="validateRoleCheckbox"
                @change="tutor = !student"
              ></v-checkbox>
            </v-list-item>
            <h4>
              Sign up for free tutoring that you will receive as a student.
            </h4>
            <v-list-item>
              <v-checkbox
                v-model="tutor"
                :label="`Tutor`"
                :rules="validateRoleCheckbox"
                @change="student = !tutor"
              ></v-checkbox>
            </v-list-item>
            <h4>
              Apply to be a tutor in one of our groups and provide quality
              tutoring.
            </h4>
          </v-list>
          <br /><br />
          <h2 class="black--text">Choose your organization(s):</h2>
          <v-list v-for="group in groups" :key="group.id">
            <v-list-item>
              <v-checkbox
                v-model="selected"
                :value="group"
                :label="group.name"
              ></v-checkbox>
            </v-list-item>
            <h4>{{ group.description }}</h4>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            :disabled="!allowGroupContinue"
            @click="savePersonRoles()"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AuthServices from "@/services/authServices";
import GroupServices from "@/services/groupServices";
import RoleServices from "@/services/roleServices";
import PersonServices from "@/services/personServices";
import PersonRoleServices from "@/services/personRoleServices";
import TwilioServices from "@/services/twilioServices";
import Utils from "@/config/utils.js";

export default {
  name: "login_signup_social",
  data() {
    return {
      value: false,
      dialog: false,
      dialog2: false,
      student: true,
      tutor: false,
      admin: false,
      model: false,
      groups: [],
      admins: [],
      phoneNum: "",
      person: {},
      roles: [],
      personroles: [],
      personrole: {},
      selected: [],
      checkedGroups: [],
      fName: "",
      lName: "",
      roleCounter: 0,
      user: {},
      googleUserData: {},
      token: "",
    };
  },
  created() {
    this.getGroups();
  },
  mounted() {
    this.loginWithGoogle();
  },
  computed: {
    validateRoleCheckbox() {
      return [this.student || this.tutor];
    },
    allowGroupContinue() {
      // only let the continue but be enabled if a group is selected
      return this.selected.length > 0;
    },
  },
  methods: {
    async loginWithGoogle() {
      global.handleCredentialResponse = this.handleCredentialResponse;
      const client = process.env.VUE_APP_CLIENT_ID;
      global.google.accounts.id.initialize({
        client_id: client,
        cancel_on_tap_outside: false,
        auto_select: true,
        callback: global.handleCredentialResponse,
      });
      global.google.accounts.id.renderButton(
        document.getElementById("parent_id"),
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signup_with",
          width: 400,
        }
      );
    },
    handleCredentialResponse(response) {
      let token = {
        credential: response.credential,
      };
      AuthServices.loginUser(token)
        .then((response) => {
          this.user = response.data;
          Utils.setStore("user", this.user);
          this.fName = this.user.fName;
          this.lName = this.user.lName;
          this.openDialogs();
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    async getPerson() {
      await PersonServices.getPerson(this.user.userID)
        .then((response) => {
          this.person = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
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
    getGroups() {
      GroupServices.getAllGroups()
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
    async getGroupRoles() {
      for (let i = 0; i < this.selected.length; i++) {
        await this.addGroupRoles(this.selected[i].id);
      }
    },
    async savePhoneNum() {
      // use this to also update name if it's the first time a student is logging in
      await this.getPerson().then(() => {
        this.person.phoneNum = this.phoneNum;
        this.person.fName = this.fName;
        this.person.lName = this.lName;
        // save phone number and name locally and to database
        this.user.phoneNum = this.phoneNum;
        this.user.fName = this.fName;
        this.user.lName = this.lName;
        Utils.setStore("user", this.user);
        PersonServices.updatePerson(this.person.id, this.person);
      });
      this.openDialogs();
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
      await this.getGroupRoles().then(() => {
        for (let i = 0; i < this.roles.length; i++) {
          const role = this.roles[i];
          if (
            (this.student && role.type.toLowerCase() === "student") ||
            (this.tutor && role.type.toLowerCase() === "tutor")
          ) {
            this.personrole = {
              status: "applied",
              agree: false,
              dateSigned: Date(),
              personId: this.user.userID,
              roleId: role.id,
            };
            PersonRoleServices.addPersonRole(this.personrole)
              .then(async (response) => {
                let status = response.data.status;
                // send notification to admins if new person role is a tutor
                if (
                  role.type.toLowerCase() === "tutor" &&
                  status === "applied"
                ) {
                  await this.getAdmins(role.groupId);

                  for (let i = 0; i < this.admins.length; i++) {
                    let tempA = this.admins[i];
                    console.log(tempA);
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
      });
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
              let role = item.type;
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
    openDialogs() {
      // if this person doesn't have any roles, do this
      if (
        this.user.phoneNum === "" ||
        this.user.phoneNum === undefined ||
        this.user.phoneNum === null
      ) {
        this.dialog = true;
      } else if (this.user.access.length === 0) {
        this.dialog2 = true;
      } else {
        this.goToPage();
      }
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
              this.$router.push({ name: "contract" });
            }
            // make a tutor sign up for topics if they haven't been approved yet
            else if (
              role.type.includes("Tutor") &&
              pRole.status.includes("applied")
            ) {
              this.$router.push({ name: "tutorTopics" });
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
            this.$router.go();
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
          console.log(response);
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
