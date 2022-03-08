<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Sign Contract</v-toolbar-title>
      </v-toolbar>
      <pdf src="../Student Success Contract.pdf"></pdf>
    </v-container>
    <v-container>
      <vueSignature ref="signature" :sigOption="option" :w="'800px'" :h="'400px'" :disabled="disabled"></vueSignature> 
      <br/>
      <v-btn 
        class="mr-4"
        @click="save"
      >
        Save
      </v-btn>
      <v-btn
        class="mr-4" 
        @click="clear"
      >
        Clear
      </v-btn>
      <v-btn 
        class="mr-4"
        @click="undo"
      >
        Undo
      </v-btn>
    </v-container>
  </div>
</template>

<script>
  import pdf from 'vue-pdf'
  import vueSignature from 'vue-signature'
  import RoleServices from "@/services/roleServices.js";
  import PersonServices from "@/services/personServices.js";
  import PersonRoleServices from "@/services/personRoleServices.js";

  export default {
    name: 'App',
    components: {
        pdf,
        vueSignature
    },
    data() {
      return {
        option:{
          penColor:"rgb(0, 0, 0)",
          backgroundColor:"rgb(200, 200, 200)"
        },
        disabled: false,
        person: {},
        roles: []
      };
    },
    async created() {
      await this.getPerson()
      .then(() => {
        this.getPersonRoles();
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
      async getPerson() {
        await PersonServices.getPerson(this.$store.state.loginUser.userID)
        .then((response) => {
          this.person = response.data;
          //console.log(response.data);
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      },
      async getPersonRoles() {
        await RoleServices.getRoleForPerson(this.person.id)
        .then((response) => {
          response.data.forEach(data => {
            console.log(data);
             this.roles.push(data);
           })
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      },
      async updatePersonRole() {
        for (let i = 0; i < this.roles.length; i++) {
          let role = this.roles[i];
          if (role.type.toLowercase() === 'student')
            role.status = 'approved';
          role.agree = true;
          role.dateSigned = Date();
          await PersonRoleServices.updatePersonRole(role.id, role);
        }
      }
    }
  }
</script>