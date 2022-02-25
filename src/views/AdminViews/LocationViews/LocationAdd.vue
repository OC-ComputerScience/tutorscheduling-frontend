
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Add Location</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="location.name"
        id="name"
        :counter="40"
        label="Location Name"
        hint="Location Name"
        persistent-hint
        required
      ></v-text-field>
      
      <v-text-field
        v-model="location.building"
        id="building"
        :counter="40"
        label="Building"
        hint="Build Name and Number"
        persistent-hint
        required
      ></v-text-field>

      <v-text-field
        v-model="location.description"
        id="description"
        :counter="200"
        label="Description of Location"
        hint="Description of Location"
        persistent-hint
        required
      ></v-text-field>

      <v-select
        v-model="location.type"
        :items="types"
        label="Type"
        required
      >
      </v-select>

      <v-select
        v-model="location.groupId"
        :items="groups"
        item-text="name"
        item-value="id"
        label="Group"
        required
      >
      </v-select>

      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="addLocation"
      >
        Save
      </v-btn>

      <v-btn
        color="error"
        class="mr-4"
        @click="cancel"
      >
        Cancel
      </v-btn>
    </v-form>
    </v-container>
  </div>
</template>

<script>
import LocationServices from "@/services/locationServices.js";
import GroupServices from "@/services/groupServices.js";

export default {
  data() {
    return {
      location: {},
      groups: [],
      types: ["Online", "In-Person"],
      roles: [
        'admin'
      ],
    };
  },
  created() {
    this.getAllGroups();
  },
  methods: {
    getAllGroups() {
      GroupServices.getAllGroups()
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    addLocation() {
      LocationServices.addLocation(this.location)
        .then(() => {
          this.$router.push({ name: "locationList" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "locationList" });
    }
  },
};
</script>