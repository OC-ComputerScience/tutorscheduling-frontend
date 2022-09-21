
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <br><br>
    <v-card>
      <v-card-title>
        <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn
        color="accent"
        class="mr-4"
        elevation="2"
        @click="addTopic"
      >
        Add
    </v-btn>

    <v-btn
        class="mr-4"
        @click="cancel"
      >
        Back
    </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :search="search"
        :items="topics"
        :items-per-page="50"
        @click:row="rowClick"
      ></v-data-table>
    </v-card>
    </v-container>
  </div>
</template>

<script>
  import Utils from '@/config/utils.js'
  import PersonRoleServices from "@/services/personRoleServices.js";
  import TopicServices from '@/services/topicServices.js'

  export default {
    name: 'App',
    components: {
    },
    props: ["id"],
    data() {
      return {
        search: '',
        topics: [],
        user: {},
        headers: [{text: 'ID', value: 'id'}, 
                  {text: 'Name', value: 'name'},
                  {text: 'Abbreviation', value: 'abbr'}],
        message : 'Topics - click topic to view or edit topic or click Add to add new topic'
      }
    },
    async created() {
      // this.getTopics();
      this.user = Utils.getStore('user');
      await this.getGroupByPersonRoleId()
      .then(() => {
        this.getTopicsForGroup();
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
      getTopicsForGroup() {
        TopicServices.getAllForGroup(this.group.id)
        .then(response => {
          this.topics = response.data;
        })
        .catch(error => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response)
        });
      },
      deleteTopic(id, name) {
        let confirmed = confirm(`Are you sure you want to delete ${name}`);
        if(confirmed) {
          TopicServices.deleteTopic(id)
          .then(() => {
            this.getTopics(this.start, this.length);
          })
          .catch(error => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response)
          });
        }
      },
      rowClick: function (item, row) {      
        row.select(true);
        this.$router.push({ name: 'topicView', params: { id: this.id, topicId: item.id } });
      },
      addTopic() {
        this.$router.push({ name: 'topicAdd', params: { id: this.id }});
      },
      cancel() {
        this.$router.go(-1);
      }
    }
  }
</script>

