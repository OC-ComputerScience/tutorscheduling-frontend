<template>
    <div class="signup-buttons">
      <v-row
        justify="center"
      >
        <a href="#" class="google-signup" @click.prevent="loginWithGoogle">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><title>Google</title><g fill="none" fill-rule="evenodd"><path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"></path><path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"></path><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"></path><path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"></path></g></svg>
            Google
        </a>
        <v-dialog
          v-model="dialog"
          persistent
          max-width="600px"
        >
          <v-card tile>
            <v-card-title>
              <span class="text-h5">Hello {{this.name}}! Complete your account below:</span>
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
              <v-subheader>Choose your group(s):</v-subheader>
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
      if(this.$store.state.loginUser.admin !== null && this.$store.state.loginUser.admin)
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
