<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="personroles"
      sort-by="status"
      class="elevation-1"
      :expanded.sync="expanded"
      show-expand
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>{{ message }}</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">
                  Approve Application for {{ editedPerson.fName }}
                  {{ editedPerson.lName }}</span
                >
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-select
                        v-model="editedItem.status"
                        :items="StatusSelect"
                        label="Status"
                        required
                      >
                      </v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="close"> Cancel </v-btn>
                <v-btn color="accent" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="800">
            <v-card>
              <v-card-title class="text-h5"
                >Are you sure you want to delete {{ editedPerson.fName }}
                {{ editedPerson.lName }}'s application?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="accent" text @click="deleteItemConfirm">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <v-spacer></v-spacer>
        <td :colspan="headers.length">
          Phone Number: {{ item.phoneNum }}
          <br />
          Email Address: {{ item.email }}
        </td>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import Utils from "@/config/utils.js";
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";

export default {
  props: ["id"],
  data: () => ({
    message: "Approval - click tutor to approve or deny application",
    StatusSelect: ["Applied", "Approved", "Denied"],
    dialog: false,
    dialogDelete: false,
    expanded: [],
    user: {},
    group: {},
    headers: [
      { text: "First Name", value: "fName" },
      { text: "Last Name", value: "lName" },
      { text: "Status", value: "personrole[0].status" },
      { text: "Signed Contract", value: "personrole[0].agree" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    personroles: [],
    editedIndex: -1,
    editedPerson: {},
    editedItem: {
      status: "",
    },
    defaultItem: {
      status: "",
    },
  }),
  computed: {},
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId()
      .then(() => {
        this.getPersonRoles();
      })
      .catch((error) => {
        this.message = error.response.data.message;
      });
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
    getPersonRoles() {
      PersonServices.getPendingTutorsForGroup(this.group.id)
        .then((response) => {
          this.personroles = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    editItem(item) {
      this.editedIndex = this.personroles.indexOf(item.id);
      this.editedPerson = Object.assign({}, item);
      this.editedItem = Object.assign({}, item.personrole[0]);
      console.log(this.editedItem);
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.personroles.indexOf(item.id);
      this.editedPerson = Object.assign({}, item);
      this.editedItem = Object.assign({}, item.personrole[0]);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.personroles.splice(this.editedIndex, 1);
      PersonRoleServices.deletePersonRole(this.editedItem.id)
        .then(() => {
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });

      this.closeDelete();
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    save() {
      console.log(this.editedIndex);
      console.log(this.editedItem);
      PersonRoleServices.updatePersonRole(this.editedItem.id, this.editedItem)
        .then(() => {
          this.close();
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
      Object.assign(this.personroles[this.editedIndex], this.editedItem);
    },
  },
};
</script>
