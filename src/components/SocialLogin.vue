<template>
    <div class="signup-buttons">
      <v-row>
        <v-col>
          <v-card 
            @click.prevent="loginWithGoogle"
            height="100"
            elevation="10"
            color="primary"
            class="d-flex justify-center"
          >
            <v-card-title class="justify-center white--text">
              Register
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card 
            @click.prevent="loginWithGoogle"
            height="100"
            elevation="10"
            color="primary"
            class="d-flex justify-center"
          >
            <v-card-title class="justify-center white--text">
              Login
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      
      <v-dialog
        v-model="dialog"
        persistent
        max-width="600px"
      >
        <v-card tile>
          <v-card-title>
            <span class="text-h5">Hello {{this.name}}! Finish setting up your account below:</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-text-field
                  v-model="phoneNum"
                  id="phoneNum"
                  :counter="50"
                  label="Phone Number"
                  hint="123-456-7890"
                  persistent-hint
                  required
                ></v-text-field>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="dialog = false; dialog2 = true; savePhoneNum()"
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
            <span class="text-h5">Hello {{this.name}}! Select below:</span>
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
              color="blue darken-1"
              text
              @click="goToPage(); savePersonRoles()"
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
      name: '',
      roleCounter: 0,
      user: {}
    }
  },
  created () {
    this.getGroups();
    //this.getPerson();
  },
  computed: {
    validateRoleCheckbox() {
      return [this.student || this.tutor];
    }
  },
  methods: {
    loginWithGoogle() {
      this.$gAuth
      .signIn()
      .then(GoogleUser => {
        // on success do something
        console.log('GoogleUser', GoogleUser);
        console.log('getId', GoogleUser.getId());
        console.log('basicprofile', GoogleUser.getBasicProfile().getName());
        console.log('getBasicProfile', GoogleUser.getBasicProfile());
        console.log('getAuthResponse', GoogleUser.getAuthResponse());
        var userInfo = {
          email: GoogleUser.getBasicProfile().getEmail(),
          accessToken: GoogleUser.getAuthResponse().id_token
        }
        AuthServices.loginUser(userInfo)
        .then(response => {
          this.user = response.data;
          Utils.setStore("user", this.user);
          console.log(this.user);
          this.openDialogs();
        })
        .catch(error => {
          console.log('error', error);
        })
      })
      .catch(error => {
        console.log('error', error);
      })
    },
    getPerson() {
      if (this.$store.state.loginUser.userID !== undefined && this.$store.state.loginUser !== null) {
        PersonServices.getPerson(this.$store.state.loginUser.userID)
          .then(response => {
            this.person = response.data;
            return;
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
      }
    },
    async getPersonRoles() {
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
      for (let i = 0; i < this.groups.length; i++) {
        for (let j = 0; j < this.selected.length; j++) {
          if(this.selected[j] === i) {
              this.checkedGroups.push(this.groups[i]);
              const group = this.groups[i];
              await this.addGroupRoles(group.id);
          }
        }
      }
      console.log(this.checkedGroups)
    },
    savePhoneNum() {
      this.person.phoneNum = this.phoneNum;
      PersonServices.updatePerson(this.person.id, this.person);
    },
    async addGroupRoles(id) {
      await RoleServices.getAllForGroup(id)
      .then(response => {
        response.data.forEach(data => {
          this.roles.push(data);
          console.log(data);
        })
      })
      .catch(error => {
        console.log("There was an error:", error.response)
      });
    },
    savePersonRoles() {
      this.getGroupRoles()
      .then(() => {
        console.log(this.roles);
        for (let i = 0; i < this.roles.length; i++) {
          const role = this.roles[i];
          console.log(role);
          if((this.student && role.type.toLowerCase() === 'student') ||
              (this.tutor && role.type.toLowerCase() === 'tutor')) {
              this.personrole = {
                status: "applied",
                agree: false,
                dateSigned: Date(),
                personId: this.person.id,
                roleId: role.id 
              };
            PersonRoleServices.addPersonRole(this.personrole);
          }
        }
      })
    },
    openDialogs() {
      // if this person doesn't have any roles, do this
      // console.log(this.roleCounter)
      if(this.user.access.length === 0) {
        if(this.person.phoneNum === '')
          this.dialog = true
        else
          this.dialog2 = true;      
      }
      this.goToPage();
    },
    async goToPage() {
      await this.getPersonRoles();
      for (let i = 0; i < this.personroles.length; i++) {
        let role = this.personroles[i];
        console.log(role);
        for (let j = 0; j < role.personrole.length; i++) {
          let pRole = role.personrole[j];
          console.log(pRole);
          if(role.type.includes("Admin")) {
            this.$router.push({ name: "mainCalendar" });
          }
          else if((role.type.includes("Student") && !pRole.status.includes("approved")) ||
              ((role.type.includes("Tutor") && !pRole.agree))) {
            this.$router.push({ name: "contract" });
          }
          else if(role.type.includes("Student") && pRole.status.includes("approved")) {
            this.$router.push({ name: "mainCalendar" });
          }
          // make a tutor sign up for topics if they haven't been approved yet
          else if(role.type.includes("Tutor") && pRole.status.includes("applied")) {
            this.$router.push({ name: "tutorTopics" });
          }
          else if(role.type.includes("Tutor") && pRole.status.includes("approved") && pRole.agree) {
            this.$router.push({ name: "tutorHome" });
          }
          break;
        }
      } 
    }
  }
}
</script>
