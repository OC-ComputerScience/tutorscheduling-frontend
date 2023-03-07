<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="Enter information about what you are requesting and click Save."
        ></InformationComponent>
      </v-toolbar>
      <br />
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        alert
      }}</v-alert>

      <br />
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-select
          v-model="request.problem"
          :items="problems"
          label="Why are you making this request?"
          required
        >
        </v-select>
        <v-text-field
          id="courseNum"
          v-model="request.courseNum"
          :counter="50"
          label="Course Number"
          hint="Enter n/a if non applicable"
          persistent-hint
          required
        ></v-text-field>

        <v-select
          v-model="request.topicId"
          :items="topics"
          item-text="name"
          item-value="id"
          label="Topic"
          required
        >
        </v-select>

        <v-text-field
          id="description"
          v-model="request.description"
          :counter="500"
          label="Description"
          hint="Description..."
          persistent-hint
          required
        ></v-text-field>

        <br /><br />
        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="addRequest()"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import RequestServices from "@/services/requestServices.js";
import TopicServices from "@/services/topicServices.js";
import TwilioServices from "@/services/twilioServices";
import PersonServices from "@/services/personServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import RoleServices from "@/services/roleServices.js";
import Utils from "@/config/utils.js";
import InformationComponent from "../../components/InformationComponent.vue";

export default {
  name: "StudentAddRequest",
  components: {
    InformationComponent,
  },
  props: {
    id: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      showAlert: false,
      alert: "",
      alertType: "success",
      problems: [
        "No times work for me.",
        "The topic I am looking for is not here.",
        "Report an issue",
        "Other",
      ],
      request: {
        status: "Received",
      },
      person: {},
      user: {},
      group: {},
      topics: [],
      admins: [],
      roles: ["admin"],
      message: "Add A Request",
      valid: false,
    };
  },

  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId();
    await this.getTopicsForGroup();
    await this.getPerson();
    //this.getAllTopics();
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
    async getTopicsForGroup() {
      await TopicServices.getAllForGroup(this.group.id)
        .then((response) => {
          this.topics = response.data;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    async addRequest() {
      this.request.personId = this.person.id;
      this.request.groupId = this.group.id;
      await RequestServices.addRequest(this.request)
        .then(async (response) => {
          await this.getAdmins();

          for (let i = 0; i < this.admins.length; i++) {
            let tempA = this.admins[i];
            tempA.requestId = response.data.id;
            if (
              await this.checkPrivilege(
                "Receive notifications for requests",
                tempA.personroleprivilege
              )
            ) {
              let textInfo = {
                fromFirstName: this.user.fName,
                fromLastName: this.user.lName,
                adminPersonRoleId: tempA.id,
                requestId: response.data.id,
                adminPhoneNum: tempA.person.phoneNum,
                groupName: this.user.selectedGroup,
              };
              console.log(textInfo);
              await TwilioServices.sendRequestMessage(textInfo);
            }
          }

          this.$router.go(-1);
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
    cancel() {
      this.$router.go(-1);
    },
    async getPerson() {
      if (this.user.userID !== undefined && this.user !== null) {
        await PersonServices.getPerson(this.user.userID)
          .then((response) => {
            this.person = response.data;
          })
          .catch((error) => {
            this.alertType = "error";
            this.alert = error.response.data.message;
            this.showAlert = true;
            console.log("There was an error:", error.response);
          });
      }
    },
    async checkPrivilege(privilege, personroleprivileges) {
      let hasPriv = false;
      for (let i = 0; i < personroleprivileges.length; i++) {
        let priv = personroleprivileges[i];
        if (priv.privilege === privilege) hasPriv = true;
      }
      return hasPriv;
    },
    async getAdmins() {
      await RoleServices.getAllForGroupByType(this.group.id, "Admin")
        .then((response) => {
          this.admins = response.data[0].personrole;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
  },
};
</script>
