<template>
  <v-data-table
    :headers="headers"
    :items="personroles"
    sort-by="status"
    class="elevation-1"
    :expanded.sync="expanded"
    show-expand
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Pending user approvals</v-toolbar-title>
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
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

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
   
    <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              Phone Number: {{ item.person.phoneNum }}
              <br>
              Email Address: {{ item.person.email }}
            </td>
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
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import PersonRoleServices from "@/services/personRoleServices.js";

  export default {
    data: () => ({
      StatusSelect: ['Pending', 'Approved', 'Denied'],
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: "Name", value: "person.lName" },
        { text: "Status", value: "status" },
        { text: "Signature", value: "agree" },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      personroles: [],
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
    created () {
      this.getPersonRoles();
    },
    methods: {
        getPersonRoles() {
            PersonRoleServices.getAllPersonRoles()
                .then((response) => {
                this.personroles = response.data;
                })
                .catch((error) => {
                console.log("There was an error:", error.response);
                });
            },
      editItem (item) {
        this.editedIndex = this.personroles.indexOf(item.id)
        this.editedItem = Object.assign({}, item)
        console.log(this.editedItem);
        this.dialog = true
      },
      deleteItem (item) {
        this.editedIndex = this.personroles.indexOf(item.id)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },
      deleteItemConfirm () {
        this.personroles.splice(this.editedIndex, 1)
          PersonRoleServices.deletePersonRole(this.editedItem.id)
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
        PersonRoleServices.updatePersonRole(this.editedItem.id, this.editedItem)
          .then(() => {
            this.close()
            window.location.reload();
          })
          .catch((error) => {
            console.log(error);
          });
          Object.assign(this.personroles[this.editedIndex], this.editedItem)

        
    
      },
    },
  }
</script>