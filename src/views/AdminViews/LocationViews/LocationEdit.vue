<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          v-model="location.name"
          id="name"
          :counter="40"
          label="Location Name"
          required
        ></v-text-field>

        <v-text-field
          v-model="location.building"
          id="building"
          :counter="40"
          label="Building"
          required
        ></v-text-field>

        <v-text-field
          v-model="location.description"
          id="description"
          :counter="200"
          label="Description of Location"
          required
        ></v-text-field>

        <v-select
          v-model="location.status"
          :items="status"
          label="Status"
          required
        >
        </v-select>

        <v-select v-model="location.type" :items="types" label="Type" required>
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
          @click="updateLocation"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import LocationServices from "@/services/locationServices.js";
import GroupServices from "@/services/groupServices.js";

export default {
  props: ["id"],

  data() {
    return {
      valid: false,
      message: "Edit Location - make updates to the fields and click Save",
      location: {},
      groups: [],
      types: ["Online", "In-Person"],
      status: ["active", "disabled"],
      roles: ["admin"],
    };
  },
  created() {
    LocationServices.getLocation(this.id)
      .then((response) => {
        this.location = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message;
        console.log("There was an error:", error.response);
      });
    GroupServices.getAllGroups()
      .then((response) => {
        this.groups = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message;
        console.log("There was an error:", error.response);
      });
  },

  methods: {
    // only updating this replace issue once edits can be done on view page
    // also this.id is location id
    updateLocation() {
      LocationServices.updateLocation(this.location.id, this.location)
        .then(() => {
          this.$router.go(-1);
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
