
<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.role.type }}</v-toolbar-title>
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
        @click="deleteRole(role.id, role.name)"
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
        v-model="role.type"
        id="type"
        :counter="50"
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
import RoleServices from "@/services/roleServices.js";
import GroupServices from "@/services/groupServices.js";

//import UserDisplay from '@/components/UserDisplay.vue'
export default {
  props: ["id"],

  data() {
    return {
      role: {},
      group: {},
    };
  },
  created() {
    RoleServices.getRole(this.id)
      .then((response) => {
        this.role = response.data;
        GroupServices.getGroup(this.role.groupId)
          .then((response) => {
            this.group = response.data;
            console.log(response.data);
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });
          console.log(response.data);
        })
      .catch((error) => {
        console.log("There was an error:", error.response);
      });
  },
  methods: {
    deleteRole(id, name) {
      let confirmed = confirm(`Are you sure you want to delete ${name}`);
      if (confirmed) {
        RoleServices.deleteRole(id)
          .then(() => {
            this.$router.push({ name: "roleList" });
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
      this.$router.push({ name: "roleEdit", params: { id: this.role.id } });
    },
  },
};
</script>
