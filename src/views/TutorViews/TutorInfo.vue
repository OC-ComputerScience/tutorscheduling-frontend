<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Edit Tutor Account</v-toolbar-title>
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
        label="Phone Number"
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
        Update Phone Number
      </v-btn>

      <br><br>
      <v-card>
        <v-card-title>
          Current Topics for {{this.user.selectedGroup}}
          <v-spacer></v-spacer>
          <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
          ></v-text-field>
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
import GroupServices from "@/services/groupServices.js";
import Utils from '@/config/utils.js'

  export default {
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
                  {text: 'Skill Level', value: 'persontopic[0].skillLevel'}]
      };
    },
    async created() {
      this.user = Utils.getStore('user');
      this.getPerson();
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getTopics();
      })
    },
    methods: {
      async getGroup(name) {
        await GroupServices.getGroupByName(name)
        .then((response) => {
          this.group = response.data[0];
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      },
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
      async getTopics() {
        await TopicServices.getTopicByGroupForPerson(this.group.id, this.user.userID)
        .then(response => {
          response.data.forEach(data => {
            this.topics.push(data);
            console.log(data);
          })
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