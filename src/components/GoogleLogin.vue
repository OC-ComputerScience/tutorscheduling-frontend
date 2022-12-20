<template>
  <div class="signup-buttons">
    <v-row justify="center">
      <div display="flex" id="parent_id"></div>
    </v-row>

    <v-dialog v-model="dialog" persistent max-width="800">
      <v-card tile>
        <v-card-title>
          Hello, {{ this.user.fName }}! We're happy you're here.
        </v-card-title>
        <v-card-text>
          <h3>Finish setting up your account below:</h3>
          <v-container>
            <v-row>
              <v-text-field
                v-model="phoneNum"
                id="phoneNum"
                :counter="50"
                label="Mobile Phone Number"
                hint="123-456-7890"
                persistent-hint
                required
                v-on:keyup.enter="
                  dialog = false;
                  savePhoneNum();
                "></v-text-field>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="accent"
            text
            @click="
              dialog = false;
              openRegistration = true;
              savePhoneNum();
            ">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Registration
      v-if="
        openRegistration && this.user !== null && !dialog && this.fName !== ''
      "></Registration>
  </div>
</template>

<script>
import AuthServices from "@/services/authServices";
import PersonServices from "@/services/personServices";
import RoleServices from "@/services/roleServices";
import Utils from "@/config/utils.js";
import Registration from "./Registration.vue";

export default {
  name: "GoogleLogin",
  components: {
    Registration,
  },
  data() {
    return {
      dialog: false,
      openRegistration: false,
      phoneNum: "",
      person: {},
      fName: "",
      lName: "",
      user: {},
      token: "",
    };
  },
  created() {},
  mounted() {
    this.loginWithGoogle();
  },
  methods: {
    async loginWithGoogle() {
      global.handleCredentialResponse = this.handleCredentialResponse;
      const client = process.env.VUE_APP_CLIENT_ID;
      global.google.accounts.id.initialize({
        client_id: client,
        cancel_on_tap_outside: false,
        auto_select: true,
        callback: global.handleCredentialResponse,
      });
      global.google.accounts.id.renderButton(
        document.getElementById("parent_id"),
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signup_with",
          width: 400,
        }
      );
    },
    async handleCredentialResponse(response) {
      let token = {
        credential: response.credential,
      };
      await AuthServices.loginUser(token)
        .then((response) => {
          this.user = response.data;
          Utils.setStore("user", this.user);
          console.log(this.user);
          this.fName = this.user.fName;
          this.lName = this.user.lName;
          this.openDialogs();
        })
        .catch((error) => {
          console.log("error", error);
        });
    },
    async getPerson() {
      await PersonServices.getPerson(this.user.userID)
        .then((response) => {
          this.person = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });
    },
    async savePhoneNum() {
      // use this to also update name if it's the first time a student is logging in
      await this.getPerson().then(() => {
        this.person.phoneNum = this.phoneNum;
        this.person.fName = this.fName;
        this.person.lName = this.lName;
        // save phone number and name locally and to database
        this.user.phoneNum = this.phoneNum;
        this.user.fName = this.fName;
        this.user.lName = this.lName;
        Utils.setStore("user", this.user);
        PersonServices.updatePerson(this.person.id, this.person);
      });
      this.openDialogs();
    },
    openDialogs() {
      // if this person doesn't have any roles, do this
      if (
        this.user.phoneNum === "" ||
        this.user.phoneNum === undefined ||
        this.user.phoneNum === null
      ) {
        this.dialog = true;
      } else if (this.user.access.length === 0) {
        this.dialog2 = true;
      } else {
        this.goToPage();
      }
    },
    async goToPage() {
      await this.getPersonRoles().then(() => {
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            if (role.type.includes("Admin")) {
              this.$router.push({
                name: "adminHome",
                params: { id: pRole.id },
              });
            } else if (
              (role.type.includes("Student") &&
                !pRole.status.includes("approved") &&
                !pRole.agree) ||
              (role.type.includes("Tutor") && !pRole.agree)
            ) {
              this.$router.push({ name: "contract" });
            }
            // make a tutor sign up for topics if they haven't been approved yet
            else if (
              role.type.includes("Tutor") &&
              pRole.status.includes("applied")
            ) {
              this.$router.push({ name: "tutorAddTopics" });
            } else if (
              role.type.includes("Student") &&
              pRole.status.includes("approved")
            ) {
              this.$router.push({
                name: "studentHome",
                params: { id: pRole.id },
              });
            } else if (
              role.type.includes("Tutor") &&
              pRole.status.includes("approved") &&
              pRole.agree
            ) {
              this.$router.push({
                name: "tutorHome",
                params: { id: pRole.id },
              });
            }
            break;
          }
        }
      });
    },
    async getPersonRoles() {
      await RoleServices.getIncompleteRoleForPerson(this.user.userID)
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let role = response.data[i];
            this.personroles.push(role);
          }
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
        });

      // if the user doesn't have any incomplete roles, get normal roles
      if (this.personroles.length === 0) {
        await RoleServices.getRoleForPerson(this.user.userID)
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              let role = response.data[i];
              this.personroles.push(role);
            }
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
          });
      }
    },
  },
};
</script>
