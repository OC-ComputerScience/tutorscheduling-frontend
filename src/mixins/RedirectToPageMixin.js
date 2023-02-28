import GroupServices from "../services/groupServices";
import Utils from "../config/utils";

// TODO if response is unauthorized, immediately clear storage

export const RedirectToPageMixin = {
  data() {
    return {
      openSelect: false,
      contractroles: [],
      topicroles: [],
      personroles: [],
    };
  },
  methods: {
    handleRedundantNavigation(name, id) {
      if (id === null) {
        this.$router
          .push({
            name: name,
          })
          .catch((err) => {
            // Ignore the vuex err regarding  navigating to the page they are already on.
            if (
              err.name !== "NavigationDuplicated" &&
              !err.message.includes(
                "Avoided redundant navigation to current location"
              )
            ) {
              // But print any other errors to the console
              console.log(err);
            }
          });
      } else {
        this.$router
          .push({
            name: name,
            params: { id: id },
          })
          .catch((err) => {
            // Ignore the vuex err regarding  navigating to the page they are already on.
            if (
              err.name !== "NavigationDuplicated" &&
              !err.message.includes(
                "Avoided redundant navigation to current location"
              )
            ) {
              // But print any other errors to the console
              console.log(err);
            }
          });
      }
    },
    async getPersonRoles(personId) {
      await GroupServices.getContractsNeededForPerson(personId)
        .then((response) => {
          this.contractroles = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
          return;
        });

      // if the user doesn't have any incomplete roles, get normal roles
      // topicroles will include roles that do have topics
      if (this.contractroles.length === 0) {
        await GroupServices.getTopicsNeededForTutor(personId)
          .then((response) => {
            this.topicroles = response.data;
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
            return;
          });
        await GroupServices.getGroupsForPerson(personId)
          .then((response) => {
            this.personroles = response.data;
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
            return;
          });
      }
    },
    async goToPage(personId) {
      await this.getPersonRoles(personId);
      if (this.personroles.length === 0) {
        for (let i = 0; i < this.contractroles.length; i++) {
          let group = this.contractroles[i];
          for (let j = 0; j < group.role.length; j++) {
            let role = group.role[j];
            if (role.type === "Student" || role.type === "Tutor") {
              this.handleRedundantNavigation("contract", role.personrole[0].id);
              return;
            }
          }
        }
      } else {
        for (let i = 0; i < this.topicroles.length; i++) {
          let group = this.topicroles[i];
          if (
            group.topic.length === 0 &&
            group.role[0].personrole[0].status !== "disabled"
          ) {
            this.handleRedundantNavigation(
              "tutorAddTopics",
              group.role[0].personrole[0].id
            );
            return;
          }
        }
        if (
          this.user.selectedGroup === null ||
          this.user.selectedGroup === "" ||
          this.user.selectedGroup === undefined
        ) {
          for (let i = 0; i < this.personroles.length; i++) {
            let group = this.personroles[i];
            for (let j = 0; j < group.role.length; j++) {
              let role = group.role[j];
              if (role.type === "Admin") {
                this.user.selectedGroup = group.name;
                this.user.selectedRole = {
                  type: role.type,
                  personRoleId: role.personrole[0].id,
                };
                Utils.setStore("user", this.user);
                this.handleRedundantNavigation(
                  "adminHome",
                  role.personrole[0].id
                );
                return;
              }
            }
          }
        }

        this.openSelect = true;
      }
    },
  },
};
