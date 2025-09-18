<template>
        <div>
          <v-row class="pa-5" justify="center" align="center">
          
              <v-btn v-for="group in groups" :key="group.id"
              v-if="selectedGroup != group.name"
              rounded       
              color = 'grey lighten-2'
              @click="directToRole(group)"
            >
              Change to {{ group.name }} {{title}}
              </v-btn>
         
          </v-row>
        </div>   
</template>

<script>
import GroupServices from "@/services/groupServices";
import Utils from "@/config/utils.js";

export default {
  name: "ChangeGroupViewComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      absolute: true,
      opacity: 1,
      selectedRole: {},
      selectedGroup: "",
      groups: [],
      roles: [],
      user: {},
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getPersonGroups();
    this.selectedGroup = this.user.selectedGroup;

  },
  methods: {
    directToRole(group) {
      this.selectedGroup = group.name;
      this.roles = group.role;
      this.saveGroupRoleSelection(this.roles[0]);
      const currentRoute = this.$router.currentRoute;
      this.$router.go();
      
    },
      
    async getPersonGroups() {
      await GroupServices.getActiveGroupsForPerson(this.user.userID)
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    
    saveGroupRoleSelection(role) {
      this.selectedRole = role;
      this.roleDialog = false;
      this.groupDialog = true;
      this.user.selectedGroup = this.selectedGroup;
      if (this.selectedRole.type === undefined) {
        this.selectedRole = this.roles[0];
      }
      // formatted selected role
      this.user.selectedRole = {
        type: this.selectedRole.type,
        personRoleId: this.selectedRole.personrole[0].id,
      };
      Utils.setStore("user", this.user);
      
    },
  },
};
</script>
