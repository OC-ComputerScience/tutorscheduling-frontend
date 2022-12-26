<template>
  <div>
    <!-- <v-dialog v-model="dialogDelete" max-width="750px"> -->
    <v-card>
      <v-card-title>{{ cancelTitle }}</v-card-title>
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
    <!-- </v-dialog> -->
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
      cancelBody: "",
      cancelButton: "",
      agreeButton: "",
    };
  },
  created() {
    if (this.type === "appointment") {
      this.setupForAppointment();
    }
  },
  methods: {
    setupForAppointment() {
      console.log(this.item);
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
      this.cancelButton = "No, keep it";
      this.dialogDelete = true;
    },
  },
};
</script>
