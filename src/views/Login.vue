<template>
  <v-container>
      <v-toolbar>
        <v-toolbar-title>Welcome to OC Tutoring!</v-toolbar-title>
      </v-toolbar>
      <br><br>
      <SocialLogin />
      <br><br>
      <v-card>
        <v-card-title>
          About OC's Tutoring Services
        </v-card-title>
        <v-card-text>
          <p>
            Oklahoma Christian University wants to aid students in being successful, including offering multiple different tutoring services.
            <br>
            The current offered services are:
          </p>
          <h3>
            New College
          </h3>
          <p>
            Since New College is an online program, it makes sense that you have access to free virtual tutoring services! We have highly qualified tutors with flexible scheduling.
            <br>
            If you are in New College, this is the tutoring group for you!
          </p>
          <h3>
            Student Success Center
          </h3>
          <p>
            Serving as a compass to navigate towards graduation, Oklahoma's Christian's Student Success Center partners with academic programs 
            to promote personal and academic responsibility as students transition through their university experience.
            <br>
            If you are a student on campus, this is the tutoring group for you!
          </p>
          <h3>
            Writing Center
          </h3>
          <p>
            We offer free writing help by collaboratively improving your papers in one-on-one appointments in-person and online.
            <br>
            If you are a student requiring help specifically regarding writing, this is the tutoring group for you!
          </p>
        </v-card-text>
      </v-card>
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
