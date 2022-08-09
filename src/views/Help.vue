<template>
    <div>
        <v-container>
            <v-toolbar>
                <v-toolbar-title>How to use this service:</v-toolbar-title>
            </v-toolbar>
            <br><br>
            <button @click="$refs.myPdfComponent.print()">print</button>
            <pdf
                v-for="i in tutorial.pages"
                :key="i"
                :page="i"
                :src="tutorial.pdf"
            ></pdf>
            <v-row justify="center">
                <v-col justify="center">
                    <v-card 
                        color="error"
                    >
                        <v-card-title class="justify-center white--text">Student</v-card-title>
                        <v-card-text class="white--text">
                            <h3>Appointments:</h3>
                            <p>Make an account using your OC login information.</p>
                            <p>Select which organizations you would like to receive tutoring from.</p>
                            <p>Sign a contract for each organization.</p>
                            <p>Find a time that works for the subject you need help for in the calendar.</p>
                            <p>Sign up for that appointment time.</p>
                            <h3>Requests:</h3>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col justify="center">
                    <v-card 
                        color="darkblue"
                    >
                        <v-card-title class="justify-center white--text">Tutor</v-card-title>
                        <v-card-text class="white--text">
                            <p>Make an account using your OC login information.</p>
                            <p>Select which organizations you would like to tutor for.</p>
                            <p>Sign a contract for each organization.</p>
                            <p>Wait for the organization supervisors to approve your application.</p>
                            <p>Set up the times you are available to tutor.</p>
                            <p>Accept appointments that are set up by students.</p>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
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

