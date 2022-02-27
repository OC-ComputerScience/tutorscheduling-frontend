<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Groups</v-toolbar-title>
      </v-toolbar>
      <pdf src="../assets/Student Success Contract.pdf"></pdf>
    </v-container>
  </div>
</template>

<script>
  import pdf from 'vue-pdf'
  export default {
    name: 'App',
    components: {
        pdf
    },
    data() {
      return {
      }
    },
    created() {
    },
    methods: {
      
    }
  }
</script>