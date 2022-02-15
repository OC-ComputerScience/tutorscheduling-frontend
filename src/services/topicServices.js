import apiClient from "@/services/services.js";

export default {
  
    ///Topics CRUD commands
    getAllTopics() {
      return apiClient.get("topic");
    },
    getTopics(start, length) {
      return apiClient.get(`topics?start=${start}&length=${length}`);
    },
    getTopic(id) {
      return apiClient.get("topic/" + id);
    },
    addTopic(topic) {
      return apiClient.post("topic", topic);
    },
    updateTopic(topicId, topic) {
      return apiClient.put("topic/" + topicId, topic);
    },
    deleteTopic(topicId) {
      return apiClient.delete("topic/" + topicId);
    }
  };