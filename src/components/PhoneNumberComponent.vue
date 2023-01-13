<template>
  <div>
    <div class="text-caption">Phone Number</div>

    <v-row>
      <v-col cols="10" sm="5" md="2">
        <v-text-field
          v-model="phoneNum1"
          hint="405"
          maxlength="3"
          persistent-hint
          outlined
          dense
          required
          @change="setNewPhoneNumber()"
        ></v-text-field>
      </v-col>
      <v-col cols="10" sm="5" md="2">
        <v-text-field
          v-model="phoneNum2"
          hint="425"
          maxlength="3"
          persistent-hint
          outlined
          dense
          required
          @change="setNewPhoneNumber()"
        ></v-text-field>
      </v-col>
      <v-col cols="10" sm="5" md="2">
        <v-text-field
          v-model="phoneNum3"
          hint="5555"
          maxlength="4"
          persistent-hint
          outlined
          dense
          required
          @keyup.enter="setNewPhoneNumber()"
          @change="setNewPhoneNumber()"
        ></v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "PhoneNumberComponent",
  props: {
    phoneNum: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      phoneNum1: "",
      phoneNum2: "",
      phoneNum3: "",
      newPhoneNumber: "",
    };
  },
  watch: {
    phoneNum(newPhoneNum, oldPhoneNum) {
      if (newPhoneNum !== oldPhoneNum) {
        this.splitPhoneNumber();
      }
    },
  },
  created() {
    this.splitPhoneNumber();
  },
  methods: {
    splitPhoneNumber() {
      if (
        this.phoneNum !== undefined &&
        this.phoneNum !== null &&
        this.phoneNum !== ""
      ) {
        console.log(this.phoneNum);
        this.phoneNum1 = this.phoneNum.substring(0, 3);
        this.phoneNum2 = this.phoneNum.substring(3, 6);
        this.phoneNum3 = this.phoneNum.substring(6, 10);
      }
    },
    setNewPhoneNumber() {
      this.newPhoneNumber = this.phoneNum1 + this.phoneNum2 + this.phoneNum3;
      this.$emit("editedPhoneNumber", this.newPhoneNumber);
    },
  },
};
</script>
