<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <br><br>
      <h4>
        Before continuing to this service, you must sign contracts for the following positions. Please click on each title to sign its contract.
      </h4>
        <v-row justify="center">
          <v-col
              v-for="role in roles"
              :key="role.id"
          >
              <v-card 
                @click="role.dialog = true"
                class="mx-auto my-12 d-flex justify-center"
                max-width="400"
                height="100"
                elevation="10"
                :style="{ 'background-color' : role.color }"
              >
                  <v-card-title class="justify-center white--text">
                      {{ role.type }} - {{ role.groupName }}
                  </v-card-title>
              </v-card>

            <v-dialog
              v-model="role.dialog"
              persistent
              max-width="1000px"
            >
              <v-card
              >
                <v-card-title>
                  <span class="text-h5">Sign a contract for {{ role.groupName }}:</span>
                </v-card-title> 
                <pdf :src="role.pdfName"></pdf>
                <v-container>
                  <v-text-field
                    label="Digital Signature"
                    hint="Jane Doe"
                    persistent-hint
                    required
                  ></v-text-field>
                  <br><br>
                  <v-btn 
                    class="mr-4"
                    color="success"
                    @click="save(role)"
                  >
                    Agree
                  </v-btn>
                  <br><br>
                  <br><br>
                </v-container>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
    </v-container>
  </div>
</template>

<script>
  import pdf from 'vue-pdf';
  import GroupServices from "@/services/groupServices.js";
  import RoleServices from "@/services/roleServices.js";
  import PersonRoleServices from "@/services/personRoleServices.js";
  import Utils from '@/config/utils.js';

  export default {
    name: 'App',
    components: {
        pdf
    },
    data() {
      return {
        //dialog: [],
        message :'Sign Contract',
        roles: [],
        completeRole: {},
        colors: ['#47121D', '#EE5044', '#63BAC0', '#196CA2', '#F8C545', '#032F45'],
        user: {},
        contracts: [ "Student.pdf", "NewCollege-Tutor.pdf", "StudentSuccessCenter-Tutor.pdf", "WritingCenter-Tutor.pdf" ]
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getPersonRoles()
      .then(() => {
        console.log(this.roles)
        console.log(this.completeRole)
        if(this.roles.length === 0 && this.completeRole !== null) {
          if(this.completeRole.type.includes("Student"))
            this.$router.push({ name: "studentHome", params: { id: this.completeRole.personrole[0].id } });
          else if(this.completeRole.type.includes("Tutor"))
            this.$router.push({ name: "tutorHome", params: { id: this.completeRole.personrole[0].id } });
          else if(this.completeRole.type.includes("Admin"))
            this.$router.push({ name: "mainCalendar" });
        }
      })
    },
    methods: {
      // check that if there are multiple contracts to sign, some of the buttons go away
      async save(role) {
        await this.updatePersonRole(role)
        .then(async () => {
          await this.getPersonRoles()
          .then(() => {
            console.log(this.roles);
            if (this.roles.length !== 0)
              role.dialog = false;
            else if (this.roles.length === 0 && this.completeRole !== null) {
              if(this.completeRole.type.includes("Student"))
                this.$router.push({ name: "studentHome", params: { id: this.completeRole.personrole[0].id } });
              else if(this.completeRole.type.includes("Tutor"))
                this.$router.push({ name: "tutorHome", params: { id: this.completeRole.personrole[0].id } });
              else if(this.completeRole.type.includes("Admin"))
                this.$router.push({ name: "adminHome" });
              this.$router.go();
            }
          })
          .catch(error=>{
            this.message = error.response.data.message
          })
          
        })
        .catch(error=>{
          this.message = error.response.data.message
        })
      },
      async getPersonRoles() {
        this.roles = [];
        await GroupServices.getIncompleteGroupsForPerson(this.user.userID)
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let group = response.data[i];
            for (let j = 0; j < group.role.length; j++) {
              let role = group.role[j];
              
              for (let k = 0; k < role.personrole.length; k++) {
                let personrole = role.personrole[k];
                if (role.type.includes("Student")) {
                  personrole.pdfName = this.contracts[0];
                }
                else {
                  for (let h = 1; h < this.contracts.length; h++) {
                    if(this.contracts[h].includes(group.name.replace(/\s/g, ''))) {
                      personrole.pdfName = this.contracts[h];
                    }
                  }
                }
                personrole.groupName = group.name;
                personrole.dialog = false;
                personrole.color = this.colors[k % this.colors.length];
                personrole.type = role.type;
                this.roles.push(personrole);
              }
            }
          }
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });

        console.log(this.roles);

        // if there are no incomplete roles, route home with the right id
        if(this.roles.length === 0) {
          await RoleServices.getRoleForPerson(this.user.userID)
          .then((response) => {
            this.completeRole = response.data[0];
          })
          .catch((error) => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response);
          });
        }
      },
      async updatePersonRole(role) {
        let updatedRole = {};
        if (role.type.includes('Student'))
            updatedRole.status = 'approved';
          updatedRole.agree = true;
          updatedRole.dateSigned = Date();
        updatedRole.id = role.id;
        updatedRole.personId = role.personId;
        updatedRole.roleId = role.roleId;
        updatedRole.createdAt = role.createdAt;
        updatedRole.updatedAt = role.updatedAt;
        await PersonRoleServices.updatePersonRole(role.id, updatedRole)
        .catch(error =>{
          this.message = error.response.data.message
        });
      }
    }
  }
</script>
