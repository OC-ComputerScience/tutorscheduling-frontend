<template>
    <v-container>
        <v-toolbar>
            <v-toolbar-title>Sign up for topics to tutor in:</v-toolbar-title>
        </v-toolbar>
        <br><br>
        <v-item-group
            v-for="group in groups"
            :key="group.id"
            v-model="group.selected"
            multiple
        >
            <h3>{{ group.name }}</h3>
            <v-row justify="center">
            <v-col
                v-for="topic in group.topics"
                :key="topic.id"
            >
                <v-item v-slot="{ active, toggle }">
                    <v-card 
                        @click="toggle"
                        class="mx-auto my-12 d-flex justify-center"
                        max-width="400"
                        height="100"
                        elevation="10"
                        :style="{ 'background-color' : topic.color}"
                    >
                        <v-card-title class="justify-center white--text">
                            {{ topic.name }}
                        </v-card-title>
                        <v-icon class="white--text">
                        {{ active ? 'mdi-check-bold' : '' }}
                    </v-icon>
                    </v-card>
                </v-item>
            </v-col>
            </v-row>
        </v-item-group>
        <br><br>
        <v-btn
            color="blue darken-1"
            @click="dialog = true; getSelectedGroupTopics()"
            class="justify-center white--text"
        >
            Continue
        </v-btn>
        <v-dialog
          v-model="dialog"
          persistent
          max-width="600px"
          v-for="group in selectedGroupTopics"
          :key="group.id"
        >
          <v-card
          >
            <v-card-title>
              <span class="text-h5">Select your skill level for {{ group.name }} topics:</span>
            </v-card-title> 
                <br>
                <v-card-text
                    v-for="topic in group.selectedTopics"
                    :key="topic.id"
                >
                    <h3>{{ topic.name }}</h3>
                        <v-select
                            v-model="topic.skillLevel"
                            :items="levels"
                            item-text="name"
                            item-value="id"
                            label="Skill Level"
                            required
                        >
                        </v-select>
                </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="accent"
                text
                @click="goToPage(); savePersonTopics()"
              >
                Continue
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import Utils from '@/config/utils.js'
import GroupServices from '@/services/groupServices'
import TopicServices from '@/services/topicServices'
import PersonTopicServices from '@/services/personTopicServices'

  export default {
    data: () => ({
      selected: [],
      selectedGroupTopics: [],
      persontopic: {},
      user: {},
      groups: [],
      colors: ['#47121D', '#EE5044', '#63BAC0', '#196CA2', '#F8C545', '#032F45'],
      dialog: false,
      levels: ["Freshman", "Sophomore", "Junior", "Senior"]
    }),
    async created () {
        this.user = Utils.getStore('user');

        await this.getGroups()
        .then(async () => {
            await this.getGroupTopics()
            .then(async () => {
                console.log(this.groups);
                await this.existingPersonTopics()
                .then(async () => {
                    await this.getGroupTopics()
                    .then(() => {
                        if (this.groups.length === 0) {
                            this.goToPage();
                        }
                        console.log(this.groups);
                    })
                })
            })
        })
    },
    methods: {
        async getGroups() {
            // this must filter groups to only get groups where they have applied to be a tutor
            await GroupServices.getAllGroups()
            .then(response => {
                this.groups = [];
                for (let i = 0; i < response.data.length; i++) {
                    let group = response.data[i];
                    group.selected = [];
                    group.topics = [];
                    for (let j = 0; j < this.user.access.length; j++) {
                        if (group.name.toString() === this.user.access[j].name.toString()) {
                            for (let k = 0; k < this.user.access[j].roles.length; k++) {
                                if (this.user.access[j].roles[k].includes("Tutor"))
                                    this.groups.push(group);
                            }
                        }
                    }
                }
            })
            .catch(error => {
                console.log("There was an error:", error.response)
            });
        },
        async existingPersonTopics() {
            await PersonTopicServices.getAllForPerson(this.user.userID)
            .then(response => {
                console.log(response);
                for (let i = 0; i < response.data.length; i++) {
                    let topic = response.data[i];
                    for (let j = 0; j < this.groups.length; j++) {
                        let group = this.groups[j];
                        for (let k = 0; k < group.topics.length; k++) {
                            if(topic.topicId === group.topics[k].id) {
                                console.log(this.groups);
                                this.groups = this.groups.filter(function(item) {
                                    console.log(item);
                                    return item.id !== group.id;
                                })
                                console.log(this.groups);
                                break;
                            }
                        }   
                    }
                }
            })
            .catch(error => {
                console.log("There was an error:", error.response)
            });
        },
        async getGroupTopics() {
            for (let i = 0; i < this.groups.length; i++) {
                const group = this.groups[i];
                this.groups[i].topics = [];
                await TopicServices.getAllForGroup(group.id)
                .then(response => {
                    for (let j = 0; j < response.data.length; j++) {
                        let topic = response.data[j];
                        topic.color = this.colors[j % this.colors.length]
                        this.groups[i].topics.push(topic);
                    }
                })
                .catch(error => {
                    console.log("There was an error:", error.response)
                });
            }
        },
        getSelectedGroupTopics() {
            for (let k = 0; k < this.groups.length; k++) {
                for (let i = 0; i < this.groups[k].topics.length; i++) {
                    for (let j = 0; j < this.groups[k].selected.length; j++) {
                        if(this.groups[k].selected[j] === i) {
                            if (!this.selectedGroupTopics.includes(this.groups[k])) {
                                this.selectedGroupTopics.push(this.groups[k]);
                            }
                        }
                    }
                }
            }

            for (let k = 0; k < this.selectedGroupTopics.length; k++) {
                this.selectedGroupTopics[k].selectedTopics = [];
                for (let i = 0; i < this.selectedGroupTopics[k].topics.length; i++) {
                    for (let j = 0; j < this.selectedGroupTopics[k].selected.length; j++) {
                        if(this.selectedGroupTopics[k].selected[j] === i) {
                            this.selectedGroupTopics[k].selectedTopics.push(this.selectedGroupTopics[k].topics[i]);
                        }
                    }
                }
            }

            console.log(this.selectedGroupTopics);
        },
        goToPage() {
            this.$router.push({ name: "contract" });
            this.$router.go();
        },
        savePersonTopics() {
            console.log(this.selectedGroupTopics);
            for (let i = 0; i < this.selectedGroupTopics.length; i++) {
                for (let j = 0; j < this.selectedGroupTopics[i].selectedTopics.length; j++) {
                    let topic = this.selectedGroupTopics[i].selectedTopics[j];
                    this.persontopic = {
                        skillLevel: topic.skillLevel,
                        topicId: topic.id,
                        personId: this.user.userID
                    };
                    PersonTopicServices.addPersonTopic(this.persontopic);
                }
            }
        },
    }
  }
</script>