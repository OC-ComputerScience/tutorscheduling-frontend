<template>
  <div style="">
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
      </v-toolbar>
      <br />

      <v-dialog v-model="showDisableConfirmation" persistent max-width="750px">
        <DeleteConfirmationComponent
          :type="deleteType"
          :item="deleteItem"
          @handleReturningCancel="
            showDisableConfirmation = false;
            deleteItem = {};
            deleteType = '';
          "
          @handleReturningSuccess="confirmedDelete()"
        ></DeleteConfirmationComponent>
      </v-dialog>

      <v-btn
        color="accent"
        elevation="2"
        class="mr-4"
        @click="dialogEdit = true"
      >
        Edit
      </v-btn>

      <v-btn class="mr-4" @click="cancel"> Back </v-btn>

      <br /><br />

      <v-text-field
        id="fName"
        v-model="person.fName"
        :counter="25"
        label="First Name"
        readonly
      ></v-text-field>

      <v-text-field
        id="lName"
        v-model="person.lName"
        :counter="25"
        label="Last Name"
        readonly
      ></v-text-field>

      <v-text-field
        id="email"
        v-model="person.email"
        :counter="25"
        label="Email"
        readonly
      ></v-text-field>

      <v-text-field
        id="phoneNum"
        v-model="person.phoneNum"
        :counter="25"
        label="phoneNum"
        hint="4054255555"
        persistent-hint
        required
      ></v-text-field>

      <v-checkbox
        v-model="person.textOptIn"
        label="Text Opt In"
        readonly
      ></v-checkbox>

      <br />
      <v-card>
        <v-card-title>
          Roles for {{ group.name }}
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
          <template #[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editRole(item)">
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br />
      <v-card>
        <v-card-title>
          Additional Privileges for {{ group.name }}
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
          <template #[`item.actions`]="{ item }">
            <v-icon
              small
              @click="
                deleteType = 'privilege';
                directToCancel(item);
              "
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>

      <br />
      <v-card v-if="tutor">
        <v-card-title>
          Topics for {{ group.name }}
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
          <template #[`item.actions`]="{ item }">
            <v-icon small class="mr-2" @click="editTopic(item)">
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="
                deleteType = 'persontopic';
                directToCancel(item);
              "
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
      <br />

      <v-dialog v-model="dialogEdit" max-width="600px">
        <v-card>
          <v-card-title>{{ person.fName }} {{ person.lName }}</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy validation>
              <v-text-field
                id="fname"
                v-model="person.fName"
                :counter="25"
                label="First Name"
                required
              ></v-text-field>

              <v-text-field
                id="lname"
                v-model="person.lName"
                :counter="25"
                label="Last Name"
                required
              ></v-text-field>

              <v-text-field
                id="email"
                v-model="person.email"
                :counter="25"
                label="Email"
                hint="you@email.com"
                persistent-hint
                required
              ></v-text-field>

              <br />

              <PhoneNumberComponent
                :phone-num="person.phoneNum"
                @editedPhoneNumber="setPhoneNumber"
              ></PhoneNumberComponent>

              <v-checkbox
                v-model="person.textOptIn"
                label="Text Opt In"
              ></v-checkbox>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent" @click="updatePerson()">Save</v-btn>
            <v-btn color="error" @click="dialogEdit = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogRole" max-width="500px">
        <v-card>
          <v-card-title v-if="personrole !== undefined"
            >{{ personrole.type }} Role for {{ person.fName }}:</v-card-title
          >
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
            <v-btn color="error" text @click="dialogRole = false">
              Cancel
            </v-btn>
            <v-btn
              color="accent"
              text
              @click="
                deleteType = 'personrole';
                directToCancel(personrole);
              "
            >
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
                required
                @change="
                  roles.find((x) => x.id === personrole.roleId).type === 'Admin'
                    ? (personrole.status = 'approved')
                    : (personrole.status = '')
                "
              >
              </v-select>

              <v-select
                v-model="personrole.status"
                :items="status"
                :disabled="
                  personrole.roleId !== undefined
                    ? roles.find((x) => x.id === personrole.roleId).type ===
                      'Admin'
                    : false
                "
                label="Status"
                required
              >
              </v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="accent" @click="addPersonRole()">Save</v-btn>
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
              :disabled="
                !personroleprivilege.privilege ||
                !personroleprivilege.personroleId
              "
              @click="addPersonRolePrivilege()"
            >
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
            <v-btn color="error" text @click="dialogTopic = false">
              Cancel
            </v-btn>
            <v-btn color="accent" text @click="saveTopic()"> Save </v-btn>
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
            <v-btn color="accent" @click="addPersonTopic()">Save</v-btn>
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
import PhoneNumberComponent from "../../../components/PhoneNumberComponent.vue";

import { CalendarMixin } from "../../../mixins/CalendarMixin";
import { TimeFunctionsMixin } from "../../../mixins/TimeFunctionsMixin";

export default {
  components: {
    DeleteConfirmationComponent,
    PhoneNumberComponent,
  },
  mixins: [CalendarMixin, TimeFunctionsMixin],
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
    personId: {
      type: [Number, String],
      default: 0,
    },
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
      personroleprivileges: [],
      personroleprivilege: {},
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
      deleteItem: {},
      deleteType: "",
      disabledRole: {},
      dialogEdit: false,
      dialogRole: false,
      dialogRoleAdd: false,
      dialogPrivilegeAdd: false,
      dialogTopic: false,
      dialogTopicAdd: false,
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
    setPhoneNumber(phoneNumber) {
      this.person.phoneNum = phoneNumber;
    },
    async updatePerson() {
      await PersonServices.updatePerson(this.personId, this.person)
        .then(() => {
          this.dialogEdit = false;
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
    },
    async addPersonRole() {
      this.personrole.personId = this.person.id;
      this.personrole.agree = true;
      this.personrole.dateSigned = new Date();
      await PersonRoleServices.addPersonRole(this.personrole)
        .then(() => {
          this.dialogRoleAdd = false;
          this.personrole = {};
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async addPersonRolePrivilege() {
      await PersonRolePrivilegeServices.addPrivilege(this.personroleprivilege)
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
    async addPersonTopic() {
      this.persontopic.personId = this.person.id;
      await PersonTopicServices.addPersonTopic(this.persontopic)
        .then(() => {
          this.dialogTopicAdd = false;
          this.persontopic = {};
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
      this.personrole = item.personrole[0];
      this.personrole.type = item.type;
      this.dialogRole = true;
    },
    async saveRole() {
      let temp = {
        id: this.personrole.id,
        status: this.personrole.status,
        agree: this.personrole.agree,
        dateSigned: this.personrole.dateSigned,
        roleId: this.personrole.roleId,
        personId: this.personrole.personId,
      };
      if (this.personrole.status === "disabled")
        this.disabledRole = this.personrole;
      await PersonRoleServices.updatePersonRole(this.personrole.id, temp)
        .then(() => {
          this.dialogRole = false;
          this.personrole = {};
          this.getPersonRoles();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
    },
    editTopic(item) {
      this.persontopic = item.persontopic[0];
      this.dialogTopic = true;
    },
    async saveTopic() {
      let temp = {
        id: this.persontopic.id,
        skillLevel: this.persontopic.skillLevel,
        personId: this.persontopic.personId,
        topicId: this.persontopic.topicId,
      };
      await PersonTopicServices.updatePersonTopic(this.persontopic.id, temp)
        .then(() => {
          this.dialogTopic = false;
          this.persontopic = {};
          this.getPersonTopics();
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log(error);
        });
    },
    async directToCancel(item) {
      this.deleteItem = item;
      this.deleteItem.person = this.person;
      if (
        (this.deleteType === "personrole" &&
          this.deleteItem.status === "disabled") ||
        this.deleteType !== "personrole"
      ) {
        this.showDisableConfirmation = true;
      } else {
        this.showDisableConfirmation = false;
        await this.saveRole();
      }
    },
    async confirmedDelete() {
      this.showDisableConfirmation = false;
      if (this.deleteType === "personrole") {
        await this.saveRole();
        await this.disablePersonRole();
      } else if (this.deleteType === "privilege") {
        await PersonRolePrivilegeServices.deletePrivilege(
          this.deleteItem.id
        ).catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
        await this.getPersonRoles();
      } else if (this.deleteType === "persontopic") {
        await PersonTopicServices.deletePersonTopic(
          this.deleteItem.persontopic[0].id
        )
          .then(() => {
            this.getPersonTopics();
          })
          .catch((error) => {
            this.message = error.response.data.message;
            console.log("There was an error:", error.response);
          });
      }

      this.showDisableConfirmation = false;
      this.deleteItem = {};
      this.deleteType = "";
    },
    async disablePersonRole() {
      // delete person role privileges
      await PersonRolePrivilegeServices.deletePrivilegesForPersonRole(
        this.disabledRole.id
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
      await this.getAppointments();
      let disableUser = {
        fName: this.person.fName,
        lName: this.person.lName,
        userID: this.person.id,
        selectedRole: {
          type: this.disabledRole.type,
        },
      };
      for (let i = 0; i < this.appointments.length; i++) {
        await this.cancelAppointment(this.appointments[i], disableUser);
      }
      await this.getPersonRoles();
      await this.getPersonTopics();
    },
    async getAppointments() {
      await AppointmentServices.getUpcomingAppointmentForPersonForGroup(
        this.group.id,
        this.person.id
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
