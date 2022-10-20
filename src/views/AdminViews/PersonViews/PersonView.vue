<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{this.message}}</v-toolbar-title>
      </v-toolbar>
      <br />
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

      <v-btn class="mr-4" @click="cancel"> Back </v-btn>

      <br /><br />

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

      <br />
      <v-card>
        <v-card-title>
          Roles for {{this.group.name}}
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
            <v-icon small class="mr-2" @click="editRole(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteRole(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br />
      <v-card>
        <v-card-title>
          Additional Privileges for {{this.group.name}}
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            class="mr-4"
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
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small @click="deletePrivilege(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br />
      <v-card v-if="tutor">
        <v-card-title>
          Topics for {{this.group.name}}
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
            <v-icon small class="mr-2" @click="editTopic(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteTopic(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>
      <br />

      <v-dialog v-model="dialogEdit" max-width="500px">
        <v-card>
          <v-card-title>{{ person.fName }} {{ person.lName }}</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy validation>
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
            <v-btn color="accent" @click="updatePerson">Save</v-btn>
            <v-btn color="error" @click="dialogEdit = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogRole" max-width="500px">
        <v-card>
          <v-card-title v-if="personroles[editedRoleIndex] !== undefined"
            >{{ personroles[editedRoleIndex].type }} Role for {{ person.fName }}:</v-card-title
          >
          <!-- here -->
          <v-card-text>
            <v-container>
              <br />
              <v-select
                v-model="personrole.status"
                :items="updateStatus"
                item-text="type"
                item-value="id"
                label="Status"
                required
              >
              </v-select>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeRole"> Cancel </v-btn>
            <v-btn color="accent" text @click="saveRole"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogRoleAdd" max-width="500px">
        <v-card>
          <v-card-title>Add a role for {{ person.fName }}:</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy validation>
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
            <v-btn color="accent" @click="addPersonRole">Save</v-btn>
            <v-btn color="error" @click="dialogRoleAdd = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogPrivilegeAdd" max-width="500px">
        <v-card>
          <v-card-title>Add a privilege for {{ person.fName }}:</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy validation>
              <v-select
                v-model="personroleprivilege.privilege"
                :items="privileges"
                label="Privilege"
                required
              >
              </v-select>

              <v-select
                v-model="personroleprivilege.personroleId"
                :items="personroles"
                item-text="type"
                item-value="personrole[0].id"
                label="Associated Role"
                required
              >
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="accent" 
              :disabled="!personroleprivilege.privilege || !personroleprivilege.personroleId"
              @click="addPersonRolePrivilege"
            >
              Save
            </v-btn>
            <v-btn color="error" @click="dialogPrivilegeAdd = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <v-dialog v-model="dialogTopic" max-width="500px">
        <v-card>
          <v-card-title>Edit topic for {{ person.fName }}:</v-card-title>
          <v-card-text>
            <v-container>
              <br />
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
            <v-btn color="error" text @click="closeTopic"> Cancel </v-btn>
            <v-btn color="accent" text @click="saveTopic"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogTopicAdd" max-width="500px">
        <v-card>
          <v-card-title>Add a topic for {{ person.fName }}:</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy validation>
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
            <v-btn color="accent" @click="addPersonTopic">Save</v-btn>
            <v-btn color="error" @click="dialogTopicAdd = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title>Confirming Deletion:</v-card-title>
          <v-card-text>
            <h2>{{deleteMessage}}</h2>
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
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import PersonRolePrivilegeServices from "@/services/personRolePrivilegeServices.js";
import RoleServices from "@/services/roleServices.js";
import PersonTopicServices from "@/services/personTopicServices.js";
import TopicServices from "@/services/topicServices.js";

export default {
  props: ["id", "personId"],

  data() {
    return {
      message : 'Person - click Edit to update or Delete to remove person',
      person: {},
      persontopics: [],
      persontopic: {},
      personroles: [],
      personrole: {},
      personroleprivilege: {},
      personroleprivileges: [],
      privileges: ["Sign up students for appointments", "Receive notifications for requests", "Receive notifications for applications"],
      tutor: false,
      skillLevels: ["Freshman", "Sophomore", "Junior", "Senior"],
      status: ["applied", "approved"],
      updateStatus: ["approved", "disabled"],
      roles: [],
      topics: [],
      user: {},
      valid: true,
      group: {},
      deleteMessage: "",
      deleteItem: {},
      deleteType: "",
      dialogDelete: false,
      dialogEdit: false,
      dialogRole: false,
      dialogRoleAdd: false,
      dialogPrivilegeAdd: false,
      dialogTopic: false,
      dialogTopicAdd: false,
      editedRoleIndex: -1,
      editedPrivilegeIndex: -1,
      editedTopicIndex: -1,
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
    };
  },
  watch: {
    dialogRole(val) {
      val || this.closeRole();
    },
  },
  async created() {
    this.getPerson();
    this.user = Utils.getStore('user');
    await this.getGroupByPersonRoleId()
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
    getPerson() {
      PersonServices.getPerson(this.personId)
      .then((response) => {
        this.person = response.data;
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    async getPersonRoles() {
      this.personroleprivileges = []
      await RoleServices.getRoleByGroupForPerson(this.group.id, this.personId)
      .then((response) => {
        this.personroles = response.data;
        console.log(this.personroles)
        for(let i = 0; i < this.personroles.length; i++) {
          let personRoleArray = this.personroles[i].personrole
          // set tutor boolean
          if(this.personroles[i].type.includes("Tutor"))
            this.tutor = true;
          // set up personroleprivilege array
          for(let j = 0; j < personRoleArray.length; j++) {
            let pr = personRoleArray[j];
            for(let k = 0; k < pr.personroleprivilege.length; k++) {
              let priv = pr.personroleprivilege[k]
              priv.associatedRole = this.personroles[i].type;
              this.personroleprivileges.push(priv);
              // can't do what's below because multiple roles may need the same privilege
              // this.privileges = this.privileges.filter(privilege => privilege !== priv.privilege)
            }
          }
        }
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
      TopicServices.getTopicByGroupForPerson(this.group.id, this.personId)
      .then((response) => {
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
      this.deleteMessage = `Are you sure you want to delete ${fName}?`
      this.deleteItem = id
      this.deleteType = "person"
      this.dialogDelete = true;
    },
    updatePerson() {
      PersonServices.updatePerson(this.personId, this.person)
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
    addPersonRolePrivilege() {
      console.log(this.personroleprivilege)
      PersonRolePrivilegeServices.addPrivilege(this.personroleprivilege)
      .then(() => {
        this.dialogPrivilegeAdd = false;
        this.personroleprivilege = {}
        this.getPersonRoles();
      })
      .catch((error) => {
        this.message = error.response.data.message
        console.log("There was an error:", error.response);
      });
    },
    addPersonTopic() {
      this.persontopic.personId = this.person.id;
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
      this.editedRoleIndex = this.personroles.findIndex(role => role.id === item.id);
      this.personrole = Object.assign({}, item.personrole[0]);
      this.dialogRole = true;
    },
    deleteRole(item) {
      this.deleteMessage = `Are you sure you want to delete the role ${item.type} for ${this.person.fName}?`
      this.deleteItem = item
      this.deleteType = "role"
      this.dialogDelete = true;
    },
    closeRole() {
      this.dialogRole = false;
      this.$nextTick(() => {
        this.personrole = Object.assign({}, {});
        this.editedRoleIndex = -1;
      });
    },
    saveRole() {
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
    deletePrivilege(item) {
      this.deleteMessage = `Are you sure you want to delete the privilege ${item.privilege} for ${this.person.fName}?`
      this.deleteItem = item
      this.deleteType = "privilege"
      this.dialogDelete = true;
    },
    editTopic(item) {
      this.editedTopicIndex = this.persontopics.findIndex(topic => topic.id === item.id);
      this.persontopic = Object.assign({}, item.persontopic[0]);
      this.dialogTopic = true;
    },
    deleteTopic(item) {
      this.deleteMessage = `Are you sure you want to delete the topic ${item.name} for ${this.person.fName}?`
      this.deleteItem = item
      this.deleteType = "topic"
      this.dialogDelete = true;
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
      this.dialogTopic = false;
    },
    closeTopicDelete() {
      this.dialogTopicDelete = false;
      this.$nextTick(() => {
        this.persontopic = Object.assign({}, {});
        this.editedTopicIndex = -1;
      });
    },
    saveTopic() {
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
    confirmedDelete() {
      if (this.deleteType === "person") {
        PersonServices.deletePerson(this.deleteItem.id)
        .then(() => {
          this.$router.push({ name: "personList" });
        })
        .catch((error) => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response);
        });
      }
      else if (this.deleteType === "role") {
        this.editedRoleIndex = this.personroles.findIndex(role => role.id === this.deleteItem.id);
        this.personrole = Object.assign({}, this.deleteItem.personrole[0]);
        this.personroles.splice(this.editedRoleIndex, 1);
        PersonRoleServices.deletePersonRole(this.personrole.id)
          .then(() => {
            this.$nextTick(() => {
              this.personrole = Object.assign({}, {});
              this.editedRoleIndex = -1;
            });
          })
          .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      }
      else if (this.deleteType === "privilege") {
        this.editedPrivilegeIndex = this.personroleprivileges.findIndex(priv => priv.id === this.deleteItem.id);
        this.privilege = {
          id: this.deleteItem.id,
          privilege: this.deleteItem.privilege,
          personroleId: this.personrole.id
        }
        this.personroleprivileges.splice(this.editedPrivilegeIndex, 1);
        PersonRolePrivilegeServices.deletePrivilege(this.privilege.id)
        .then(() => {
          this.$nextTick(() => {
            this.privilege = Object.assign({}, {});
            this.editedPrivilegeIndex = -1;
          });
        })
        .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      }
      else if (this.deleteType === "topic") {
        this.editedTopicIndex = this.persontopics.findIndex(topic => topic.id === this.deleteItem.id);
        this.persontopic = Object.assign({}, this.deleteItem.persontopic[0]);
        this.persontopics.splice(this.editedTopicIndex, 1);
        PersonTopicServices.deletePersonTopic(this.persontopic.id)
          .then(() => {
            this.$nextTick(() => {
              this.persontopic = Object.assign({}, {});
              this.editedTopicIndex = -1;
            });
          })
          .catch(error => {
          this.message = error.response.data.message
          console.log("There was an error:", error.response)
        });
      }

      this.dialogDelete = false;
    }
  },
};
</script>
