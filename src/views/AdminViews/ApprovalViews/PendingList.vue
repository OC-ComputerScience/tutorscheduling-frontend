<template>
  <div>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>{{this.message}}</v-toolbar-title>
    </v-toolbar>
    <br><br>
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
            class="mr-4"
            @click="cancel()"
          >
            Back
        </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :search="search"
        :items="personroles"
        :items-per-page="50"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>Approve Application for {{ editedPerson.fName }} {{ editedPerson.lName }}</v-card-title>
        <v-card-text>
          <br>
          <v-form ref="form" v-model="valid" lazy validation>
            <v-data-table
              :headers="topicHeaders"
              :items="editedPerson.persontopic"
              :hide-default-footer="true"
            >
            </v-data-table>

            <br>
            <v-text-field
              v-model="editedPerson.email"
              label="Email Address"
              readonly
            ></v-text-field>

            <v-text-field
              v-model="editedPerson.phoneNum"
              label="Phone Number"
              readonly
            ></v-text-field>

            <v-select
              v-model="editedItem.status"
              :items="StatusSelect"
              label="Status"
              required
            >
            </v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="accent" @click="save()">Save</v-btn>
          <v-btn color="error" @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        
    <v-dialog v-model="dialogDelete" max-width="800">
      <v-card>
        <v-card-title class="text-h5">Are you sure you want to delete {{ editedPerson.fName }} {{ editedPerson.lName }}'s application?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeDelete">Cancel</v-btn>
          <v-btn color="accent" text @click="deleteItemConfirm">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

  export default {
    props: ["id"],
    data: () => ({
      valid: false,
      message: 'Approval - click tutor to approve or deny application',
      StatusSelect: ['applied', 'approved', 'disabled'],
      dialog: false,
      dialogDelete: false,
      expanded: [],
      user: {},
      search: '',
      group: {},
      headers: [
        { text: "First Name", value: "fName" },
        { text: "Last Name", value: "lName" },
        { text: "Status", value: "personrole[0].status" },
        { text: "Signed Contract", value: "personrole[0].agree" },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      personroles: [],
      topicHeaders: [
        { text: "Topic", value: "topic.name" },
        { text: "Skill Level", value: "skillLevel"}
      ],
      persontopics: [],
      editedIndex: -1,
      editedPerson: {},
      editedItem: {
        status: '',
      },
      defaultItem: {
        status: '',
      },
    }), 
    computed: {
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
    async created () {
      this.user = Utils.getStore('user');
      await this.getGroupByPersonRoleId()
      .then(() => {
        this.getPersonRoles();
      })
      .catch (error => {
        this.message = error.response.data.message
      })
    },
    methods: {
      async getGroupByPersonRoleId() {
        await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      getPersonRoles() {
        PersonServices.getPendingTutorsForGroup(this.group.id)
        .then((response) => {
          this.personroles = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      },
      editItem (item) {
        this.editedIndex = this.personroles.indexOf(item.id)
        this.editedPerson = Object.assign({}, item)
        this.editedItem = Object.assign({}, item.personrole[0])
        this.dialog = true
      },
      deleteItem (item) {
        this.editedIndex = this.personroles.indexOf(item.id)
        this.editedPerson = Object.assign({}, item)
        this.editedItem = Object.assign({}, item.personrole[0])
        this.dialogDelete = true
      },
      deleteItemConfirm () {
        this.personroles.splice(this.editedIndex, 1)
        PersonRoleServices.deletePersonRole(this.editedItem.id)
        .then(() => {
          this.getPersonRoles();
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
        
        this.closeDelete()
      },
      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      save() {
        PersonRoleServices.updatePersonRole(this.editedItem.id, this.editedItem)
        .then(() => {
          this.close()
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log(error);
        });
        Object.assign(this.personroles[this.editedIndex], this.editedItem)
      },
      cancel() {
        this.$router.go(-1);
      },
    },
  }
</script>
