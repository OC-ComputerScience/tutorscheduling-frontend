<template>
    <div class="signup-buttons">
      <v-row justify="center">
        <div display="flex" id="parent_id"></div>
      </v-row>
      
      <v-dialog
        v-model="dialog"
        persistent
        max-width="800"
      >
        <v-card tile>
          <v-card-title>
            <span class="text-h5">Hello, {{this.user.fName}}! Finish setting up your account below:</span>
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
                  v-on:keyup.enter="dialog = false; savePhoneNum()"
                ></v-text-field>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              text
              @click="dialog = false; savePhoneNum()"
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="dialog2"
        persistent
        max-width="600px"
      >
        <v-card tile>
          <v-card-title>
            <span class="text-h5">Hello, {{this.user.fName}}! Select below:</span>
          </v-card-title>
          <v-container>
            <v-subheader>Choose your action:</v-subheader>
            <v-list>
              <v-list-item>
                <v-checkbox
                  v-model="student"
                  :label="`Sign up for tutoring`"
                  :rules="validateRoleCheckbox"
                  @change="tutor=!student"
                ></v-checkbox>
              </v-list-item>
              <v-list-item>
                <v-checkbox
                  v-model="tutor"
                  :label="`Apply to be a tutor`"
                  :rules="validateRoleCheckbox"
                  @change="student=!tutor"
                ></v-checkbox>
              </v-list-item>
            </v-list>
          </v-container>
          <v-container>
            <v-subheader>Choose your organization(s):</v-subheader>
            <v-list>
              <v-list-item
                v-for="(group) in groups"
                :key="group.id"
              >
                <v-checkbox
                  v-model="selected"
                  :value="group"
                  :label="group.name"
                  
                ></v-checkbox>
              </v-list-item>
            </v-list>
          </v-container>
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
import AuthServices from '@/services/authServices'
import GroupServices from '@/services/groupServices'
import RoleServices from '@/services/roleServices'
import PersonServices from '@/services/personServices'
import PersonRoleServices from '@/services/personRoleServices'
import Utils from '@/config/utils.js'

export default {
  name: 'login_signup_social',
  data () {
    return {
      value: false,
      dialog: false,
      dialog2: false,
      student: true,
      tutor: false, 
      admin: false,
      model: false,
      groups: [],
      phoneNum: '',
      person: {},
      roles: [],
      personroles: [],
      personrole: {},
      selected: [],
      checkedGroups: [],
      fName: '',
      lName: '',
      roleCounter: 0,
      user: {},
      googleUserData: {},
      token: ""
    }
  },
  created () {
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
      return this.selected.length > 0
    }
  },
  methods: {
    async loginWithGoogle() {
      global.handleCredentialResponse = this.handleCredentialResponse;
      const client = process.env.VUE_APP_CLIENT_ID;
      global.google.accounts.id.initialize({
        client_id: client,
        cancel_on_tap_outside: false,
        auto_select: true,
        callback: global.handleCredentialResponse
      });
      global.google.accounts.id.renderButton(
        document.getElementById("parent_id"),
        { 
          type: "standard",
          theme: "outline", 
          size: "large",
          text: "signup_with",
          width: 400
        }
      )
    },
    handleCredentialResponse(response) {
      let token = { 
        credential : response.credential
      };
      AuthServices.loginUser(token)
      .then(response => {
        this.user = response.data;
        Utils.setStore("user", this.user);
        this.fName = this.user.fName;
        this.lName = this.user.lName;
        this.openDialogs();
      })
      .catch(error => {
        console.log('error', error);
      })
    },
    async getPerson() {
      await PersonServices.getPerson(this.user.userID)
        .then(response => {
          this.person = response.data;
        })
        .catch(error => {
          console.log("There was an error:", error.response)
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
        if(this.personroles.length === 0) {
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
        .then(response => {
          this.groups = response.data;
        })
        .catch(error => {
          console.log("There was an error:", error.response)
        });
    },
    async getGroupRoles() {
      for (let i = 0; i < this.selected.length; i++) {
        await this.addGroupRoles(this.selected[i].id);
      }
    },
    async savePhoneNum() {
      // use this to also update name if it's the first time a student is logging in
      await this.getPerson()
      .then(() => {
        this.person.phoneNum = this.phoneNum;
        this.person.fName = this.fName;
        this.person.lName = this.lName;
        // save phone number and name locally and to database
        this.user.phoneNum = this.phoneNum;
        this.user.fName = this.fName;
        this.user.lName = this.lName;
        Utils.setStore("user", this.user);
        PersonServices.updatePerson(this.person.id, this.person);
      })
      this.openDialogs();
    },
    async addGroupRoles(id) {
      await RoleServices.getAllForGroup(id)
      .then(response => {
        response.data.forEach(data => {
          this.roles.push(data);
        })
      })
      .catch(error => {
        console.log("There was an error:", error.response)
      });
    },
    async savePersonRoles() {
      await this.getGroupRoles()
      .then(() => {
        for (let i = 0; i < this.roles.length; i++) {
          const role = this.roles[i];
          if((this.student && role.type.toLowerCase() === 'student') ||
              (this.tutor && role.type.toLowerCase() === 'tutor')) {
              this.personrole = {
                status: "applied",
                agree: false,
                dateSigned: Date(),
                personId: this.user.userID,
                roleId: role.id 
              };
            PersonRoleServices.addPersonRole(this.personrole);
          }
        }
      })
      this.setAccess();
    },
    async setAccess() {
      // reset the access after a new role is added to a person
      await GroupServices.getGroupsForPerson(this.user.userID)
      .then(response => {
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
                roles: roles
            }
            this.user.access.push(group);
        }
        // resave user in store
        Utils.setStore("user", this.user);
        this.goToPage();
      })
      .catch(error => {
        console.log("There was an error:", error.response)
      });
    },
    openDialogs() {
      // if this person doesn't have any roles, do this
      if(this.user.phoneNum === '' || this.user.phoneNum === undefined || this.user.phoneNum === null) {
        this.dialog = true
      }
      else if (this.user.access.length === 0) {
        this.dialog2 = true;      
      }
      else {
        this.goToPage();
      }
    },
    async goToPage() {

      await this.getPersonRoles()
      .then(() => {
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            if(role.type.includes("Admin")) {
              this.$router.push({ name: "adminHome", params: { id: pRole.id } });
            }
            else if((role.type.includes("Student") && !pRole.status.includes("approved") && !pRole.agree) ||
                ((role.type.includes("Tutor") && !pRole.agree))) {
              this.$router.push({ name: "contract" });
            }
            // make a tutor sign up for topics if they haven't been approved yet
            else if(role.type.includes("Tutor") && pRole.status.includes("applied")) {
              this.$router.push({ name: "tutorTopics" });
            }
            else if(role.type.includes("Student") && pRole.status.includes("approved")) {
              this.$router.push({ name: "studentHome", params: { id: pRole.id } });
            }
            else if(role.type.includes("Tutor") && pRole.status.includes("approved") && pRole.agree) {
              this.$router.push({ name: "tutorHome", params: { id: pRole.id } });
            }
            this.$router.go();
            break;
          }
        } 
      })
    }
  }
}
</script>

