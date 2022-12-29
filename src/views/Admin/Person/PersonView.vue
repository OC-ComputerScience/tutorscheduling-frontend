<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br />

      <v-dialog persistent v-model="showDisableConfirmation" max-width="750px">
        <DeleteConfirmationComponent
          :type="deleteType"
          :item="deleteItem"
          @handleReturningCancel="showDisableConfirmation = false"
          @handleReturningSuccess="
            confirmedDelete()
          "></DeleteConfirmationComponent>
      </v-dialog>

      <v-btn
        color="accent"
        elevation="2"
        class="mr-4"
        @click="dialogEdit = true">
        Edit
      </v-btn>

      <!-- <v-btn
        color="error"
        class="mr-4"
        @click="deletePerson(person.id, person.fName)"
      >
        Delete
      </v-btn> -->

      <v-btn class="mr-4" @click="cancel"> Back </v-btn>

      <br /><br />

      <v-text-field
        v-model="person.fName"
        id="fName"
        :counter="25"
        label="First Name"
        readonly></v-text-field>

      <v-text-field
        v-model="person.lName"
        id="lName"
        :counter="25"
        label="Last Name"
        readonly></v-text-field>

      <v-text-field
        v-model="person.email"
        id="email"
        :counter="25"
        label="Email"
        readonly></v-text-field>

      <v-text-field
        v-model="person.phoneNum"
        id="phoneNum"
        :counter="13"
        label="Mobile Phone"
        readonly></v-text-field>

      <br />
      <v-card>
        <v-card-title>
          Roles for {{ this.group.name }}
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            class="mr-4"
            elevation="2"
            @click="dialogRoleAdd = true">
            Add
          </v-btn>
        </v-card-title>
        <v-data-table
          :headers="roleHeaders"
          :items="personroles"
          :items-per-page="50">
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editRole(item)">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br />
      <v-card>
        <v-card-title>
          Additional Privileges for {{ this.group.name }}
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            class="mr-4"
            elevation="2"
            @click="dialogPrivilegeAdd = true">
            Add
          </v-btn>
        </v-card-title>
        <v-data-table
          :headers="privilegeHeaders"
          :items="personroleprivileges"
          :items-per-page="50">
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              small
              @click="
                deleteType = 'privilege';
                directToCancel(item);
              ">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br />
      <v-card v-if="tutor">
        <v-card-title>
          Topics for {{ this.group.name }}
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            class="mr-4"
            elevation="2"
            @click="dialogTopicAdd = true">
            Add
          </v-btn>
        </v-card-title>
        <v-data-table
          :headers="topicHeaders"
          :items="persontopics"
          :items-per-page="50">
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editTopic(item)">
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="
                deleteType = 'persontopic';
                directToCancel(item);
              ">
              mdi-delete
            </v-icon>
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
                required></v-text-field>

              <v-text-field
                v-model="person.lName"
                id="lname"
                :counter="25"
                label="Last Name"
                required></v-text-field>

              <v-text-field
                v-model="person.email"
                id="email"
                :counter="25"
                label="email"
                hint="you@email.com"
                persistent-hint
                required></v-text-field>

              <v-text-field
                v-model="person.phoneNum"
                id="phoneNum"
                :counter="13"
                label="phoneNum"
                hint="111-222-3333"
                persistent-hint
                required></v-text-field>
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
            >{{ personroles[editedRoleIndex].type }} Role for
            {{ person.fName }}:</v-card-title
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
                @change="deleteType = 'personrole'"
                required>
              </v-select>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="closeRole()"> Cancel </v-btn>
            <v-btn color="accent" text @click="directToCancel(personrole)">
              Save
            </v-btn>
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
                required>
              </v-select>

              <v-select
                v-model="personrole.status"
                :items="status"
                label="Status"
                required>
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
                required>
              </v-select>

              <v-select
                v-model="personroleprivilege.personroleId"
                :items="personroles"
                item-text="type"
                item-value="personrole[0].id"
                label="Associated Role"
                required>
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              :disabled="
                !personroleprivilege.privilege ||
                !personroleprivilege.personroleId
              "
              @click="addPersonRolePrivilege">
              Save
            </v-btn>
            <v-btn color="error" @click="dialogPrivilegeAdd = false"
              >Cancel</v-btn
            >
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
                required>
              </v-select>
              <v-select
                v-model="persontopic.skillLevel"
                :items="skillLevels"
                label="Skill Level"
                required>
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
                required>
              </v-select>
              <v-select
                v-model="persontopic.skillLevel"
                :items="skillLevels"
                label="Skill Level"
                required>
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
import AppointmentServices from "@/services/appointmentServices.js";
import PersonAppointmentServices from "@/services/personAppointmentServices.js";
import DeleteConfirmationComponent from "../../../components/DeleteConfirmationComponent.vue";

import { AppointmentActionMixin } from "../../../mixins/AppointmentActionMixin";
import { TimeFunctionsMixin } from "../../../mixins/TimeFunctionsMixin";

export default {
  props: ["id", "personId"],
  mixins: [AppointmentActionMixin, TimeFunctionsMixin],
  components: {
    DeleteConfirmationComponent,
  },
  data() {
    return {
      message: "Person - click Edit to update or Delete to remove person",
      showDisableConfirmation: false,
      person: {},
      appointments: [],
      persontopics: [],
      persontopic: {},
      personroles: [],
      personrole: {},
      personroleprivilege: {},
      personroleprivileges: [],
      privileges: [
        "Make flexible slots that allow for shorter appointments",
        "Receive notifications for applications",
        "Receive notifications for requests",
        "Sign up students for appointments",
      ],
      tutor: false,
      skillLevels: ["Freshman", "Sophomore", "Junior", "Senior"],
      status: ["applied", "approved", "disabled"],
      updateStatus: ["approved", "disabled"],
      roles: [],
      topics: [],
      user: {},
      valid: true,
      group: {},
      deleteMessage: "",
      deleteItem: {},
      deleteType: "",
      disabledRole: {},
      dialogDelete: false,
      dialogEdit: false,
      dialogRole: false,
      dialogRoleAdd: false,
      dialogPrivilegeAdd: false,
      dialogTopic: false,
      dialogTopicAdd: false,
      editedRoleIndex: -1,
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
    await this.getPerson();
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId()
      .then(() => {
        this.getPersonRoles();
        this.getPersonTopics();
        this.getRolesForGroup();
        this.getTopicsForGroup();
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
    async getPerson() {
      await PersonServices.getPerson(this.personId)
        .then((response) => {
          this.person = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getPersonRoles() {
      this.personroleprivileges = [];
      await RoleServices.getRoleByGroupForPerson(this.group.id, this.personId)
        .then(async (response) => {
          this.personroles = response.data;
          for (let i = 0; i < this.personroles.length; i++) {
            let personRoleArray = this.personroles[i].personrole;
            // set tutor boolean
            if (this.personroles[i].type.includes("Tutor")) this.tutor = true;
            // handle if a personrole is disabled
            if (personRoleArray[0].status.includes("disabled")) {
              this.disabledRole = this.personroles[i];
              await this.disablePersonRole(personRoleArray[0]);
            }
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
          console.log(error);
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    getRolesForGroup() {
      RoleServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.roles = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async getPersonTopics() {
      await TopicServices.getTopicByGroupForPerson(this.group.id, this.personId)
        .then((response) => {
          this.persontopics = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    getTopicsForGroup() {
      TopicServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.topics = response.data;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    updatePerson() {
      PersonServices.updatePerson(this.personId, this.person)
        .then(() => {
          this.dialogEdit = false;
        })
        .catch((error) => {
          this.message = error.response.data.message;
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
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    addPersonRolePrivilege() {
      PersonRolePrivilegeServices.addPrivilege(this.personroleprivilege)
        .then(() => {
          this.dialogPrivilegeAdd = false;
          this.personroleprivilege = {};
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message;
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
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
    editRole(item) {
      this.editedRoleIndex = this.personroles.findIndex(
        (role) => role.id === item.id
      );
      console.log(this.editedRoleIndex);
      if (item.personrole[0].status === "disabled") this.disabledRole = item;
      console.log(this.disabledRole);
      this.personrole = Object.assign({}, item.personrole[0]);
      this.personrole.type = item.type;
      this.dialogRole = true;
    },
    closeRole() {
      this.dialogRole = false;
      this.$nextTick(() => {
        this.personrole = Object.assign({}, {});
        this.editedRoleIndex = -1;
      });
    },
    async saveRole() {
      await PersonRoleServices.updatePersonRole(
        this.personrole.id,
        this.personrole
      )
        .then(() => {
          this.closeRole();
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
      console.log(this.editedRoleIndex);
      Object.assign(this.personroles[this.editedRoleIndex], this.personrole);
    },
    editTopic(item) {
      this.editedTopicIndex = this.persontopics.findIndex(
        (topic) => topic.id === item.id
      );
      this.persontopic = Object.assign({}, item.persontopic[0]);
      this.dialogTopic = true;
    },
    closeTopic() {
      this.dialogTopic = false;
    },
    saveTopic() {
      PersonTopicServices.updatePersonTopic(
        this.persontopic.id,
        this.persontopic
      )
        .then(() => {
          this.closeTopic();
          this.getPersonTopics();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
      Object.assign(this.persontopics[this.editedTopicIndex], this.persontopic);
    },
    directToCancel(item) {
      this.deleteItem = item;
      console.log(this.deleteItem);
      this.deleteItem.person = this.person;
      this.showDisableConfirmation = true;
      if (this.deleteType === "personrole") {
        this.showDisableConfirmation = true;
      } else {
        this.saveRole();
      }
    },
    async confirmedDelete() {
      if (this.deleteType === "personrole") {
        this.saveRole();
      } else if (this.deleteType === "privilege") {
        this.privilege = {
          id: this.deleteItem.id,
          privilege: this.deleteItem.privilege,
          personroleId: this.personrole.id,
        };
        await PersonRolePrivilegeServices.deletePrivilege(
          this.deleteItem.id
        ).catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
        this.privilege = {};
        await this.getPersonRoles();
      } else if (this.deleteType === "persontopic") {
        this.editedTopicIndex = this.persontopics.findIndex(
          (topic) => topic.id === this.deleteItem.id
        );
        this.persontopic = Object.assign({}, this.deleteItem.persontopic[0]);
        this.persontopics.splice(this.editedTopicIndex, 1);
        await PersonTopicServices.deletePersonTopic(this.persontopic.id)
          .then(() => {
            this.$nextTick(() => {
              this.persontopic = Object.assign({}, {});
              this.editedTopicIndex = -1;
            });
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response);
          });
      }

      this.showDisableConfirmation = false;
    },
    async disablePersonRole(personrole) {
      // delete person role privileges
      await PersonRolePrivilegeServices.deletePrivilegesForPersonRole(
        this.disabledRole.personrole[0].id
      ).catch((error) => {
        this.message = error.response.data.message;
        console.log("There was an error:", error.response);
      });
      // delete person topics
      await PersonTopicServices.deletePersonTopicsForPersonForGroup(
        this.person.id,
        this.group.id
      ).catch((error) => {
        this.message = error.response.data.message;
        console.log("There was an error:", error.response);
      });
      await this.getAppointments(personrole);
      let disableUser = {
        fName: this.person.fName,
        lName: this.person.lName,
        userID: this.person.id,
        selectedRole: {
          type: this.disabledRole.type,
        },
      };
      for (let i = 0; i < this.appointments.length; i++) {
        console.log("in for loop");
        await this.cancelAppointment(this.appointments[i], disableUser);
      }
      await this.getPersonRoles();
      await this.getPersonTopics();
    },
    async getAppointments(personrole) {
      await AppointmentServices.getUpcomingAppointmentForPersonForGroup(
        this.group.id,
        personrole.personId
      )
        .then(async (response) => {
          this.appointments = response.data;
          for (let i = 0; i < this.appointments.length; i++) {
            await PersonAppointmentServices.findStudentDataForTable(
              this.appointments[i].id
            )
              .then((response) => {
                this.appointments[i].students = response.data;
              })
              .catch((error) => {
                this.message = error.response.data.message;
                console.log("There was an error:", error.response);
              });

            await PersonAppointmentServices.findTutorDataForTable(
              this.appointments[i].id
            )
              .then((response) => {
                this.appointments[i].tutors = response.data;
              })
              .catch((error) => {
                this.message = error.response.data.message;
                console.log("There was an error:", error.response);
              });
          }
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
  },
};
</script>
