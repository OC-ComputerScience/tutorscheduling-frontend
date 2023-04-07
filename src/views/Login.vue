<template>
  <div>
    <v-container>
      <v-card-title
        class="justify-center text-h4 font-weight-bold pt-4 pb-10 pl-0 accent--text"
        >Welcome to OC's Tutor Scheduling!
      </v-card-title>
      <v-row justify="center">
        <div id="parent_id" class="justify-center" display="flex"></div>
      </v-row>
      <br /><br />
      <v-card>
        <v-card-title> About OC's Tutor Scheduling Services </v-card-title>
        <v-card-text>
          <p>
            Oklahoma Christian University wants to aid students in being
            successful, including offering multiple different tutoring services.
            <br />
          </p>
          <h3>For on-campus students:</h3>
          <ul>
            <li>
              The <b>Student Success Center</b> offers individual and group
              tutoring sessions for any course.
            </li>
            <li>
              The <b>Writing Center</b> offers individual writing assistance for
              essays and writing assignments.
            </li>
          </ul>
          <br />
          <h3>
            For off-campus students in our online, nursing and education
            work-based programs:
          </h3>
          <p>
            The <b>New College</b> offers virtual individual and group tutoring
            sessions programs.
          </p>
        </v-card-text>
      </v-card>

      <v-dialog v-model="dialog" persistent max-width="600">
        <v-card tile>
          <v-card-title>
            Hello, {{ user.fName }}! We're happy you're here.
          </v-card-title>
          <v-card-text>
            <h3>
              Enter your US phone number below to finish setting up your
              account:
            </h3>
            <br />
            <PhoneNumberComponent
              :phone-num="''"
              @editedPhoneNumber="setPhoneNumber"
            ></PhoneNumberComponent>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              text
              @click="
                dialog = false;
                savePhoneNum();
              "
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <RegistrationComponent
        v-if="openRegistration && user !== null && !dialog && fName !== ''"
        @closeRegistrationComponent="openRegistration = false"
      ></RegistrationComponent>

      <GroupViewComponent v-if="openSelect"></GroupViewComponent>
    </v-container>
  </div>
</template>

<script>
import AuthServices from "@/services/authServices";
import PersonServices from "@/services/personServices";
import Utils from "@/config/utils.js";
import RegistrationComponent from "@/components/RegistrationComponent.vue";
import GroupViewComponent from "@/components/GroupViewComponent.vue";
import PhoneNumberComponent from "@/components/PhoneNumberComponent.vue";
import { RedirectToPageMixin } from "@/mixins/RedirectToPageMixin";

export default {
  name: "Login",
  components: {
    GroupViewComponent,
    PhoneNumberComponent,
    RegistrationComponent,
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
  async mounted() {
    await this.loginWithGoogle();
  },
  created() {},
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
        .then(async (response) => {
          this.user = response.data;
          Utils.setStore("user", this.user);
          this.fName = this.user.fName;
          this.lName = this.user.lName;
          await this.openDialogs();
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
    setPhoneNumber(phoneNumber) {
      this.phoneNum = phoneNumber;
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
      await PersonServices.updatePerson(this.person.id, this.person).catch(
        (error) => {
          console.log("There was an error:", error.response);
        }
      );
      await this.openDialogs();
    },
    async openDialogs() {
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
        await this.goToPage(this.user.userID);
      }
    },
  },
};
</script>
