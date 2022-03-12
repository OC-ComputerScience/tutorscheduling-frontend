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
                        max-width="300"
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
                    color="blue darken-1"
                    text
                    @click="goToPage(); savePersonRoles()"
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
                personId: this.user.userId,
                roleId: role.id 
              };
            PersonRoleServices.addPersonRole(this.personrole);
          }
        }
      })
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
