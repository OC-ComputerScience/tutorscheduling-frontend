<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <br />
      <v-btn color="accent" elevation="2" class="mr-4" @click="toEdit">
        Edit
      </v-btn>

      <!-- <v-btn color="error" class="mr-4" @click="deleteRole(role.id, role.name)">
        Delete
      </v-btn> -->

      <v-btn class="mr-4" @click="cancel"> Back </v-btn>

      <br /><br />

      <v-text-field
        id="type"
        v-model="role.type"
        :counter="50"
        label="Type"
        readonly
      ></v-text-field>

      <v-text-field
        id="name"
        v-model="group.name"
        :counter="25"
        label="Group Name"
        readonly
      ></v-text-field>
    </v-container>
  </div>
</template>

<script>
import RoleServices from "@/services/roleServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
export default {
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
    roleId: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      role: {},
      group: {},
      message: "View Role - click Edit to update or Delete to remove topic",
    };
  },
  created() {
    this.getRole();
    this.getGroupByPersonRoleId();
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
    getRole() {
      RoleServices.getRole(this.roleId)
        .then((response) => {
          this.role = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    deleteRole(id, name) {
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        RoleServices.deleteRole(id)
          .then(() => {
            this.$router.push({ name: "roleList" });
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
      this.$router.push({ name: "roleEdit", params: { id: this.role.id } });
    },
  },
};
</script>
