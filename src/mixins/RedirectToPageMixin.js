import RoleServices from "../services/roleServices";
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
        // TODO check about roles for admins
        await RoleServices.getRoleForPerson(personId)
          .then((response) => {
            console.log(this.personroles);
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
          if (group.role.length > 0) {
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
        }
      } else {
        for (let i = 0; i < this.topicroles.length; i++) {
          let group = this.topicroles[i];
          if (group.topic.length === 0) {
            this.$router.push({
              name: "tutorAddTopics",
              params: { id: group.role[0].personrole[0].id },
            });
            break;
          }
        }
        // TODO fix this for admins
        for (let i = 0; i < this.personroles.length; i++) {
          let role = this.personroles[i];
          for (let j = 0; j < role.personrole.length; j++) {
            let pRole = role.personrole[j];
            if (role.type === "Admin") {
              this.user.selectedGroup = this.group.name;
              this.user.selectedRole = {
                type: role.type,
                personRoleId: pRole.id,
              };
              Utils.setStore("user", this.user);
              this.$router.push({
                name: "adminHome",
                params: { id: pRole.id },
              });
              break;
            }
          }
        }
        this.openSelect = true;
      }
    },
  },
};
