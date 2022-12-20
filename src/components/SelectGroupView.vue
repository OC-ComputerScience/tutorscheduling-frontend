<template>
  <div>
    <v-dialog v-if="this.user !== null" v-model="groupDialog" max-width="1000">
      <v-card tile>
        <v-card-title>
          {{ this.user.fName }}, which group would you like work in right now?
        </v-card-title>
        <br />
        <v-card-text>
          <v-row>
            <v-col v-for="group in groups" :key="group.id">
              <v-card
                class="mx-auto my-12 d-flex justify-center"
                v-bind:color="
                  selectedGroup === group.name ? 'primary' : 'grey lighten-2'
                "
                height="100"
                elevation="10"
                @click="
                  selectedGroup = group.name;
                  roles = group.role;
                ">
                <v-card-title
                  v-bind:class="
                    selectedGroup === group.name ? 'white--text' : 'black--text'
                  ">
                  {{ group.name }}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            :disabled="selectedGroup === ''"
            @click="
              groupDialog = false;
              if (roles.length > 1) roleDialog = true;
              else saveGroupRoleSelection();
            ">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-if="this.user !== null" v-model="roleDialog" max-width="800">
      <v-card tile>
        <v-card-title>
          {{ this.user.fName }}, what would you like to do right now?
        </v-card-title>
        <br />
        <v-card-text>
          <v-row align-center>
            <v-col
              v-for="role in roles"
              :key="role.id"
              class="d-flex justify-center align-center">
              <v-btn
                v-bind:color="
                  role.type == 'Student'
                    ? '#EE5044'
                    : role.type == 'Tutor'
                    ? '#196CA2'
                    : 'grey lighten-2'
                "
                x-large
                @click="selectedRole = role.type"
                class="white--text">
                {{ role.type }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="accent"
            text
            @click="
              roleDialog = false;
              groupDialog = true;
              selectedRole = '';
            ">
            Back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            @click="
              roleDialog = false;
              groupDialog = true;
              saveGroupRoleSelection();
            ">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import GroupServices from "@/services/groupServices";
import RoleServices from "@/services/roleServices";
import Utils from "@/config/utils.js";

export default {
  name: "SelectGroupView",
  data() {
    return {
      roleDialog: false,
      groupDialog: true,
      selectedRole: "",
      selectedGroup: "",
      groups: [],
      roles: [],
      personroles: [],
      user: {},
    };
  },
  created() {
    this.user = Utils.getStore("user");
    this.getPersonGroups();
  },
  methods: {
    async getPersonRoles() {
      await RoleServices.getRoleForPerson(this.user.userID)
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let role = response.data[i];
            this.personroles.push(role);
          }
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      console.log(this.personroles);
    },
    async getPersonGroups() {
      await GroupServices.getGroupsForPerson(this.user.userID)
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      console.log(this.groups);
    },
    saveGroupRoleSelection() {
      console.log("in save group role selection");
      this.user.selectedGroup = this.selectedGroup;
      if (this.selectedRole === "") this.user.selectedRole = this.roles[0].type;
      else this.user.selectedRole = this.selectedRole;
      Utils.setStore("user", this.user);
    },
  },
};
</script>
