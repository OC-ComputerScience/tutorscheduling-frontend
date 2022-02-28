<template>
  <v-container>
      <v-toolbar>
        <v-toolbar-title>Sign Up</v-toolbar-title>
      </v-toolbar>
      <v-form
      ref="form" 
      v-model="valid"
      lazy validation
    >
      <v-text-field
        v-model="phoneNum"
        id="phoneNum"
        :counter="50"
        label="phoneNum"
        hint="(123) 456-7890"
        persistent-hint
        required
      ></v-text-field>

      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="signUp"
      >
        Continue
      </v-btn>

      <v-btn
        color="error"
        class="mr-4"
        @click="cancel"
      >
        Cancel
      </v-btn>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: 'signup',
  components: {
  }
}
</script>