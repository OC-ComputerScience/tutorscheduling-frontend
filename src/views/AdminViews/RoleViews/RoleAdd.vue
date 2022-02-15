
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Add Role</v-toolbar-title>
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
        label="Type"
        hint="Type"
        persistent-hint
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
        @click="addRole"
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
  components: {
  },
  data() {
    return {
      role: {},
      groups: [],
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
    addRole() {
      RoleServices.addRole(this.role)
        .then(() => {
          this.$router.push({ name: "roleList" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "roleList" });
    }
  },
};
</script>