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
        max-width="800"
      >
        <v-card tile>
          <v-card-title>
            <span class="text-h5">Hello, {{this.name}}! Finish setting up your account below:</span>
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
              color="accent"
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
            <span class="text-h5">Hello, {{this.name}}! Select below:</span>
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
import AppointmentServices from '@/services/appointmentServices'
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
          idToken: GoogleUser.getAuthResponse().id_token,
          token: {
            access_token: GoogleUser.getAuthResponse().access_token,
            token_type: GoogleUser.getAuthResponse().token_type,
            expiry_date: GoogleUser.getAuthResponse().expires_at
          }
        }
        AuthServices.loginUser(userInfo)
        .then(response => {
          this.user = response.data;
          Utils.setStore("user", this.user);
          this.name = this.user.fName;
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
    async getPerson() {
      await PersonServices.getPerson(this.user.userID)
        .then(response => {
          this.person = response.data;
        })
        .catch(error => {
          console.log("There was an error:", error.response)
        });
    },
    getGoogleCalToken() {
      AppointmentServices.getGoogleCalPage()
      .then(response => {
        console.log(response)
        window.open(response.data)
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

        console.log(this.personroles)
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
      // for (let i = 0; i < this.groups.length; i++) {
      //   for (let j = 0; j < this.selected.length; j++) {
      //     if(this.selected[j] === i) {
      //         this.checkedGroups.push(this.groups[i]);
      //         const group = this.groups[i];
      //         await this.addGroupRoles(group.id);
      //     }
      //   }
      // }
      // console.log(this.checkedGroups)
    },
    async savePhoneNum() {
      await this.getPerson()
      .then(() => {
        this.person.phoneNum = this.phoneNum;
        // save phone number locally and to database
        this.user.phoneNum = this.phoneNum;
        Utils.setStore("user", this.user);
        PersonServices.updatePerson(this.person.id, this.person);
      })
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
    async savePersonRoles() {
      await this.getGroupRoles()
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
        //console.log(response);
        this.user.access = [];
        for (let i = 0; i < response.data.length; i++) {
            let element = response.data[i];
            let roles = [];
            //console.log(element)
            for (let j = 0; j < element.role.length; j++) {
                let item = element.role[j];
                //console.log(item)
                let role = item.type;
                roles.push(role);
            }
            let group = {
                name: element.name,
                roles: roles
            }
            this.user.access.push(group);
        }
        console.log(this.user.access);
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
      // console.log(this.roleCounter)
      if(this.user.access.length === 0) {
        if(this.user.phoneNum === '')
          this.dialog = true
        else
          this.dialog2 = true;      
      }
      this.goToPage();
    },
    async goToPage() {
      await this.getPersonRoles()
      .then(() => {
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          console.log(role);
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            console.log(pRole);
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

