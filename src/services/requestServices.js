import apiClient from "@/services/services.js";

export default {
  
    ///Requests CRUD commands
    getAllRequests() {
      return apiClient.get("request");
    },
    getRequests(start, length) {
      return apiClient.get(`requests?start=${start}&length=${length}`);
    },
    getRequest(id) {
      return apiClient.get("request/" + id);
    },
    addRequest(request) {
      return apiClient.post("request", request);
    },
    updateRequest(requestId, request) {
      return apiClient.put("request/" + requestId, request);
    },
    deleteRequest(requestId) {
      return apiClient.delete("request/" + requestId);
    }
  };