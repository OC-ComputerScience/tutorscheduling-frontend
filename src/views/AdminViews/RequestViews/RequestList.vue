<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="requests"
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
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="accent" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <br />
        <td :colspan="headers.length">
          Topic: {{ item.topic.name }} <br />
          Class Num: {{ item.courseNum }} <br />
          Description: {{ item.description }}
        </td>
        <br />
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import Utils from "@/config/utils.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import RequestServices from "@/services/requestServices.js";

export default {
  props: ["id"],
  data() {
    return {
      expanded: [],
      message: "Requests",
      StatusSelect: ["Received", "In-Progress", "Completed"],
      dialog: false,
      dialogDelete: false,
      user: {},
      headers: [
        { text: "Person's Name", value: "fullName" },
        { text: "Problem", value: "problem" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      requests: [],
      editedIndex: -1,
      editedItem: {
        status: "",
      },
      defaultItem: {
        status: "",
      },
    };
  },
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
        this.getRequestsForGroup();
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
    getRequestsForGroup() {
      RequestServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.requests = response.data;
          for (let i = 0; i < this.requests.length; i++) {
            this.requests[i].fullName =
              this.requests[i].person.fName +
              " " +
              this.requests[i].person.lName;
          }
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    editItem(item) {
      this.editedIndex = this.requests.indexOf(item.id);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.requests.indexOf(item.id);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      this.requests.splice(this.editedIndex, 1);
      RequestServices.deleteRequest(this.editedItem.id)
        .then(() => {
          this.getTopics(this.start, this.length);
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
      RequestServices.updateRequest(this.editedItem.id, this.editedItem)
        .then(() => {
          this.close();
          this.getRequestsForGroup();
        })
        .catch((error) => {
          console.log(error);
        });
      Object.assign(this.requests[this.editedIndex], this.editedItem);
    },
  },
};
</script>
