<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          v-model="role.type"
          id="type"
          :counter="50"
          label="Type"
          hint="Type"
          persistent-hint
          required
        ></v-text-field>

        <!-- group should be readonly -->
        <v-text-field
          v-model="this.user.selectedGroup"
          id="this.group.id"
          label="Group"
          readonly
        ></v-text-field>

        <v-btn :disabled="!valid" color="success" class="mr-4" @click="addRole">
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import RoleServices from "@/services/roleServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

export default {
  components: {},
  props: ["id"],
  data() {
    return {
      valid: true,
      role: {},
      group: {},
      user: {},
      roles: ["admin"],
      message: "Add Role - enter data and click Save",
    };
  },
  created() {
    this.user = Utils.getStore("user");
    this.getGroupByPersonRoleId();
    //this.getAllGroups();
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
    addRole() {
      this.role.groupId = this.group.id;
      RoleServices.addRole(this.role)
        .then(() => {
          this.$router.push({ name: "roleList", params: { id: this.id } });
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
    },
    cancel() {
      this.$router.push({ name: "roleList", params: { id: this.id } });
    },
  },
};
</script>
