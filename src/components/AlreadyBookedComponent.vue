<template>
  <div>
    <v-card>
      <v-card-title>Already Booked</v-card-title>
      <v-card-text>
        This appointment has been booked while you were viewing it. Please find
        another time.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey white--text"
          @click="$emit('handleReturningAlreadyBooked')"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AlreadyBookedComponent",
  props: {},
  data() {
    return {};
  },
  computed: {},
};
</script>
