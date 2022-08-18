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
    getPendingTutorsForGroup(groupId) {
      return apiClient.get("person/tutor/" + groupId);
    },
    getApprovedTutorsForGroup(groupId) {
      return apiClient.get("person/appTutor/" + groupId);
    },
    getHoursPerTutor(groupId, currWeek){
      return apiClient.get("person/group/" + groupId + "/hours/week/" + currWeek);
    },
    getPersonForEmail(email) {
      return apiClient.get("person/email/" + email);
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
  