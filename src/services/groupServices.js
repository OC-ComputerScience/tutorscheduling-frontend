import apiClient from "@/services/services.js";

export default {
  
    ///Groups CRUD commands
    getAllGroups() {
      return apiClient.get("api/group");
    },
    getGroups(start, length) {
      return apiClient.get(`groups?start=${start}&length=${length}`);
    },
    getGroup(id) {
      return apiClient.get("api/group/" + id);
    },
    addGroup(group) {
      return apiClient.post("api/group", group);
    },
    updateGroup(groupId, group) {
      return apiClient.put("api/group/" + groupId, group);
    },
    deleteGroup(groupId) {
      return apiClient.delete("api/group/" + groupId);
    }
  };