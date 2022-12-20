<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Welcome to OC Tutoring!</v-toolbar-title>
    </v-toolbar>
    <br /><br />
    <GoogleLogin />
    <br /><br />
    <v-card>
      <v-card-title> About OC's Tutoring Services </v-card-title>
      <v-card-text>
        <p>
          Oklahoma Christian University wants to aid students in being
          successful, including offering multiple different tutoring services.
          <br />
        </p>
        <h3>For on-campus students:</h3>
        <ul>
          <li>
            The <b>Student Success Center</b> offers individual and group
            tutoring sessions for any course.
          </li>
          <li>
            The <b>Writing Center</b> offers individual writing assistance for
            essays and writing assignments.
          </li>
        </ul>
        <br />
        <h3>
          For off-campus students in our online, nursing and education
          work-based programs:
        </h3>
        <p>
          The <b>New College</b> offers virtual individual and group tutoring
          sessions programs.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import GoogleLogin from "@/components/GoogleLogin";
export default {
  name: "login",
  components: {
    GoogleLogin,
  },
};
</script>
