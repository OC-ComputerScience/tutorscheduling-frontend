<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <br>
      <v-btn
        color="accent"
        elevation="2"
        class="mr-4"
        @click="dialogEdit = true"
      >
        Edit
    </v-btn>

    <v-btn
        color="error"
        class="mr-4"
        @click="deletePerson(person.id, person.fName)"
      >
        Delete
    </v-btn>

    <v-btn
        class="mr-4"
        @click="cancel"
      >
        Back
    </v-btn>

    <br><br>

    <v-text-field
        v-model="person.fName"
        id="fName"
        :counter="25"
        label="First Name"
        readonly
      ></v-text-field>

      
    <v-text-field
        v-model="person.lName"
        id="lName"
        :counter="25"
        label="Last Name"
        readonly
      ></v-text-field>

      <v-text-field
        v-model="person.email"
        id="email"
        :counter="25"
        label="Email"
        readonly
      ></v-text-field>
      
      <v-text-field
        v-model="person.phoneNum"
        id="phoneNum"
        :counter="13"
        label="Mobile Phone"
        readonly
      ></v-text-field>

      <br>
      <v-card>
        <v-card-title>
          Roles
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            class="mr-4"
            elevation="2"
            @click="dialogRoleAdd = true"
          >
            Add
          </v-btn>
        </v-card-title>
        <v-data-table
          :headers="roleHeaders"
          :items="personroles"
          :items-per-page="50"
        >

          <template v-slot:[`item.actions`]="{ item }">      
            <v-icon
              small
              class="mr-2"
              @click="editRole(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="deleteRole(item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br>
      <v-card v-if="tutor">
        <v-card-title>
          Topics
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            class="mr-4"
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
          <template v-slot:[`item.actions`]="{ item }">      
            <v-icon
              small
              class="mr-2"
              @click="editTopic(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="deleteTopic(item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
      <br>

      <v-dialog v-model="dialogEdit" max-width="500px">
        <v-card>
          <v-card-title>{{person.fName}} {{person.lName}}</v-card-title>
          <v-card-text>
            <v-form
              ref="form" 
              v-model="valid"
              lazy validation
            >
              <v-text-field
                v-model="person.fName"
                id="fname"
                :counter="25"
                label="First Name"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="person.lName"
                id="lname"
                :counter="25"
                label="Last Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="person.email"
                id="email"
                :counter="25"
                label="email"
                hint="you@email.com"
                persistent-hint
                required
              ></v-text-field>

              <v-text-field
                v-model="person.phoneNum"
                id="phoneNum"
                :counter="13"
                label="phoneNum"
                hint="111-222-3333"
                persistent-hint
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent"  @click="updatePerson">Save</v-btn>
            <v-btn color="error"  @click="dialogEdit = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="dialogRole"
        max-width="500px"
      >
        <v-card>
          <v-card-title>Edit role for {{person.fName}}:</v-card-title>
          <v-card-text>
            <v-container>
              <br>
              <v-select
                  v-model="personrole.roleId"
                  :items="roles"
                  item-text="type"
                  item-value="id"
                  label="Role"
                  required
              >
              </v-select>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              @click="closeRole"
            >
              Cancel
            </v-btn>
            <v-btn
              color="accent"
              text
              @click="saveRole"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogRoleAdd" max-width="500px">
        <v-card>
          <v-card-title>Add a role for {{person.fName}}:</v-card-title>
          <v-card-text>
            <v-form
              ref="form" 
              v-model="valid"
              lazy validation
            >
              <v-select
                  v-model="personrole.roleId"
                  :items="roles"
                  item-text="type"
                  item-value="id"
                  label="Role"
                  required
              >
              </v-select>

              <v-select
                  v-model="personrole.status"
                  :items="status"
                  label="Status"
                  required
              >
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent"  @click="addPersonRole">Save</v-btn>
            <v-btn color="error"  @click="dialogRoleAdd = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <v-dialog
        v-model="dialogTopic"
        max-width="500px"
      >
        <v-card>
          <v-card-title>Edit topic for {{person.fName}}:</v-card-title>
          <v-card-text>
            <v-container>
              <br>
              <v-select
                  v-model="persontopic.topicId"
                  :items="topics"
                  item-text="name"
                  item-value="id"
                  label="Topic"
                  required
              >
              </v-select>
              <v-select
                  v-model="persontopic.skillLevel"
                  :items="skillLevels"
                  label="Skill Level"
                  required
              >
              </v-select>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              @click="closeTopic"
            >
              Cancel
            </v-btn>
            <v-btn
              color="accent"
              text
              @click="saveTopic"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogTopicAdd" max-width="500px">
        <v-card>
          <v-card-title>Add a topic for {{person.fName}}:</v-card-title>
          <v-card-text>
            <v-form
              ref="form" 
              v-model="valid"
              lazy validation
            >
              <v-select
                  v-model="persontopic.topicId"
                  :items="topics"
                  item-text="name"
                  item-value="id"
                  label="Topic"
                  required
              >
              </v-select>
              <v-select
                  v-model="persontopic.skillLevel"
                  :items="skillLevels"
                  label="Skill Level"
                  required
              >
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent"  @click="addPersonTopic">Save</v-btn>
            <v-btn color="error"  @click="dialogTopicAdd = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
import GroupServices from "@/services/groupServices.js";
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import RoleServices from "@/services/roleServices.js";
import PersonTopicServices from "@/services/personTopicServices.js";
import TopicServices from "@/services/topicServices.js";

export default {
  props: ["id"],

  data() {
    return {
      message : 'click Edit to update or Delete to remove person',
      person: {},
      persontopics: [],
      persontopic: {},
      personroles: [],
      personrole: {},
      tutor: false,
      skillLevels: ["Freshman", "Sophomore", "Junior", "Senior"],
      status: ["applied", "approved"],
      roles: [],
      topics: [],
      user: {},
      valid: true,
      group: {},
      dialogEdit: false,
      dialogRole: false,
      dialogRoleAdd: false,
      dialogTopic: false,
      dialogTopicAdd: false,
      editedRoleIndex: -1,
      editedTopicIndex: -1,
      roleHeaders: [{text: 'Type', value: 'type'},
                { text: 'Actions', value: 'actions', sortable: false }],
      topicHeaders: [{text: 'Name', value: 'name'},
                {text: 'Skill Level', value: 'persontopic[0].skillLevel'},
                { text: 'Actions', value: 'actions', sortable: false }],        
    };
  },
  watch: {
    dialogRole (val) {
      val || this.closeRole()
    },
  },
  async created() {
    this.getPerson();
    this.user = Utils.getStore('user');
    await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
    .then(() => {
      this.getPersonRoles();
      this.getPersonTopics();
      this.getRolesForGroup();
      this.getTopicsForGroup();
    })
    .catch(error => {
      this.message = error.response.data.message
    })
  },
  methods: {
    async getGroup(name) {
      await GroupServices.getGroupByName(name)
      .then((response) => {
        this.group = response.data[0];
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getPerson() {
      PersonServices.getPerson(this.id)
      .then((response) => {
        this.person = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getPersonRoles() {
      RoleServices.getRoleByGroupForPerson(this.group.id, this.id)
      .then((response) => {
        this.personroles = response.data;
        for(let i = 0; i < this.personroles.length && !this.tutor; i++) {
          if(this.personroles[i].type.includes("Tutor"))
            this.tutor = true;
        }
        console.log(this.tutor)
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getRolesForGroup() {
      RoleServices.getAllForGroup(this.group.id)
      .then((response) => {
        this.roles = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getPersonTopics() {
      TopicServices.getTopicByGroupForPerson(this.group.id, this.id)
      .then((response) => {
        console.log(response)
        this.persontopics = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    getTopicsForGroup() {
      TopicServices.getAllForGroup(this.group.id)
      .then((response) => {
        this.topics = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    deletePerson(id, fName) {
      let confirmed = confirm(`Are you sure you want to delete ${fName}`);
      if (confirmed) {
        PersonServices.deletePerson(id)
          .then(() => {
            this.$router.push({ name: "personList" });
          })
          .catch((error) => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response);
          });
      }
    },
    updatePerson() {
      PersonServices.updatePerson(this.id, this.person)
        .then(() => {
          this.dialogEdit = false;
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log(error);
        });
    },
    addPersonRole() {
      this.personrole.personId = this.person.id;
      console.log(this.personrole);
      PersonRoleServices.addPersonRole(this.personrole)
      .then(() => {
        this.dialogRoleAdd = false;
        this.getPersonRoles();
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    addPersonTopic() {
      this.persontopic.personId = this.person.id;
      console.log(this.persontopic);
      PersonTopicServices.addPersonTopic(this.persontopic)
      .then(() => {
        this.dialogTopicAdd = false;
        this.getPersonTopics();
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    cancel() {
      this.$router.go(-1);
    },
    editRole(item) {
      this.editedRoleIndex = this.personroles.indexOf(item.id)
      this.personrole = Object.assign({}, item.personrole[0])
      console.log(this.personrole);
      this.dialogRole = true;
      console.log(this.dialogRole)
    },
    deleteRole(item) {
      let confirmed = confirm(`Are you sure you want to delete the role ${item.type} for ${this.person.fName}?`);
      if (confirmed) {
        this.editedRoleIndex = this.personroles.indexOf(item.id)
        this.personrole = Object.assign({}, item.personrole[0])
        this.personroles.splice(this.editedRoleIndex, 1)
        PersonRoleServices.deletePersonRole(this.personrole.id)
        .then(() => {
          this.$nextTick(() => {
            this.personrole = Object.assign({}, {})
            this.editedRoleIndex = -1
          })
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      }
    },
    closeRole() {
      this.dialogRole = false
      this.$nextTick(() => {
        this.personrole = Object.assign({}, {})
        this.editedRoleIndex = -1
      })
    },
    saveRole() {
      console.log(this.editedRoleIndex);
      console.log(this.personrole);
      PersonRoleServices.updatePersonRole(this.personrole.id, this.personrole)
      .then(() => {
        this.closeRole()
        this.getPersonRoles();
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log(error);
      });
      Object.assign(this.personroles[this.editedRoleIndex], this.personrole)
    },
    editTopic(item) {
      this.editedTopicIndex = this.persontopics.indexOf(item.id)
      this.persontopic = Object.assign({}, item.persontopic[0])
      console.log(this.persontopic);
      this.dialogTopic = true;
    },
    deleteTopic(item) {
      let confirmed = confirm(`Are you sure you want to delete the topic ${item.name} for ${this.person.fName}?`);
      if (confirmed) {
        this.editedTopicIndex = this.persontopics.indexOf(item.id)
        this.persontopic = Object.assign({}, item.persontopic[0])
        this.persontopics.splice(this.editedTopicIndex, 1)
        PersonTopicServices.deletePersonTopic(this.persontopic.id)
        .then(() => {
          this.$nextTick(() => {
            this.persontopic = Object.assign({}, {})
            this.editedTopicIndex = -1
          })
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      }
    },
    deleteTopicConfirm() {
      this.persontopics.splice(this.editedTopicIndex, 1)
        PersonTopicServices.deletePersonTopic(this.persontopic.id)
          .then(() => {
          })
          .catch(error => {
            this.message = error.response.data.message
            console.log("There was an error:", error.response)
          });
      
      this.closeTopicDelete()
    },
    closeTopic() {
      this.dialogTopic = false
      
    },
    closeTopicDelete () {
      this.dialogTopicDelete = false
      this.$nextTick(() => {
        this.persontopic = Object.assign({}, {})
        this.editedTopicIndex = -1
      })
    },
    saveTopic() {
      console.log(this.editedTopicIndex);
      console.log(this.persontopic);
      PersonTopicServices.updatePersonTopic(this.persontopic.id, this.persontopic)
      .then(() => {
        this.closeTopic()
        this.getPersonTopics();
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log(error);
      });
      Object.assign(this.persontopics[this.editedTopicIndex], this.persontopic)
    },
  },
};
</script>
