<template>
    <div>
        <v-container>
            <v-toolbar>
                <v-toolbar-title>Help</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                        class="mx-2"
                        color="grey darken"
                        dark
                        v-bind="attrs"
                        v-on="on"
                        >
                        mdi-information
                        </v-icon>
                    </template>
                    <span>
                        This document details how to use this application.
                    </span>
                </v-tooltip>
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
                { pdf: "StudentTutorial.pdf", pages: 24 },
                { pdf: "TutorTutorial.pdf", pages: 29 }
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

