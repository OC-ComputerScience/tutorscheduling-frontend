<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="View requests from people in your group and mark them as In-Progress or Completed appropriately."
        ></InformationComponent>
      </v-toolbar>
      <br />
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        alert
      }}</v-alert>
      <br />
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
          <v-btn class="mr-4" @click="cancel()"> Back </v-btn>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :search="search"
          :items="requests"
          :items-per-page="50"
        >
          <template #[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)"
              >mdi-pencil</v-icon
            >
            <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title
            >Request from {{ editedItem.fullName }} on
            {{ editedItem.date }}</v-card-title
          >
          <v-card-text>
            <br />
            <v-form ref="form" v-model="valid" lazy validation>
              <v-text-field
                v-model="editedItem.date"
                label="Date"
                readonly
              ></v-text-field>
              <v-text-field
                v-model="editedItem.time"
                label="Time"
                readonly
              ></v-text-field>
              <v-text-field
                v-model="editedItem.fullName"
                label="Student"
                readonly
              ></v-text-field>
              <v-text-field
                v-model="editedItem.problem"
                label="Problem"
                readonly
              ></v-text-field>

              <v-text-field
                v-if="
                  editedItem.topic !== null && editedItem.topic !== undefined
                "
                v-model="editedItem.topic.name"
                label="Topic"
                readonly
              ></v-text-field>

              <v-text-field
                v-model="editedItem.courseNum"
                label="Course Number"
                readonly
              ></v-text-field>

              <v-text-field
                v-model="editedItem.description"
                label="Description"
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

      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title>Confirming Deletion:</v-card-title>
          <v-card-text>
            <h2>{{ deleteMessage }}</h2>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="dialogDelete = false">Cancel</v-btn>
            <v-btn color="accent" @click="confirmedDelete()">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import Utils from "@/config/utils.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import RequestServices from "@/services/requestServices.js";
import InformationComponent from "../../components/InformationComponent.vue";

export default {
  name: "AdminRequests",
  components: {
    InformationComponent,
  },
  props: ["id"],
  data() {
    return {
      valid: false,
      search: "",
      showAlert: false,
      alert: "",
      alertType: "success",
      deleteMessage: "",
      deleteId: -1,
      expanded: [],
      message: "Requests",
      StatusSelect: ["Received", "In-Progress", "Completed"],
      dialog: false,
      dialogDelete: false,
      user: {},
      headers: [
        { text: "Date", value: "date" },
        { text: "Time", value: "time" },
        { text: "Student", value: "fullName" },
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
    await this.getGroupByPersonRoleId();
    await this.getRequestsForGroup();
  },
  methods: {
    async getGroupByPersonRoleId() {
      await PersonRoleServices.getGroupForPersonRole(this.id)
        .then(async (response) => {
          this.group = response.data[0].role.group;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async getRequestsForGroup() {
      await RequestServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.requests = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });

      for (let i = 0; i < this.requests.length; i++) {
        if (
          this.requests[i].topic === null ||
          this.requests[i].topic === undefined
        ) {
          this.requests[i].topic = {
            name: "None",
          };
        }

        if (
          this.requests[i].courseNum === null ||
          this.requests[i].courseNum === undefined
        ) {
          this.requests[i].courseNum = "None";
        }

        this.requests[
          i
        ].fullName = `${this.requests[i].person.fName} ${this.requests[i].person.lName}`;
        this.requests[i].date = this.requests[i].createdAt.slice(0, 10);
        this.requests[i].time = this.calcTime(
          this.requests[i].createdAt.slice(11, 19)
        );
      }

      this.requests.sort(function (a, b) {
        if (a.createdAt < b.createdAt) {
          return -1;
        }
        if (a.createdAt > b.createdAt) {
          return 1;
        }
        return 0;
      });
    },
    editItem(item) {
      this.editedIndex = this.requests.findIndex(
        (element) => element.id === item.id
      );
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      this.deleteMessage = `Are you sure you want to delete this request made by ${item.fullName}?`;
      this.alert =
        "You have successfully deleted " + item.fullName + "'s request.";
      this.deleteId = item.id;
      this.dialogDelete = true;
    },
    async confirmedDelete() {
      await RequestServices.deleteRequest(this.deleteId)
        .then(() => {
          this.getRequestsForGroup();
          this.closeDelete();
          this.alertType = "success";
          this.showAlert = true;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
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
    async save() {
      await RequestServices.updateRequest(this.editedItem.id, this.editedItem)
        .then(() => {
          this.getRequestsForGroup();
          this.alertType = "success";
          this.alert =
            "You have successfully updated " +
            this.editedItem.fullName +
            "'s request.";
          this.showAlert = true;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
      Object.assign(this.requests[this.editedIndex], this.editedItem);
      this.close();
    },
    calcTime(time) {
      if (time == null) {
        return null;
      }
      let temp = time.split(":");
      let milHours = parseInt(temp[0]);
      let minutes = temp[1];
      let hours = milHours - 5; // subtract 5 to fix how datetimes are saved
      hours = ((hours % 24) + 24) % 24; // fix it calculating negative numbers
      if (hours == 0) {
        hours = 12;
      }
      let dayTime = ~~(hours / 12) > 0 ? "PM" : "AM";
      hours = hours % 12;
      return "" + hours + ":" + minutes + " " + dayTime;
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
