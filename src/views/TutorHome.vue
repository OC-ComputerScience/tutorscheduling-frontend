<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Hello, {{ this.$store.state.loginUser.fName }}!</v-toolbar-title>
      </v-toolbar>
      <v-card 
        :to="{ name: 'mainCalendar' }"
        class="mx-auto my-12"
        max-width="400"
        height="100"
        elevation="10"
        color="secondary"
      >
        <v-card-title class="justify-center">
              View Calendar
        </v-card-title>
      </v-card>
      <v-card 
        :to="{ name: 'availabilityAdd' }"
        class="mx-auto my-12"
        max-width="400"
        height="100"
        elevation="10"
        color="secondary"
      >
        <v-card-title class="justify-center">
              Manage Availability
        </v-card-title>
      </v-card>
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

  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        search: '',
        appointments: [],
        headers: [{text: 'Date', value: 'date'}, 
                  {text: 'Start Time', value: 'startTime'},
                  {text: 'End Time', value: 'EndTime'},
                  {text: 'Topic', value: 'topicId'}]
      };
    },
    created() {
    },
    methods: {
      rowClick: function (item, row) {      
        row.select(true);
        //this.$router.push({ name: 'appointmentView', params: { id: item.id } });
      }
    }
  }
</script>