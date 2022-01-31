import apiClient from "@/services/services.js";

export default {
  
    ///Groups CRUD commands
    getAllGroups() {
      return apiClient.get("groups");
    },
    getGroups(start, length) {
      return apiClient.get(`groups?start=${start}&length=${length}`);
    },
    getGroup(id) {
      return apiClient.get("groups/" + id);
    },
    addGroup(group) {
      return apiClient.post("groups", group);
    },
    updateGroup(groupId, group) {
      return apiClient.put("groups/" + groupId, group);
    },
    deleteGroup(groupId) {
      return apiClient.delete("groups/" + groupId);
    }
  };