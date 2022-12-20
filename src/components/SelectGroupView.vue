<template>
  <div>
    <v-overlay color="white" :absolute="absolute" :opacity="opacity">
    </v-overlay>
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
                  selectedRole.type == 'Student' && selectedRole.id == role.id
                    ? '#EE5044'
                    : selectedRole.type == 'Tutor' && selectedRole.id == role.id
                    ? '#196CA2'
                    : 'grey lighten-2'
                "
                x-large
                @click="selectedRole = role"
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
              selectedRole = Object;
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
import Utils from "@/config/utils.js";

export default {
  name: "SelectGroupView",
  data() {
    return {
      absolute: true,
      opacity: 1,
      groupDialog: false,
      roleDialog: false,
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
    this.openDialogsOrRedirect();
  },
  methods: {
    async getPersonGroups() {
      await GroupServices.getGroupsForPerson(this.user.userID)
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
      console.log(this.groups[0]);
    },
    openDialogsOrRedirect() {
      if (this.groups.length > 1) this.groupDialog = true;
      else {
        this.selectedGroup = this.groups[0].name;
        this.roles = this.groups[0].role;
        this.saveGroupRoleSelection();
      }
    },
    saveGroupRoleSelection() {
      this.user.selectedGroup = this.selectedGroup;
      if (this.selectedRole.type === undefined) {
        this.selectedRole = this.roles[0];
      }
      // formated selected role
      this.user.selectedRole = {
        type: this.selectedRole.type,
        personRoleId: this.selectedRole.personrole[0].id,
      };
      Utils.setStore("user", this.user);
      if (this.selectedRole.type === "Student") {
        this.$router.push({
          name: "studentHome",
          params: { id: this.selectedRole.personrole[0].id },
        });
      } else if (this.selectedRole.type === "Tutor") {
        this.$router.push({
          name: "tutorHome",
          params: { id: this.selectedRole.personrole[0].id },
        });
      }
    },
  },
};
</script>
