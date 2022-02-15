
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.role.type }}</v-toolbar-title>
      </v-toolbar>
      <br>
    <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="role.type"
        id="type"
        :counter="50"
        label="Name"
        required
      ></v-text-field>
    
      <v-select
        v-model="role.groupId"
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
        @click="updateRole"
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
import RoleServices from "@/services/roleServices.js";
import GroupServices from "@/services/groupServices.js";

export default {
  props: ["id"],

  data() {
    return {
      role: {},
      group: {},
      groups: {},
      message: "Make updates to the Role",
        roles: [
        'admin'
      ],
    };
  },
  created() {
    RoleServices.getRole(this.id)
      .then((response) => {
        this.role = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      }),
    GroupServices.getGroup(this.groupid)
      .then((response) => {
        this.group = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log("There was an error:", error.response);
      }),
    GroupServices.getAllGroups()
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
      });
  },

  methods: {
    updateRole() {
      RoleServices.updateRole(this.id, this.role)
        .then(() => {
          this.$router.go(-1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
