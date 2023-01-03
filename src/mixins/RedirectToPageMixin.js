import GroupServices from "../services/groupServices";
import Utils from "../config/utils";

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
    async getPersonRoles(personId) {
      await GroupServices.getContractsNeededForPerson(personId)
        .then((response) => {
          this.contractroles = response.data;
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
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
          });
        await GroupServices.getGroupsForPerson(personId)
          .then((response) => {
            this.personroles = response.data;
          })
          .catch((error) => {
            console.log("There was an error:", error.response);
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
              this.$router.push({
                name: "contract",
                params: { id: role.personrole[0].id },
              });
              break;
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
            this.$router.push({
              name: "tutorAddTopics",
              params: { id: group.role[0].personrole[0].id },
            });
            break;
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
                this.$router.push({
                  name: "adminHome",
                  params: { id: role.personrole[0].id },
                });
                break;
              }
            }
          }
        }

        this.openSelect = true;
      }
    },
  },
};
