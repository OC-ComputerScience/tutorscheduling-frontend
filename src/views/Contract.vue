<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>{{ this.message }}</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <h4>
        Before continuing to this service, you must sign contracts for the
        following positions. Please click on each title to sign its contract.
      </h4>
      <v-row justify="center">
        <v-col v-for="role in roles" :key="role.id">
          <v-card
            @click="role.dialog = true"
            class="mx-auto my-12 d-flex justify-center"
            max-width="400"
            height="100"
            elevation="10"
            :style="{ 'background-color': role.color }">
            <v-card-title class="justify-center white--text">
              {{ role.type }} - {{ role.groupName }}
            </v-card-title>
          </v-card>

          <v-dialog v-model="role.dialog" persistent max-width="1000px">
            <v-card>
              <v-card-title>
                <span class="text-h5"
                  >Sign a contract for {{ role.groupName }}:</span
                >
              </v-card-title>
              <pdf
                v-for="i in role.numPages"
                :key="i"
                :page="i"
                :src="role.pdfName"></pdf>
              <v-container>
                <v-text-field
                  v-model="signature"
                  label="Digital Signature"
                  :hint="user.fullName"
                  persistent-hint
                  v-on:keyup.enter="
                    role.dialog = false;
                    save(role);
                  "></v-text-field>
              </v-container>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="success"
                  text
                  :disabled="!signature || signature !== user.fullName"
                  @click="
                    role.dialog = false;
                    signature = '';
                    save(role);
                  ">
                  Agree
                </v-btn>
              </v-card-actions>
              <br />
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>

      <GroupViewComponent v-if="openSelect"></GroupViewComponent>
    </v-container>
  </div>
</template>

<script>
import pdf from "vue-pdf";
import GroupServices from "@/services/groupServices.js";
import PersonRoleServices from "@/services/personRoleServices.js";
import Utils from "@/config/utils.js";
import GroupViewComponent from "@/components/GroupViewComponent.vue";
import { RedirectToPageMixin } from "../mixins/RedirectToPageMixin";

export default {
  name: "Contract",
  mixins: [RedirectToPageMixin],
  components: {
    pdf,
    GroupViewComponent,
  },
  data() {
    return {
      //dialog: [],
      message: "Sign Contract",
      openSelect: false,
      roles: [],
      signature: "",
      numPages: 2,
      colors: [
        "#47121D",
        "#EE5044",
        "#63BAC0",
        "#196CA2",
        "#F8C545",
        "#032F45",
      ],
      user: {},
      files: [
        { pdf: "NewCollege-Student.pdf", pages: 1 },
        { pdf: "StudentSuccessCenter-Student.pdf", pages: 1 },
        { pdf: "WritingCenter-Student.pdf", pages: 1 },
        { pdf: "NewCollege-Tutor.pdf", pages: 1 },
        { pdf: "StudentSuccessCenter-Tutor.pdf", pages: 1 },
        { pdf: "WritingCenter-Tutor.pdf", pages: 2 },
      ],
      studentContracts: [
        "NewCollege-Student.pdf",
        "StudentSuccessCenter-Student.pdf",
        "WritingCenter-Student.pdf",
      ],
      tutorContracts: [
        "NewCollege-Tutor.pdf",
        "StudentSuccessCenter-Tutor.pdf",
        "WritingCenter-Tutor.pdf",
      ],
    };
  },
  async created() {
    this.user = Utils.getStore("user");
    this.user.fullName = this.user.fName + " " + this.user.lName;
    await this.setContracts();
  },
  methods: {
    // check that if there are multiple contracts to sign, some of the buttons go away
    async save(role) {
      await this.updatePersonRole(role);
      await this.goToPage(this.user.userID);
    },
    async setContracts() {
      this.roles = [];
      await GroupServices.getContractsNeededForPerson(this.user.userID)
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let group = response.data[i];
            for (let j = 0; j < group.role.length; j++) {
              let role = group.role[j];
              for (let k = 0; k < role.personrole.length; k++) {
                let personrole = role.personrole[k];
                let tempFile = this.files.filter(function (file) {
                  return (
                    file.pdf.includes(group.name.replace(/\s/g, "")) &&
                    file.pdf.includes(role.type.toString())
                  );
                });
                personrole.pdfName = tempFile[0].pdf;
                personrole.numPages = tempFile[0].pages;
                personrole.groupName = group.name;
                personrole.dialog = false;
                personrole.signature = null;
                personrole.color = this.colors[k % this.colors.length];
                personrole.type = role.type;
                this.roles.push(personrole);
              }
            }
          }
        })
        .catch((error) => {
          this.message = error.response.data.message;
          console.log("There was an error:", error.response);
        });
    },
    async updatePersonRole(role) {
      let updatedRole = {};
      if (role.type.includes("Student")) updatedRole.status = "approved";
      updatedRole.agree = true;
      updatedRole.dateSigned = Date();
      updatedRole.id = role.id;
      updatedRole.personId = role.personId;
      updatedRole.roleId = role.roleId;
      updatedRole.createdAt = role.createdAt;
      updatedRole.updatedAt = role.updatedAt;
      await PersonRoleServices.updatePersonRole(role.id, updatedRole).catch(
        (error) => {
          this.message = error.response.data.message;
        }
      );
    },
  },
};
</script>
