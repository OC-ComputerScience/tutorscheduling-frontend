
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Locations</v-toolbar-title>
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
        elevation="2"
        @click="addLocation"
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
        :items="locations"
        :items-per-page="50"
        @click:row="rowClick"
      ></v-data-table>
    </v-card>
    </v-container>
  </div>
</template>

<script>
  import LocationServices from '@/services/locationServices.js'
  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        search: '',
        locations: [],
        headers: [{text: 'ID', value: 'id'}, 
                  {text: 'Name', value: 'name'},
                  {text: 'Type', value: 'type'},
                  {text: 'Building', value: 'building'}]
      }
    },
    created() {
      this.getLocations();
    },
    methods: {
      getLocations() {
        LocationServices.getAllLocations()
        .then(response => {
          this.locations = response.data;
        })
        .catch(error => {
          console.log("There was an error:", error.response)
        });
      },
      deleteLocation(id, name) {
        let confirmed = confirm(`Are you sure you want to delete ${name}`);
        if(confirmed) {
          LocationServices.deleteLocation(id)
          .then(() => {
            this.getLocations(this.start, this.length);
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
        }
      },
      getPrevious() {
        if(this.start >= this.length) {
          this.start -= this.length;
          this.getLocations(this.start, this.length);
        }
      },
      getNext() {
        if(this.courses.length === this.length) {
          this.start += this.length;
          this.getLocations(this.start, this.length);
        }
      },
      rowClick: function (item, row) {      
        row.select(true);
        this.$router.push({ name: 'locationView', params: { id: item.id } });
      },
      addLocation() {
        this.$router.push({ name: 'locationAdd'});
      },
      cancel() {
        this.$router.go(-1);
      }
    }
  }
</script>
