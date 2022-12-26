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
              savePhoneNum();
            ">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <RegistrationComponent
      v-if="
        openRegistration && this.user !== null && !dialog && this.fName !== ''
      "></RegistrationComponent>

    <GroupViewComponent v-if="openSelect"></GroupViewComponent>
  </div>
</template>

<script>
import AuthServices from "@/services/authServices";
import PersonServices from "@/services/personServices";
import Utils from "@/config/utils.js";
import RegistrationComponent from "./RegistrationComponent.vue";
import GroupViewComponent from "./GroupViewComponent.vue";
import { RedirectToPageMixin } from "../mixins/RedirectToPageMixin";

export default {
  name: "GoogleLoginComponent",
  components: {
    RegistrationComponent,
    GroupViewComponent,
  },
  mixins: [RedirectToPageMixin],
  data() {
    return {
      dialog: false,
      openRegistration: false,
      phoneNum: "",
      person: {},
      fName: "",
      lName: "",
      user: {},
    };
  },
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
      await this.getPerson();
      this.person.phoneNum = this.phoneNum;
      this.person.fName = this.fName;
      this.person.lName = this.lName;
      // save phone number and name locally and to database
      this.user.phoneNum = this.phoneNum;
      this.user.fName = this.fName;
      this.user.lName = this.lName;
      Utils.setStore("user", this.user);
      await PersonServices.updatePerson(this.person.id, this.person)
        .then()
        .catch((error) => {
          console.log("There was an error:", error.response);
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
        this.openRegistration = true;
      } else {
        this.goToPage(this.user.userID);
      }
    },
  },
};
</script>
