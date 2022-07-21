import apiClient from "@/services/services.js";

 export default {

     ///Persons CRUD commands
     getAllPersonRoles() {
       return apiClient.get("personrole");
     },
     // getPersons(start, length) {
     //   return apiClient.get(`persons?start=${start}&length=${length}`);
     // },
     getPersonRole(id) {
       return apiClient.get("personrole/" + id);
     },
     getOneForType(personId, roleId) {
      return apiClient.get("personrole/person/" + personId + "/role/" + roleId);
      },
     getAllForPerson(id) {
        return apiClient.get("personrole/person/" + id);
      },
     addPersonRole(personrole) {
       return apiClient.post("personrole", personrole);
     },
     updatePersonRole(personRoleId, personrole) {
       return apiClient.put("personrole/" + personRoleId, personrole);
     },
     deletePersonRole(personRoleId) {
       return apiClient.delete("personrole/" + personRoleId);
     }
   }; 

   