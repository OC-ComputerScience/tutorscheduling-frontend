<template>
  <v-card>
    <v-card-title class="primary white--text mb-6">{{
      "Add a Privilege for " + personName
    }}</v-card-title>
    <v-card-text>
      <v-select
        id="privilege"
        v-model="selectedPrivilege.privilege"
        :items="privileges"
        label="Privilege"
      ></v-select>
      <v-select
        id="associatedRole"
        v-model="selectedPrivilege.personroleId"
        :items="personRoles"
        item-text="type"
        item-value="personrole[0].id"
        label="Associated Role"
      ></v-select>
    </v-card-text>

    <v-card-actions class="pb-4">
      <v-spacer></v-spacer>
      <v-btn
        color="grey white--text"
        @click="$emit('closePersonPrivilegeDialog')"
      >
        Cancel
      </v-btn>
      <v-btn color="accent" @click="addPersonRolePrivilege()">
        Add Privilege
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "PersonPrivilegeDialogBody",
  components: {},
  props: {
    sentPersonName: {
      type: [String],
      default: "test",
    },
    sentPersonRoles: {
      type: [Array],
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      personName: this.sentPersonName,
      personRoles: this.sentPersonRoles,
      privileges: [
        "Make flexible slots that allow for shorter appointments",
        "Receive notifications for applications",
        "Receive notifications for requests",
        "Sign up students for appointments",
      ],
      selectedPrivilege: {},
      selectedRole: "",
    };
  },
  watch: {
    sentPersonName(newPersonName) {
      this.personName = newPersonName;
    },
    sentPersonRoles(newPersonRoles) {
      this.personRoles = newPersonRoles;
    },
  },
  methods: {
    addPersonRolePrivilege() {
      this.$emit("addPersonRolePrivilege", this.selectedPrivilege);
    },
  },
};
</script>
