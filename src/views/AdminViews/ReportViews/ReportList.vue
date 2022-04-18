
<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Reports</v-toolbar-title>
      </v-toolbar>
      <br><br>
      <download-csv
        class   = "btn btn-default"
        :data   = "json_data"
        name    = "filename.csv"
    >
        Download CSV (This is a slot)
    </download-csv>
    </v-container>
  </div>
</template>

<script>
import Utils from '@/config/utils.js'
import GroupServices from "@/services/groupServices.js";

  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        search: '',
        group: {},
        user: {},
        headers: [{text: 'ID', value: 'id'}, 
                  {text: 'Type', value: 'type'},
                  {text: 'Group', value: 'group.name'}]
      }
    },
    async created() {
      this.user = Utils.getStore('user');
      await this.getGroup(this.user.selectedGroup.replace(/%20/g, " "))
      .then(() => {
        
      })
    },
    methods: {
      async getGroup(name) {
        await GroupServices.getGroupByName(name)
        .then((response) => {
          this.group = response.data[0];
        })
        .catch((error) => {
          console.log("There was an error:", error.response);
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
      addRole() {
        this.$router.push({ name: 'roleAdd'});
      },
      cancel() {
        this.$router.go(-1);
      }
    }
  }
</script>
