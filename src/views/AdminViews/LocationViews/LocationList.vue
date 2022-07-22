
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
  import Utils from '@/config/utils.js'
  import GroupServices from "@/services/groupServices.js";
  import LocationServices from '@/services/locationServices.js'
  
  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        message : 'Locations - click location to view or edit location or click Add to add new location',
        search: '',
        locations: [],
        user: {},
        group: {},
        headers: [{text: 'ID', value: 'id'}, 
                  {text: 'Name', value: 'name'},
                  {text: 'Type', value: 'type'},
                  {text: 'Building', value: 'building'}]
      }
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        this.getLocationsForGroup();
      })
    },
    methods: {
      async getGroup(name) {
        await GroupServices.getGroupByName(name)
        .then((response) => {
          this.group = response.data[0];
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      getLocationsForGroup() {
        LocationServices.getAllForGroup(this.group.id)
        .then(response => {
          this.locations = response.data;
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      },
      // getLocations() {
      //   LocationServices.getAllLocations()
      //   .then(response => {
      //     this.locations = response.data;
      //   })
      //   .catch(error => {
      //     console.log("There was an error:", error.response)
      //   });
      // },
      deleteLocation(id, name) {
        let confirmed = confirm(`Are you sure you want to delete ${name}`);
        if(confirmed) {
          LocationServices.deleteLocation(id)
          .then(() => {
            this.getLocations(this.start, this.length);
          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
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

