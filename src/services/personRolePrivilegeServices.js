import apiClient from "@/services/services.js";

 export default {

     ///Persons CRUD commands
     getAllPersonRolePrivileges() {
       return apiClient.get("personroleprivilege");
     },
     getPersonRole(id) {
       return apiClient.get("personroleprivilege/" + id);
     },
     addPersonRolePrivilege(personroleprivilege) {
       return apiClient.post("personroleprivilege", personroleprivilege);
     },
     updatePersonRolePrivilege(personRolePrivilegeId, personroleprivilege) {
       return apiClient.put("personroleprivilege/" + personRolePrivilegeId, personroleprivilege);
     },
     deletePersonRolePrivilege(personRolePrivilegeId) {
       return apiClient.delete("personroleprivilege/" + personRolePrivilegeId);
     }
   }; 

   