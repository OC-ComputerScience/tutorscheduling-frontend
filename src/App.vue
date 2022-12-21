<template>
  <v-app>
    <MenuBarComponent :key="$route.fullPath"></MenuBarComponent>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import MenuBarComponent from "@/components/MenuBarComponent.vue";

export default {
  name: "App",
  components: {
    MenuBarComponent,
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>
