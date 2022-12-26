<template>
  <div>
    <v-card>
      <v-card-title>{{ cancelTitle }} </v-card-title>
      <v-card-subtitle>{{ cancelSubtitle }}</v-card-subtitle>
      <v-card-text>
        {{ cancelBody }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          class="white--text"
          @click="$emit('handleReturningCancel')"
          >{{ cancelButton }}</v-btn
        >
        <v-btn color="error" @click="$emit('handleReturningSuccess')">{{
          agreeButton
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "DeleteConfirmationComponent",
  props: {
    type: String,
    item: Object,
  },
  computed: {},
  data() {
    return {
      cancelTitle: "",
      cancelSubtitle: "",
      cancelBody: "",
      cancelButton: "No, keep it",
      agreeButton: "",
    };
  },
  created() {
    if (this.type === "appointment") {
      this.setupForAppointment();
    } else if (this.type === "location" || this.type === "topic") {
      this.setupForLocationTopic();
    } else if (this.type === "privilege" || this.type === "persontopic") {
      this.setupForPrivilegeTopic();
    } else if (this.type === "personrole") {
      this.setupForPersonRole();
    }
  },
  methods: {
    setupForAppointment() {
      if (this.item.status === "pending") {
        this.cancelTitle = "Are you sure you want to reject this appointment?";
        this.agreeButton = "Yes, reject";
        this.cancelBody = "Rejecting ";
      } else if (
        this.item.status === "booked" ||
        this.item.status === "available"
      ) {
        this.cancelTitle = "Are you sure you want to cancel this appointment?";
        this.agreeButton = "Yes, cancel";
        this.cancelBody = "Canceling ";
      }
      this.cancelBody += "this appointment cannot be undone.";
    },
    setupForLocationTopic() {
      this.cancelTitle =
        "Are you sure you want to disable the " +
        this.item.name +
        " " +
        this.type +
        "?";
      this.cancelBody =
        "Disabling this " +
        this.type +
        " will make it unavailable for any future appointments.";
      this.agreeButton = "Yes, disable";
    },
    setupForPrivilegeTopic() {
      console.log(this.item);
      let type = "";
      let name = "";
      if (this.type === "persontopic") {
        type = "topic";
        name = this.item.name;
      } else if (this.type === "privilege") {
        type = this.type;
        name = this.item.privilege;
      }
      this.cancelTitle =
        "Are you sure you want to delete this " +
        type +
        " for " +
        this.item.person.fName +
        " " +
        this.item.person.lName +
        "?";
      this.cancelSubtitle =
        type.charAt(0).toUpperCase() + type.slice(1) + ": " + name;
      this.cancelBody =
        "\nDeleting this " +
        type +
        " will make it unavailable for " +
        this.item.person.fName +
        " " +
        this.item.person.lName +
        " to use.";
      this.agreeButton = "Yes, delete";
    },
    setupForPersonRole() {
      console.log(this.item);
      this.cancelTitle =
        "Are you sure you want to disable the " +
        this.item.type.toLowerCase() +
        " role for " +
        this.item.person.fName +
        " " +
        this.item.person.lName +
        "?";
      this.cancelBody =
        "Disabling this role will cancel all future appointments";
      if (this.item.type === "Tutor") {
        this.cancelBody +=
          ", delete the tutor's topics, delete the tutor's privileges";
      }
      this.cancelBody +=
        ", and make this role unavailable for this person to use.";
      this.agreeButton = "Yes, disable";
    },
  },
};
</script>
