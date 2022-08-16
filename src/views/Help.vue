<template>
    <div>
        <v-container>
            <v-toolbar>
                <v-toolbar-title>How to use this application:</v-toolbar-title>
            </v-toolbar>
            <br><br>
            <!-- <button @click="$refs.myPdfComponent.print()">print</button> -->
            <pdf
                v-for="i in tutorial.pages"
                :key="i"
                :page="i"
                :src="tutorial.pdf"
            ></pdf>
        </v-container>
    </div>
</template>

<script>
import Utils from '@/config/utils.js'
import pdf from 'vue-pdf';
import PersonRoleServices from "@/services/personRoleServices.js"
import RoleServices from "@/services/roleServices.js"

export default {
    props: ["id"],
    components: {
        pdf
    },
    data () {
        return {
            user: {},
            tutorial: {},
            currentRole: {},
            files: [
                { pdf: "StudentTutorial.pdf", pages: 23 },
                { pdf: "TutorTutorial.pdf", pages: 30 }
            ],
        }
    },
    async created () {
        this.user = Utils.getStore('user');
        await this.getCurrentRole();
        if(this.checkRole("Student")) {
            this.tutorial = this.files[0]
        }
        else if(this.checkRole("Tutor")) {
            this.tutorial = this.files[1]
        }
        console.log(this.tutorial)
    },
    methods: {
        async getCurrentRole() {
            await PersonRoleServices.getPersonRole(this.id).then(async(response) => {
                await RoleServices.getRole(response.data.roleId).then((result) => {
                    this.currentRole = result.data
                })
                .catch((error) => {
                    console.log("There was an error:", error.response);
                });
            })
            .catch((error) => {
                console.log("There was an error:", error.response);
            });
        },
        checkRole(type) {
            if(this.currentRole != null && this.currentRole.type == type) {
                return true;
            }
            else {
                return false;
            }
        },
    }
}
</script>

