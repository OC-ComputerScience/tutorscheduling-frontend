import apiClient from "@/services/services.js";

export default {
  
    ///Persons CRUD commands
    getAllPersons() {
      return apiClient.get("person");
    },
    getPersons(start, length) {
      return apiClient.get(`persons?start=${start}&length=${length}`);
    },
    getPerson(id) {
      return apiClient.get("person/" + id);
    },
    getAllForGroup(groupId) {
      return apiClient.get("person/group/" + groupId);
    },
    addPerson(person) {
      return apiClient.post("person", person);
    },
    updatePerson(personId, person) {
      return apiClient.put("person/" + personId, person);
    },
    deletePerson(personId) {
      return apiClient.delete("person/" + personId);
    }
  };