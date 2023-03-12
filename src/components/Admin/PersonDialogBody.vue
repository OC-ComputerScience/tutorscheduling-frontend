<template>
  <v-card>
    <v-card-title class="primary white--text mb-6">{{
      isEdit ? "Edit Person" : "Add New Person"
    }}</v-card-title>
    <v-card-text>
      <v-text-field
        id="fName"
        :value="person.fName"
        :counter="25"
        label="First Name"
      ></v-text-field>

      <v-text-field
        id="lName"
        :value="person.lName"
        :counter="25"
        label="Last Name"
      ></v-text-field>

      <v-text-field
        id="email"
        :value="person.email"
        :counter="50"
        label="Email"
      ></v-text-field>

      <v-text-field
        id="phoneNum"
        :value="person.phoneNum"
        :counter="50"
        label="Phone Number"
      ></v-text-field>
    </v-card-text>

    <v-card max-width="900px" class="mx-auto my-4">
      <v-card-title>
        Roles
        <v-spacer></v-spacer>
        <v-btn color="accent" class="mr-4" elevation="2"> Add </v-btn>
      </v-card-title>
      <v-data-table
        :headers="roleHeaders"
        :items="personroles"
        :items-per-page="50"
      >
        <template #[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editRole(item)">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey white--text" @click="$emit('closePersonDialog')">
        {{ isEdit ? "Discard Changes" : "Cancel" }}
      </v-btn>
      <v-btn color="accent" @click="saveOrAddPerson()">{{
        isEdit ? "Save Changes" : "Add Person"
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import PersonServices from "@/services/personServices.js";
import RoleServices from "@/services/roleServices.js";

export default {
  name: "PersonDialogBody",
  components: {},
  props: {
    sentBool: { type: [Boolean], default: false },
    sentPerson: {
      type: [Object],
      default() {
        return {
          fName: "",
          lName: "",
          email: "",
          phoneNum: "",
          textOptIn: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
    },
    sentGroup: {
      type: [Object],
      default() {
        return {
          id: 1,
          name: "",
          description: "",
        };
      },
    },
  },
  data() {
    return {
      person: this.sentPerson,
      group: this.sentGroup,
      isEdit: this.sentBool,
      roleHeaders: [
        { text: "Type", value: "type" },
        { text: "Status", value: "personrole[0].status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      personroles: [],
      personrole: {},
      personroleprivileges: [],
      personroleprivilege: {},
    };
  },
  watch: {
    sentPerson(newPerson) {
      this.person = newPerson;
    },
    sentBool(newVal) {
      this.isEdit = newVal;
    },
    sentGroup(newGroup) {
      this.group = newGroup;
    },
  },
  created() {},
  methods: {
    saveOrAddPerson() {
      this.person.fName = document.getElementById("fName").value;
      this.person.lName = document.getElementById("lName").value;
      this.person.email = document.getElementById("email").value;
      this.person.phoneNum = document.getElementById("phoneNum").value;
      this.person.textOptIn = document.getElementById("textOptIn").value;

      if (this.isEdit) {
        this.person.updatedAt = new Date();
      }

      this.$emit("saveOrAddPerson", this.person, this.isEdit);
    },
    async getPerson() {
      await PersonServices.getPerson(this.personId)
        .then((response) => {
          this.person = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getPersonRoles() {
      this.personroleprivileges = [];
      await RoleServices.getRoleByGroupForPerson(this.group.id, this.personId)
        .then(async (response) => {
          this.personroles = response.data;
          for (let i = 0; i < this.personroles.length; i++) {
            let personRoleArray = this.personroles[i].personrole;
            // set tutor boolean
            if (this.personroles[i].type.includes("Tutor")) this.tutor = true;
            // set up personroleprivilege array
            for (let j = 0; j < personRoleArray.length; j++) {
              let pr = personRoleArray[j];
              for (let k = 0; k < pr.personroleprivilege.length; k++) {
                let priv = pr.personroleprivilege[k];
                priv.associatedRole = this.personroles[i].type;
                this.personroleprivileges.push(priv);
                // can't do what's below because multiple roles may need the same privilege
                // this.privileges = this.privileges.filter(privilege => privilege !== priv.privilege)
              }
            }
          }
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
  },
};
</script>
