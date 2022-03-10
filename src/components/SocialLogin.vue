<template>
    <div class="signup-buttons">
      <v-row
        justify="center"
      >
        <v-btn
          x-large
          block
          class="mr-4"
          color="primary"
          @click.prevent="loginWithGoogle"
        >
          Register
        </v-btn>
        <br><br>
        <v-btn
          x-large
          block
          class="mr-4"
          color="primary"
          @click.prevent="loginWithGoogle"
        >
          Log In
        </v-btn>
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
                    v-model="checkedGroups"
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
      </v-row>
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
      model: false,
      groups: [],
      phoneNum: '',
      person: {},
      roles: [],
      personrole: {},
      checkedGroups: [],
      name: '',
      roleCounter: 0
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
      var user = {};
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
          user = response.data;
          Utils.setStore("user", user);
          console.log(user);
          this.getPersonInfoInOrder(user.userID);
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
    getPersonRoles() {
      PersonRoleServices.getAllForPerson(this.person.id)
      .then((response) => {
        // this only sets the number of roles the person has
        // console.log(response.data);
        // console.log(response.data.length);
        this.roleCounter = response.data.length;
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
      //console.log(this.checkedGroups);
      for (let i = 0; i < this.checkedGroups.length; i++) {
        const group = this.checkedGroups[i];
        await this.addGroupRoles(group.id);
      }
    },
    savePhoneNum() {
      this.person.phoneNum = this.phoneNum;
      PersonServices.updatePerson(this.person.id, this.person);
    },
    goToPage() {
      if(this.$store.state.loginUser.admin)
        this.$router.push({ name: "mainCalendar" });
      else  
        this.$router.push({ name: "contract" });
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
    getPersonInfoInOrder(id) {
      PersonServices.getPerson(id)
      .then(response => {
        this.person = response.data;
        this.name = this.person.fName;
        PersonRoleServices.getAllForPerson(this.person.id)
        .then((response) => {
          // this only sets the number of roles the person has
          // console.log(response.data);
          // console.log(response.data.length);
          this.roleCounter = response.data.length;
          this.openDialogs();
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      })
      .catch(error => {
        console.log("There was an error:", error.response)
      });
    },
    openDialogs() {
      // if this person doesn't have any roles, do this
      // console.log(this.roleCounter)
      if(this.roleCounter === 0) {
        if(this.person.phoneNum === '')
          this.dialog = true
        else
          this.dialog2 = true;
      }
      else
        this.goToPage();
    }
  }
}
</script>