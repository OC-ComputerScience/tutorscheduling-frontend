<template>
    <div>
        <v-container>
            <v-toolbar>
                <v-toolbar-title>Apply for more help or another position:</v-toolbar-title>
            </v-toolbar>
            <br><br>
            <v-row justify="center">
                <v-col justify="center">
                    <v-card 
                        @click="dialog = true"
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
        </v-container>
    </div>
</template>

<script>
import GroupServices from '@/services/groupServices'
import RoleServices from '@/services/roleServices'
import PersonRoleServices from '@/services/personRoleServices'
import Utils from '@/config/utils.js'

export default {
  data () {
    return {
      dialog: false,
      student: true,
      tutor: false, 
      groups: [],
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
    async getPersonRoles() {
        await RoleServices.getIncompleteRoleForPerson(this.user.userID)
        .then((response) => {
          console.log(response);
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
      this.roles = [];
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
      .then(async () => {
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
            await PersonRoleServices.addPersonRole(this.personrole);
          }
        }
        this.setAccess();
      })
    },
    async setAccess() {
      // reset the access after a new role is added to a person
      await GroupServices.getGroupsForPerson(this.user.userID)
      .then(response => {
        // console.log(response);
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
    async goToPage() {
      await this.getPersonRoles()
      .then(() => {
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          console.log(role);
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            //console.log(pRole);
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
    }
  }
}
</script>

