<template>
  <v-card>
    <v-card-title class="primary white--text mb-6">{{
      isEdit
        ? "Edit " + person.fName + " " + person.lName + " in " + group.name
        : "Add New Person to " + group.name
    }}</v-card-title>
    <v-card-text>
      <v-text-field
        id="fName"
        required
        :value="person.fName"
        :counter="25"
        label="First Name"
      ></v-text-field>

      <v-text-field
        id="lName"
        required
        :value="person.lName"
        :counter="25"
        label="Last Name"
      ></v-text-field>

      <v-text-field
        id="email"
        required
        :value="person.email"
        :counter="50"
        label="Email"
        :rules="[
          (v) => !!v || 'This field is required',
          (v) =>
            /^\S+@\S+$/.test(v) || 'Must contain an @ followed by a domain',
          (v) =>
            (!!v && v.split('@').pop() === 'oc.edu') ||
            (!!v && v.split('@').pop() === 'eagles.oc.edu') ||
            'Must be a valid OC domain (oc.edu or eagles.oc.edu)',
        ]"
      ></v-text-field>

      <v-text-field
        id="phoneNum"
        required
        :value="person.phoneNum"
        :counter="10"
        label="Phone Number"
        :rules="[
          (v) => !!v || 'This field is required',
          (v) => (!!v && v.length >= 10) || 'Number too short',
          (v) => (!!v && v.length <= 10) || 'Number too long',
          (v) => /^[0-9]+$/.test(v) || 'Must contain only numbers',
        ]"
      ></v-text-field>

      <v-checkbox v-model="person.textOptIn" label="Text Opt In"></v-checkbox>
    </v-card-text>

    <v-row max-width="900px" class="mx-6 mb-4">
      <v-col cols="12" max-width="900px">
        <v-row max-width="900px">
          <v-col cols="12" max-width="900px">
            <v-card>
              <v-card-title>
                Roles
                <v-spacer></v-spacer>
                <v-btn color="accent" elevation="2"> Add </v-btn>
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
          </v-col>
        </v-row>
        <v-row max-width="900px">
          <v-col cols="6">
            <v-card class="mx-auto">
              <v-card-title>
                Additional Privileges
                <v-spacer></v-spacer>
                <v-btn
                  color="accent"
                  elevation="2"
                  @click="dialogPrivilegeAdd = true"
                >
                  Add
                </v-btn>
              </v-card-title>
              <v-data-table
                :headers="privilegeHeaders"
                :items="personroleprivileges"
                :items-per-page="50"
              >
                <template #[`item.actions`]="{ item }">
                  <v-icon
                    small
                    @click="
                      deleteType = 'privilege';
                      directToCancel(item);
                    "
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="mx-auto">
              <v-card-title>
                Topics
                <v-spacer></v-spacer>
                <v-btn
                  color="accent"
                  elevation="2"
                  @click="dialogTopicAdd = true"
                >
                  Add
                </v-btn>
              </v-card-title>
              <v-data-table
                :headers="topicHeaders"
                :items="persontopics"
                :items-per-page="50"
              >
                <template #[`item.actions`]="{ item }">
                  <v-icon small class="mr-2" @click="editTopic(item)">
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    @click="
                      deleteType = 'persontopic';
                      directToCancel(item);
                    "
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-card-actions class="pb-4">
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
import RoleServices from "@/services/roleServices.js";
import TopicServices from "@/services/topicServices.js";

export default {
  name: "PersonDialogBody",
  components: {},
  props: {
    sentBool: { type: [Boolean], default: false },
    sentPerson: {
      type: [Object],
      default() {
        return {
          id: 1,
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
      tutor: false,
      group: this.sentGroup,
      isEdit: this.sentBool,
      roleHeaders: [
        { text: "Type", value: "type" },
        { text: "Status", value: "personrole[0].status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      topicHeaders: [
        { text: "Name", value: "name" },
        { text: "Skill Level", value: "persontopic[0].skillLevel" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      privilegeHeaders: [
        { text: "Privilege", value: "privilege" },
        { text: "Associated Role", value: "associatedRole" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      personroles: [],
      personrole: {},
      personroleprivileges: [],
      personroleprivilege: {},
      persontopics: [],
      persontopic: {},
    };
  },
  watch: {
    async sentPerson(newPerson) {
      this.person = newPerson;
      await this.getPersonRoles();
      if (this.tutor) {
        await this.getPersonTopics();
      }
    },
    sentBool(newVal) {
      this.isEdit = newVal;
    },
    sentGroup(newGroup) {
      this.group = newGroup;
    },
  },
  async created() {
    if (this.sentPerson) {
      await this.getPersonRoles();
      if (this.tutor) {
        await this.getPersonTopics();
      }
    }
  },
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
    async getPersonRoles() {
      this.personroleprivileges = [];
      await RoleServices.getRoleByGroupForPerson(
        this.group.id,
        this.sentPerson.id
      )
        .then(async (response) => {
          console.log(response);
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
    async getPersonTopics() {
      await TopicServices.getTopicByGroupForPerson(
        this.group.id,
        this.sentPerson.id
      )
        .then((response) => {
          this.persontopics = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
  },
};
</script>
