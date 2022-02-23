<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
    >
      <v-date-picker
        v-model="dates"
        multiple
      ></v-date-picker>
    </v-col>
    <v-col
      cols="12"
      sm="6"
    >
      <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="dates"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            v-model="dates"
            multiple
            chips
            small-chips
            label="Multiple picker in menu"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-combobox>
        </template>
        <v-date-picker
          v-model="dates"
          multiple
          no-title
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn
            text
            color="primary"
            @click="menu = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="$refs.menu.save(dates)"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-menu>
    </v-col>
    <v-col
      cols="11"
      sm="5"
    >
      <v-menu
        ref="menu"
        v-model="menu2"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="startTime"
            label="Start Time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="menu2"
          v-model="startTime"
          full-width
          @click:minute="$refs.menu.save(startTime)"
        ></v-time-picker>

        
      </v-menu>
    </v-col>
    <v-col
      cols="11"
      sm="5"
    >
      <v-menu
        ref="menu"
        v-model="menu3"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="endTime"
            label="End Time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="menu3"
          v-model="endTime"
          full-width
          @click:minute="$refs.menu.save(endTime)"
        ></v-time-picker>

        
      </v-menu>
    </v-col>
    <v-btn
        color="success"
        class="mr-4"
        @click="addAvailability"
      >
        Save
      </v-btn>
  </v-row>
  
</template>

<script>
import AvailabilityServices from "@/services/availabilityServices.js";

  export default {
    data: () => ({
      availability: {},
      dates: [],
      startTime: null,
      endTime: null,
      menu: false,
      menu2: false,
      menu3: false,
    }),
    methods: {
    addAvailability() {
        this.dates.forEach(element => {
          this.availability.date = element;
          this.availability.startTime = this.startTime;
          this.availability.endTime = this.endTime;

          AvailabilityServices.addAvailability(this.availability)
            .then(() => {
            })
            .catch((error) => {
            console.log(error);
            console.log(this.endTime);
            });
        });

        this.$router.push({ name: "mainCalendar" });

      
    },
  },
  }
</script>