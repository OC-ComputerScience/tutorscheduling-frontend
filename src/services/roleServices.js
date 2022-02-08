import apiClient from "@/services/services.js";

export default {
  
    ///Roles CRUD commands
    getAllRoles() {
      return apiClient.get("role");
    },
    getRoles(start, length) {
      return apiClient.get(`roles?start=${start}&length=${length}`);
    },
    getRole(id) {
      return apiClient.get("role/" + id);
    },
    addRole(role) {
      return apiClient.post("role", role);
    },
    updateRole(roleId, role) {
      return apiClient.put("role/" + roleId, role);
    },
    deleteRole(roleId) {
      return apiClient.delete("role/" + roleId);
    }
  };