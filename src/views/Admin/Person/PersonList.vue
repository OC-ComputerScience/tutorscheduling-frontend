<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            v-if="isSuperAdmin"
            color="accent"
            class="mr-4"
            elevation="2"
            @click="addPerson"
          >
            Add
          </v-btn>

          <v-btn class="mr-4" @click="cancel"> Back </v-btn>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :search="search"
          :items="persons"
          :items-per-page="50"
          @click:row="rowClick"
        ></v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonServices from "@/services/personServices.js";

export default {
  name: "App",
  props: ["id"],
  components: {},
  data() {
    return {
      user: {},
      search: "",
      message: "People - click person to view or edit person.",
      persons: [],
      group: {},
      isSuperAdmin: false,
      headers: [
        { text: "ID", value: "id" },
        { text: "Name", value: "fullName" },
        { text: "Email Address", value: "email" },
      ],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId().then(() => {
      this.getPeopleForGroup();
    });
    this.findIfSuperAdmin();
  },
  methods: {
    findIfSuperAdmin() {
      let current = this.user.access.filter((access) =>
        access.name.includes(this.group.name)
      );
      for (let i = 0; i < current.length; i++) {
        if (current[i] === "superadmin" || current[i] === "Superadmin")
          this.isSuperAdmin = true;
      }
    },
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
    getPeopleForGroup() {
      PersonServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.persons = response.data;
          for (let i = 0; i < this.persons.length; i++) {
            this.persons[i].fullName =
              this.persons[i].fName + " " + this.persons[i].lName;
          }
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    getPrevious() {
      if (this.start >= this.length) {
        this.start -= this.length;
        this.getPersons(this.start, this.length);
      }
    },
    getNext() {
      if (this.courses.length === this.length) {
        this.start += this.length;
        this.getPersons(this.start, this.length);
      }
    },
    rowClick: function (item, row) {
      row.select(true);
      this.$router.push({
        name: "personView",
        params: { id: this.id, personId: item.id },
      });
    },
    addPerson() {
      this.$router.push({ name: "personAdd", params: { id: this.id } });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
