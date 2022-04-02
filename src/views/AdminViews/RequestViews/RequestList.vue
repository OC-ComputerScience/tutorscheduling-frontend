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
      <v-toolbar
        flat
      >
        <v-toolbar-title>Requests</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
            
          <v-card>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
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
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
  
    <template v-slot:[`item.actions`]="{ item }">      
        <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>

    <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              Topic: {{ getTopicName(item.topic) }} <br>
              Description: {{ item.description }}
            </td>
    </template>

    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>
</v-container>
</template>

<script>
import RequestServices from "@/services/requestServices.js";

  export default {
    data: () => ({
      StatusSelect: ['Recieved', 'In-Progress', 'Completed'],
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: "Person Name", value: "person.lName" },
        { text: "Problem", value: "problem" },
        { text: "Status", value: "status" },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      requests: [],
      editedIndex: -1,
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
      this.getRequests();
    },
    methods: {
      getRequests() {
        RequestServices.getAllRequests()
          .then((response) => {
          this.requests = response.data;
          })
          .catch((error) => {
          console.log("There was an error:", error.response);
          });
      },
      getTopicName(item) {
        let temp = item;
        return temp.name;
      },
      editItem (item) {
        this.editedIndex = this.requests.indexOf(item.id)
        this.editedItem = Object.assign({}, item)
        console.log(this.editedItem);
        this.dialog = true
      },
      deleteItem (item) {
        this.editedIndex = this.requests.indexOf(item.id)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },
      deleteItemConfirm () {
        this.requests.splice(this.editedIndex, 1)
          RequestServices.deleteRequest(this.editedItem.id)
            .then(() => {
              this.getTopics(this.start, this.length);
            })
            .catch(error => {
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
      save () {
        console.log(this.editedIndex);
        console.log(this.editedItem);
        RequestServices.updateRequest(this.editedItem.id, this.editedItem)
          .then(() => {
            this.close()
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
          });
          Object.assign(this.requests[this.editedIndex], this.editedItem)

        
    
      },
    },
  }
</script>