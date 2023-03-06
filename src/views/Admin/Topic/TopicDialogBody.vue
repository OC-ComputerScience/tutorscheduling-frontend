<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-card-title>Edit Topic</v-card-title>
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
      <v-btn color="accent" @click="$emit('closeTopicDialog')"> Cancel </v-btn>
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
    isEdit: { type: [Boolean], default: false },
    sentTopic: {
      type: [Object],
      default() {
        return { name: "test", abbr: "test", status: "" };
      },
    },
  },
  data() {
    return {
      statuses: ["active", "disabled"],
      topic: this.sentTopic,
    };
  },
  created() {},
  methods: {
    saveOrAddTopic() {
      if (this.isEdit) {
        this.topic.updatedAt = new Date();
      } else {
        this.topic.createdAt = new Date();
        this.topic.updatedAt = new Date();
      }

      this.$emit("saveOrAddTopic", this.topic, this.isEdit);
    },
  },
};
</script>
