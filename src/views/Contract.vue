<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Sign Contract</v-toolbar-title>
      </v-toolbar>
      <!-- <pdf src="../Student Success Contract.pdf"></pdf> -->
    </v-container>
    <v-container>
      <vueSignature ref="signature" :sigOption="option" :w="'800px'" :h="'400px'" :disabled="disabled"></vueSignature> 
      <br/>
      <v-btn 
        class="mr-4"
        @click="save()"
      >
        Save
      </v-btn>
      <v-btn
        class="mr-4" 
        @click="clear()"
      >
        Clear
      </v-btn>
      <v-btn 
        class="mr-4"
        @click="undo()"
      >
        Undo
      </v-btn>
    </v-container>
  </div>
</template>

<script>
  // import pdf from 'vue-pdf'
  import vueSignature from 'vue-signature'
  import RoleServices from "@/services/roleServices.js";
  import PersonRoleServices from "@/services/personRoleServices.js";
  import Utils from '@/config/utils.js';

  export default {
    name: 'App',
    components: {
        //pdf,
        vueSignature
    },
    data() {
      return {
        option:{
          penColor:"rgb(0, 0, 0)",
          backgroundColor:"rgb(200, 200, 200)"
        },
        disabled: false,
        roles: [],
        user: {}
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getPersonRoles()
      .then(() => {
        console.log(this.roles)
      })
    },
    methods: {
      async save() {
        // var png = this.$refs.signature.save();
        // var jpeg = this.$refs.signature.save('image/jpeg');
        // var svg = this.$refs.signature.save('image/svg+xml');
        // console.log(png);
        // console.log(jpeg);
        // console.log(svg);
        // this.getPersonRoles();
        await this.updatePersonRole()
        .then(() => {
          if(this.user.access[0].roles[0].includes("Student"))
            this.$router.push({ name: "mainCalendar" });
          else if(this.user.access[0].roles[0].includes("Tutor"))
            this.$router.push({ name: "tutorHome" });
          else if(this.user.access[0].roles[0].includes("Admin"))
            this.$router.push({ name: "mainCalendar" });
        })
      },
      clear(){
        this.$refs.signature.clear();
      },
      undo(){
        this.$refs.signature.undo();
      },
      handleDisabled(){
        this.disabled  = !this.disabled
      },
      async getPersonRoles() {
        await RoleServices.getRoleForPerson(this.user.userID)
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let role = response.data[i];
            for (let j = 0; j < role.personrole.length; j++) {
              let personrole = role.personrole[j];
              this.roles.push(personrole);
              if(role.type.includes("Student") && personrole.status.includes("approved") && personrole.agree)
                this.$router.push({ name: "mainCalendar" });
              else if(role.type.includes("Tutor") && personrole.status.includes("approved") && personrole.agree)
                this.$router.push({ name: "tutorHome" });
            }
          }
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      },
      async updatePersonRole() {
        for (let i = 0; i < this.roles.length; i++) {
          let role = this.roles[i];
          console.log(role)
          if (role.type.includes('Student'))
            role.status = 'approved';
          role.agree = true;
          role.dateSigned = Date();
          await PersonRoleServices.updatePersonRole(role.id, role);
        }
      }
    }
  }
</script>