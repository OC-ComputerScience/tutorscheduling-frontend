<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="mx-2"
              color="grey darken"
              dark
              v-bind="attrs"
              v-on="on"
            >
              mdi-information
            </v-icon>
          </template>
          <span>
            Make changes to your phone number or view your information below.
          </span>
        </v-tooltip>
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
      <v-card>
        <v-card-title>
          Current Topics for {{this.user.selectedGroup}}
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="mx-2"
                color="grey darken"
                dark
                v-bind="attrs"
                v-on="on"
              >
                mdi-information
              </v-icon>
            </template>
            <span>
              If you need to add or remove a topic, please contact your supervisor.
            </span>
          </v-tooltip>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :search="search"
          :items="topics"
          :items-per-page="50"
        ></v-data-table>
      </v-card>
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
      <br><br>
    </v-container>
  </div>
</template>

<script>
import PersonServices from '@/services/personServices'
import TopicServices from '@/services/topicServices'
import PersonRoleServices from "@/services/personRoleServices.js";
import Utils from '@/config/utils.js'

  export default {
    props: ["id"],
    name: 'App',
    components: {
    },
    data() {
      return {
        user: {},
        search: '',
        person: {},
        fullName: '',
        topics: [],
        headers: [{text: 'Topic', value: 'name'}, 
                  {text: 'Skill Level', value: 'persontopic[0].skillLevel'}],
        message :''
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getPerson();
      await this.getGroupByPersonRoleId(this.id)
      .then(() => {
        this.getTopics();
      })
    },
    methods: {
      async getGroupByPersonRoleId() {
        await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      async getPerson() {
        await PersonServices.getPerson(this.user.userID)
          .then(response => {
            this.person = response.data;
            this.fullName = this.person.fName + ' ' + this.person.lName;
            this.message = this.fullName + "'s Information"
          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      },
      async getTopics() {
        await TopicServices.getTopicByGroupForPerson(this.group.id, this.user.userID)
        .then(response => {
          response.data.forEach(data => {
            this.topics.push(data);
          
          })
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
      savePhoneNum() {
        PersonServices.updatePerson(this.person.id, this.person);
      },
    }
  }
</script>
