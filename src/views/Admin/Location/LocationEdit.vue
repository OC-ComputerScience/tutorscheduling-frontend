<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <br />

      <v-dialog v-model="showDisableConfirmation" persistent max-width="750px">
        <DeleteConfirmationComponent
          type="location"
          :item="location"
          @handleReturningCancel="showDisableConfirmation = false"
          @handleReturningSuccess="updateLocation()"
        ></DeleteConfirmationComponent>
      </v-dialog>

      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          id="name"
          v-model="location.name"
          :counter="40"
          label="Location Name"
          required
        ></v-text-field>

        <v-text-field
          id="building"
          v-model="location.building"
          :counter="40"
          label="Building"
          required
        ></v-text-field>

        <v-text-field
          id="description"
          v-model="location.description"
          :counter="200"
          label="Description of Location"
          required
        ></v-text-field>

        <v-select
          v-model="location.status"
          :items="status"
          label="Status"
          required
          @change="statusChanged = true"
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
          @click="directToCancel()"
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
import DeleteConfirmationComponent from "../../../components/DeleteConfirmationComponent.vue";
import Utils from "@/config/utils.js";

export default {
  components: {
    DeleteConfirmationComponent,
  },
  props: {
    id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showDisableConfirmation: false,
      statusChanged: false,
      valid: false,
      user: {},
      message: "Edit Location - make updates to the fields and click Save",
      location: {},
      groups: [],
      types: ["Online", "In-Person"],
      status: ["active", "disabled"],
      roles: ["admin"],
    };
  },
  created() {
    this.user = Utils.getStore("user");
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
    directToCancel() {
      if (this.location.status === "disabled" && this.statusChanged) {
        this.showDisableConfirmation = true;
      } else {
        this.updateLocation();
      }
    },
    // only updating this replace issue once edits can be done on view page
    // also this.id is location id
    updateLocation() {
      LocationServices.updateLocation(this.location.id, this.location)
        .then(() => {
          this.$router.push({
            name: "locationList",
            params: { id: this.user.selectedRole.personRoleId },
          });
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
