
<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.location.name }}</v-toolbar-title>
      </v-toolbar>
      <br>
      <v-btn
        color="accent"
        elevation="2"
        class="mr-4"
        @click="toEdit"
      >
        Edit
      </v-btn>

      <v-btn
          color="error"
          class="mr-4"
          @click="deleteLocation(location.id, location.name)"
        >
          Delete
      </v-btn>

      <v-btn
          class="mr-4"
          @click="cancel"
        >
          Back
      </v-btn>

      <br><br>

      <v-text-field
        v-model="location.name"
        id="name"
        :counter="40"
        label="Location Name"
        readonly
      ></v-text-field>
        
      <v-text-field
        v-model="location.building"
        id="building"
        :counter="40"
        label="Building"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="location.description"
        id="description"
        :counter="200"
        label="Description of Location"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="location.type"
        id="type"
        :counter="25"
        label="Type"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="group.name"
        id="name"
        :counter="25"
        label="Group Name"
        readonly
      ></v-text-field>
    </v-container>
  </div>
</template>

<script>
import LocationServices from "@/services/locationServices.js";
import GroupServices from "@/services/groupServices.js";
//import UserDisplay from '@/components/UserDisplay.vue'
export default {
  props: ["id"],

  data() {
    return {
      location: {},
      group: {},
    };
  },
  created() {
    LocationServices.getLocation(this.id)
      .then((response) => {
        this.location = response.data;
        GroupServices.getGroup(this.location.groupId)
          .then((response) => {
            this.group = response.data;
            console.log(response.data);
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });
          console.log(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
  },
  methods: {
    deleteLocation(id, name) {
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        LocationServices.deleteLocation(id)
          .then(() => {
            this.$router.push({ name: "locationList" });
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });
      }
    },
    cancel() {
      this.$router.go(-1);
    },
    toEdit() {
      this.$router.push({ name: "locationEdit", params: { id: this.location.id } });
    },
  },
};
</script>
