<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <InformationComponent
          message="View or make changes to your group's settings."></InformationComponent>
      </v-toolbar>
      <br />
      <v-alert v-model="showAlert" dismissible :type="alertType">{{
        this.alert
      }}</v-alert>
      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          v-if="this.user.selectedRole.type === 'superadmin'"
          v-model="group.name"
          id="name"
          :counter="50"
          label="Name"
          readonly></v-text-field>

        <v-textarea
          v-model="group.description"
          auto-grow
          rows="2"
          id="description"
          :counter="500"
          label="Description"
          @change="enableUpdate = true"
          required></v-textarea>

        <v-select
          v-model="group.timeInterval"
          :items="intervals"
          label="Appointment Time Interval"
          @change="enableUpdate = true"
          required>
        </v-select>

        <v-select
          v-model="group.minApptTime"
          :items="minApptTimes"
          label="Minimum Appointment Length"
          @change="enableUpdate = true"
          required>
        </v-select>

        <v-select
          v-model="group.bookPastMinutes"
          :items="pastMinutes"
          label="Minutes to Book Past Start Time"
          @change="enableUpdate = true"
          required>
        </v-select>

        <v-select
          v-model="group.allowSplittingAppointments"
          :items="splittingAppts"
          label="Allow Splitting Appointments"
          @change="enableUpdate = true"
          required>
        </v-select>

        <v-btn
          :disabled="!valid || !enableUpdate"
          color="success"
          class="mr-4"
          @click="updateGroup()">
          Update Settings
        </v-btn>
      </v-form>

      <br /><br />
      <v-card>
        <v-card-title>
          Available Privileges
          <v-spacer></v-spacer>
          <InformationComponent
            message="Listed are privileges available to give to people in your group."></InformationComponent>
        </v-card-title>
        <v-data-table
          :headers="privilegeHeaders"
          :items="privileges"
          :items-per-page="50">
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import GroupServices from "@/services/groupServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import InformationComponent from "../../../components/InformationComponent.vue";
import Utils from "../../../config/utils";

export default {
  props: ["id"],
  components: {
    InformationComponent,
  },
  data() {
    return {
      alertType: "success",
      alert: "",
      showAlert: false,
      enableUpdate: false,
      valid: false,
      intervals: [15, 30],
      minApptTimes: [30, 45],
      pastMinutes: [0, 10, 15],
      splittingAppts: [true, false],
      group: {},
      user: {},
      message: "",
      roles: ["admin"],
      privileges: [
        {
          privilege: "Make flexible slots that allow for shorter appointments",
          description:
            "Allows a tutor to make potentially shorter appointments. They will be able to make appointments the length of the Appointment Time Interval instead of the Minimum Appointment Time.",
        },
        {
          privilege: "Receive notifications for applications",
          description:
            "Allows an admin to receive notifications any time someone applies to be a tutor.",
        },
        {
          privilege: "Receive notifications for requests",
          description:
            "Allows an admin to receive notifications any time someone sends a request for help.",
        },
        {
          privilege: "Sign up students for appointments",
          description:
            "Allows a tutor to be able to sign students up for appointments the same way an admin can.",
        },
      ],
      privilegeHeaders: [
        { text: "Privilege", value: "privilege" },
        { text: "Description", value: "description" },
      ],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    await this.getGroupByPersonRoleId();
    this.message = this.group.name + "'s Settings";
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
    async updateGroup() {
      await GroupServices.updateGroup(this.group.id, this.group)
        .then(() => {
          this.alertType = "success";
          this.alert = "You have successfully updated your group's settings.";
          this.enableUpdate = false;
          this.showAlert = true;
        })
        .catch((error) => {
          this.alertType = "error";
          this.alert = error.response.data.message;
          this.enableUpdate = false;
          this.showAlert = true;
          console.log("There was an error:", error.response);
        });
    },
  },
};
</script>
