<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-btn color="accent" elevation="2" class="mr-4" @click="toEdit">
        Edit
      </v-btn>

      <v-btn
        color="error"
        class="mr-4"
        @click="deleteLocation(location.id, location.name)"
      >
        Delete
      </v-btn>

      <v-btn class="mr-4" @click="cancel"> Back </v-btn>

      <br /><br />

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
        v-model="location.status"
        id="status"
        :counter="25"
        label="Status"
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
import PersonRoleServices from "@/services/personRoleServices.js";

export default {
  props: ["id", "locationId"],

  data() {
    return {
      location: {},
      group: {},
      message:
        "View Location - click Edit to update or Delete to remove location",
    };
  },
  async created() {
    await this.getGroupByPersonRoleId();
    this.getLocation();
  },
  methods: {
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getLocation() {
      LocationServices.getLocation(this.locationId)
        .then((response) => {
          this.location = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    deleteLocation(id, name) {
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        LocationServices.deleteLocation(id)
          .then(() => {
            this.$router.push({ name: "locationList" });
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response);
          });
      }
    },
    cancel() {
      this.$router.go(-1);
    },
    toEdit() {
      this.$router.push({
        name: "locationEdit",
        params: { id: this.location.id },
      });
    },
  },
};
</script>
