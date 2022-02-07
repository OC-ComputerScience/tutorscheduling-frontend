
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Roles</v-toolbar-title>
      </v-toolbar>
      <br><br>
    <v-card>
      <v-card-title>
        <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn
        color="accent"
        elevation="2"
        @click="addRole"
      >
        Add
    </v-btn>

    <v-btn
        class="mr-4"
        @click="cancel"
      >
        Back
    </v-btn>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :search="search"
        :items="roles"
        :items-per-page="50"
        @click:row="rowClick"
      ></v-data-table>
    </v-card>
    </v-container>
  </div>
</template>

<script>
  import RoleServices from '@/services/roleServices.js'

  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        search: '',
        roles: [],
        group: {},
        headers: [{text: 'ID', value: 'id'}, 
                  {text: 'Type', value: 'type'},
                  {text: 'Group', value: 'groupId'}]
      }
    },
    created() {
      this.getRoles();
    },
    methods: {
      getRoles() {
        RoleServices.getAllRoles()
        .then(response => {
          this.roles = response.data;
        })
        .catch(error => {
          console.log("There was an error:", error.response)
        });
      },
      deleteRole(id, name) {
        let confirmed = confirm(`Are you sure you want to delete ${name}`);
        if(confirmed) {
          RoleServices.deleteRole(id)
          .then(() => {
            this.getRoles(this.start, this.length);
          })
          .catch(error => {
            console.log("There was an error:", error.response)
          });
        }
      },
      getPrevious() {
        if(this.start >= this.length) {
          this.start -= this.length;
          this.getRoles(this.start, this.length);
        }
      },
      getNext() {
        if(this.courses.length === this.length) {
          this.start += this.length;
          this.getRoles(this.start, this.length);
        }
      },
      rowClick: function (item, row) {      
        row.select(true);
        this.$router.push({ name: 'roleView', params: { id: item.id } });
      },
      addRole() {
        this.$router.push({ name: 'roleAdd'});
      },
      cancel() {
        this.$router.go(-1);
      }
    }
  }
</script>
