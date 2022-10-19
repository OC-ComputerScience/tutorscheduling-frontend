<template>
    <div>
        <v-container>
            <v-toolbar>
                <v-toolbar-title>{{this.message}}</v-toolbar-title>
            </v-toolbar>
            <br><br>
            <v-row justify="center">
                <v-col justify="center">
                    <v-card 
                        @click="dialog = true; haveRoleAlready()"
                        height="100"
                        elevation="10"
                        color="primary"
                        class="d-flex justify-center align-center"
                    >
                        <v-card-title class="justify-center white--text">
                        Apply
                        </v-card-title>
                    </v-card>
                </v-col>
            </v-row>
            <v-dialog
                v-model="dialog"
                max-width="600px"
            >
                <v-card tile>
                <v-card-title>
                    <span class="text-h5">Hello {{this.name}}! Select below:</span>
                </v-card-title>
                <v-container>
                    <v-subheader>Choose your action:</v-subheader>
                    <v-list>
                    <v-list-item><!-- put @change -> boolean true or false on group checkboxes-->
                        <v-checkbox
                        v-model="student" 
                        :label="`Sign up for tutoring`"
                        :rules="validateRoleCheckbox"
                        @change="tutor=!student; haveRoleAlready();"
                        ></v-checkbox>
                    </v-list-item>
                    <v-list-item>
                        <v-checkbox
                        v-model="tutor"
                        :label="`Apply to be a tutor`"
                        :rules="validateRoleCheckbox"
                        @change="student=!tutor; haveRoleAlready();"
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
                        :disabled="group.haveRole"
                        ></v-checkbox>
                        <v-text-field 
                          v-if="group.haveRole"
                          v-model="group.sentenceHaveRole"
                          disabled
                          flat solo class="ma-0 pa-0 pb-1" hide-details
                        >
                        </v-text-field>
                    </v-list-item>
                    </v-list>
                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="accent"
                      text
                      @click="savePersonRoles()"
                      :disabled="selected == ''"
                    >
                    Continue
                    </v-btn>
                </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    </div>
</template>

<script>
import GroupServices from '@/services/groupServices'
import RoleServices from '@/services/roleServices'
import PersonRoleServices from '@/services/personRoleServices'
import TwilioServices from '@/services/twilioServices'
import Utils from '@/config/utils.js'

export default {
  data () {
    return {
      message : 'Apply for more help or another position:',
      dialog: false,
      student: true,
      tutor: false, 
      groups: [],
      roles: [],
      admins: [],
      personroles: [],
      personrole: {},
      selected: [],
      checkedGroups: [],
      name: '',
      roleCounter: 0,
      user: {},
      sentenceHaveRole: "",
    }
  },
  created () {
    this.user = Utils.getStore('user');
    this.name = this.user.fName;
    this.getGroups();
  },
  computed: {
    validateRoleCheckbox() {
      return [this.student || this.tutor];
    }
  },
  methods: {
    async haveRoleAlready(){
        let groups = [];
        this.user.access.forEach(element => {
          groups.push(element.name);
        });
        for (let k = 0;k < this.groups.length;k++){
          for (let i = 0;i < groups.length;i++){
            if (groups[i].includes(this.groups[k].name)) {
              let role = []
              this.user.access[i].roles.forEach(element => {
                role.push(element);
              });
              for (let j = 0; j < role.length;j++){
                if(role[j].includes('Student') && this.student == true) {
                  this.groups[k].haveRole = true;
                  this.groups[k].sentenceHaveRole = "    You already have this role"
                  break;
                }
                else if (role[j].includes('Tutor') && this.tutor == true) {
                  this.groups[k].haveRole = true;
                  this.groups[k].sentenceHaveRole = "    You already have this role"
                  break;
                }
                else {
                  this.groups[k].haveRole = false;
                  this.groups[k].sentenceHaveRole = ''
                }
              }
              break
            }
            else {
              this.groups[k].haveRole = false;
              this.groups[k].sentenceHaveRole = ''
            }
          }
        }
        this.selected = []
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
          this.message = error.response.data.message
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
            this.message = error.response.data.message
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
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
    },
    async getGroupRoles() {
      this.roles = [];
      for (let i = 0; i < this.selected.length; i++) {
        await this.addGroupRoles(this.selected[i].id)
        .catch (error => {
          this.message = error.response.data.message
        });
      }
    },
    async addGroupRoles(id) {
      await RoleServices.getAllForGroup(id)
      .then(response => {
        response.data.forEach(data => {
          this.roles.push(data);
        })
      })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },
    async savePersonRoles() {
      await this.getGroupRoles()
      .then(async () => {
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
            await PersonRoleServices.addPersonRole(this.personrole)
            .then(async response => {
              let status = response.data.status
              // send notification to admins if new person role is a tutor
              if(role.type.toLowerCase() === 'tutor' && status === 'applied') {
                await this.getAdmins(role.groupId);
                for(let i = 0; i < this.admins.length; i++) {
                  this.sendMessage(this.admins[i], role.groupId)
                }
              }
            })
            .catch(error => {
              this.message = error
              console.log("There was an error:", error)
            });
          }
        }
        this.setAccess();
      })
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
        this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },
    async goToPage() {
      await this.getPersonRoles()
      .then(() => {
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            if(role.type.includes("Admin")) {
              this.$router.push({ name: "mainCalendar" });
            }
            else if((role.type.includes("Student") && !pRole.status.includes("approved")) ||
                ((role.type.includes("Tutor") && !pRole.agree))) {
              this.$router.push({ name: "contract" });
            }
            // make a tutor sign up for topics if they haven't been approved yet
            else if(role.type.includes("Tutor") && pRole.status.includes("applied")) {
              this.$router.push({ name: "tutorTopics" });
            }
            else if(role.type.includes("Student") && pRole.status.includes("approved")) {
              this.$router.push({ name: "mainCalendar" });
            }
            else if(role.type.includes("Tutor") && pRole.status.includes("approved") && pRole.agree) {
              this.$router.push({ name: "tutorHome" });
            }
          }
        } 
      })
      .catch(error => {
        this.message = error.response.data.message
      })
    },
    async getAdmins(groupId) {
      await RoleServices.getAllForGroupByType(groupId, "Admin")
      .then(response => {
        console.log(response)
        this.admins = response.data[0].personrole
      })
      .catch(error => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response)
      });
    },
    sendMessage(admin, groupId) {
      let temp = {
        phoneNum: admin.person.phoneNum,
        message: ''
      }

      temp.message = "You have a new tutor application from " + this.user.fName + " " + this.user.lName
        + " for " + this.groups.find(group => group.id == groupId).name + ".\nPlease view this application at http://tutorscheduling.oc.edu/"

      TwilioServices.sendMessage(temp);
    },
  }
}
</script>

