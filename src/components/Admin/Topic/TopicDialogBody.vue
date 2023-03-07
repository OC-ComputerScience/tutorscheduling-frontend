<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-card-title>{{ isEdit ? "Edit Topic" : "Add New Topic" }}</v-card-title>
    </v-toolbar>
    <v-card-text>
      <v-text-field
        id="name"
        v-model="topic.name"
        :counter="50"
        label="Name"
      ></v-text-field>

      <v-text-field
        id="abbr"
        v-model="topic.abbr"
        :counter="25"
        label="Abbreviation"
      ></v-text-field>

      <v-select
        id="status"
        v-model="topic.status"
        :items="statuses"
        label="Status"
      ></v-select>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn v-if="isEdit" color="error" @click="$emit('deleteTopic')"
        >Delete Topic</v-btn
      >
      <v-btn color="accent" @click="$emit('closeTopicDialog')">
        {{ isEdit ? "Discard Changes" : "Cancel" }}
      </v-btn>
      <v-btn color="primary" @click="saveOrAddTopic()">{{
        isEdit ? "Save Changes" : "Add Topic"
      }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "TopicDialogBody",
  components: {},
  props: {
    sentBool: { type: [Boolean], default: false },
    sentTopic: {
      type: [Object],
      default() {
        return {
          name: "",
          abbr: "",
          status: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          groupId: 1,
        };
      },
    },
  },
  data() {
    return {
      statuses: ["active", "disabled"],
      topic: this.sentTopic,
      isEdit: this.sentBool,
    };
  },
  watch: {
    sentTopic(newTopic) {
      this.topic = newTopic;
    },
    sentBool(newVal) {
      this.isEdit = newVal;
    },
  },
  created() {},
  methods: {
    saveOrAddTopic() {
      if (this.isEdit) {
        this.topic.updatedAt = new Date();
      }

      this.$emit("saveOrAddTopic", this.topic, this.isEdit);
    },
  },
};
</script>
