<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.user.fName }}!</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title>Student</v-toolbar-title>
      </v-toolbar>
      <v-row>
        <v-col>
          <v-card 
            :to="{ name: 'mainCalendar' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="#EE5044"
          >
            <v-card-title class="justify-center white--text">
                  View Calendar
            </v-card-title>
          </v-card>
        </v-col>
        <v-col>
          <v-card 
            :to="{ name: 'mainCalendar' }"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            color="#F8C545"
          >
            <v-card-title class="justify-center white--text">
                  Make A Request
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-card>
        <v-card-title>
          Upcoming Appointments
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
          :items="appointments"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'

  export default {
    props: ["id"],
    name: 'App',
    watch: {
      id: function () {
        console.log(this.id);
      },
    },
    components: {
    },
    data() {
      return {
        search: '',
        user: {},
        appointments: [],
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'EndTime'},
                  {text: 'Topic', value: 'topicId'}]
      };
    },
    created() {
      this.user = Utils.getStore('user');
    },
    methods: {
      rowClick: function (item, row) {      
        row.select(true);
        //this.$router.push({ name: 'appointmentView', params: { id: item.id } });
      }
    }
  }
</script>