
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Topics</v-toolbar-title>
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
  import GroupServices from "@/services/groupServices.js";
  import TopicServices from '@/services/topicServices.js'
  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        search: '',
        topics: [],
        user: {},
        headers: [{text: 'ID', value: 'id'}, 
                  {text: 'Name', value: 'name'},
                  {text: 'Abbreviation', value: 'abbr'}]
      }
    },
    async created() {
      // this.getTopics();
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getTopicsForGroup();
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
      getTopicsForGroup() {
        TopicServices.getAllForGroup(this.group.id)
        .then(response => {
          this.topics = response.data;
        })
        .catch(error => {
          console.log("There was an error:", error.response)
        });
      },
      // getTopics() {
      //   TopicServices.getAllTopics()
      //   .then(response => {
      //     this.topics = response.data;
      //   })
      //   .catch(error => {
      //     console.log("There was an error:", error.response)
      //   });
      // },
      deleteTopic(id, name) {
        let confirmed = confirm(`Are you sure you want to delete ${name}`);
        if(confirmed) {
          TopicServices.deleteTopic(id)
          .then(() => {
            this.getTopics(this.start, this.length);
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
        }
      },
      getPrevious() {
        if(this.start >= this.length) {
          this.start -= this.length;
          this.getTopics(this.start, this.length);
        }
      },
      getNext() {
        if(this.courses.length === this.length) {
          this.start += this.length;
          this.getTopics(this.start, this.length);
        }
      },
      rowClick: function (item, row) {      
        row.select(true);
        this.$router.push({ name: 'topicView', params: { id: item.id } });
      },
      addTopic() {
        this.$router.push({ name: 'topicAdd'});
      },
      cancel() {
        this.$router.go(-1);
      }
    }
  }
</script>

