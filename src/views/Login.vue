<template>
  <v-container>
      <v-toolbar>
        <v-toolbar-title>Sign In</v-toolbar-title>
      </v-toolbar>
      <br><br>
      <SocialLogin />
  </v-container>
</template>

<script>
import SocialLogin from '@/components/SocialLogin'
export default {
  name: 'login',
  components: {
    SocialLogin
  }
}
</script>