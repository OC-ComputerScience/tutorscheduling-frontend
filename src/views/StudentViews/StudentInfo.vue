<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Edit Student Account</v-toolbar-title>
      </v-toolbar>
      <br><br>
      <v-text-field
        v-model="fullName"
        label="Name"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="person.email"
        label="Email"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="person.phoneNum"
        id="phoneNum"
        :counter="13"
        label="Mobile Phone"
        hint="111-222-3333"
        persistent-hint
        required
      ></v-text-field>

      <br>
      <v-btn
        color="accent"
        @click="savePhoneNum()"
        class="justify-center white--text"
      >
        Update Mobile Phone
      </v-btn>
      <br><br>
      <v-row>
        <v-col>
          <v-card 
            :to="{ name: 'apply' }"
            height="100"
            elevation="10"
            color="yellow"
            class="d-flex justify-center"
          >
            <v-card-title class="justify-center white--text">
              Apply For Tutoring
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card 
            :to="{ name: 'apply' }"
            height="100"
            elevation="10"
            color="teal"
            class="d-flex justify-center"
          >
            <v-card-title class="justify-center white--text">
              Apply To Be A Tutor
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import PersonServices from '@/services/personServices'
import Utils from '@/config/utils.js'

  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        person: {},
        fullName: ''
      };
    },
    created() {
      this.user = Utils.getStore('user');
      this.getPerson();
    },
    methods: {
      async getPerson() {
        await PersonServices.getPerson(this.user.userID)
          .then(response => {
            this.person = response.data;
            this.fullName = this.person.fName + ' ' + this.person.lName;
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
      },
      savePhoneNum() {
        PersonServices.updatePerson(this.person.id, this.person);
      },
    }
  }
</script>
