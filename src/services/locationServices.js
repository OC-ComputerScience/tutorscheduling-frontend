import apiClient from "@/services/services.js";

export default {
  
    ///Locations CRUD commands
    getAllLocations() {
      return apiClient.get("location");
    },
    getLocations(start, length) {
      return apiClient.get(`locations?start=${start}&length=${length}`);
    },
    getLocation(id) {
      return apiClient.get("location/" + id);
    },
    addLocation(location) {
      return apiClient.post("location", location);
    },
    updateLocation(locationId, location) {
      return apiClient.put("location/" + locationId, location);
    },
    deleteLocation(locationId) {
      return apiClient.delete("location/" + locationId);
    }
  };