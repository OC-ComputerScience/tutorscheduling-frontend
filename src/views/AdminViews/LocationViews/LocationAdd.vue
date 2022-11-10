
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
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
        v-model="location.status"
        :items="status"
        label="Status"
        required
      >
      </v-select>

      <!-- group should be readonly -->
      <v-text-field
        v-model="this.user.selectedGroup"
        id="this.group.id"
        label="Group"
        readonly
      ></v-text-field>

      <!-- <v-select
        v-model="location.groupId"
        :items="groups"
        item-text="name"
        item-value="id"
        label="Group"
        required
      >
      </v-select> -->

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
import Utils from '@/config/utils.js'
import LocationServices from "@/services/locationServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

export default {
  props: ["id"],
  data() {
    return {
      message : 'Add Location - enter data and click Save',
      valid: true,
      location: {},
      group: {},
      user: {},
      types: ["Online", "In-Person"],
      status: ["enabled", "disabled"],
      roles: [
        'admin'
      ],
    };
  },
  created() {
    this.user = Utils.getStore('user');
    this.getGroupByPersonRoleId();
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
    addLocation() {
      this.location.groupId = this.group.id;
      LocationServices.addLocation(this.location)
        .then(() => {
          this.$router.push({ name: "locationList" });
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "locationList" });
    }
  },
};
</script>
