export const TimeFunctionsMixin = {
  methods: {
    //Formats time to be more user friendly
    calcTime(time) {
      if (time == null) {
        return null;
      }
      let temp = time.split(":");
      let milHours = parseInt(temp[0]);
      let minutes = temp[1];
      let hours = milHours % 12;
      if (hours == 0) {
        hours = 12;
      }
      let dayTime = ~~(milHours / 12) > 0 ? "PM" : "AM";
      return "" + hours + ":" + minutes + " " + dayTime;
    },
    //Create time slots for users to select from
    generateTimeslots(startTime, endTime, groupTimeInterval) {
      let timeInterval = groupTimeInterval;
      // get the total minutes between the start and end times.
      var totalMins = this.subtractTimes(startTime, endTime);

      // set the initial timeSlots array to just the start time
      var timeSlots = [startTime];

      // get the rest of the time slots.
      let generatedTimes = this.getTimeSlots(
        timeInterval,
        totalMins,
        timeSlots
      );

      let newTimeText = "";

      let times = [];
      for (let i = 0; i < generatedTimes.length; i++) {
        if (generatedTimes[i].length < 8)
          generatedTimes[i] = generatedTimes[i] + ":00";
        newTimeText = this.calcTime(generatedTimes[i]);
        times.push({
          time: generatedTimes[i],
          timeText: newTimeText,
        });
      }
      return times;
    },
    getTimeSlots(timeInterval, totalMins, timeSlots) {
      // base case - there are still more minutes
      if (totalMins - timeInterval >= 0) {
        // get the previous time slot to add interval to
        var prevTimeSlot = timeSlots[timeSlots.length - 1];
        // add timeInterval to previousTimeSlot to get nextTimeSlot
        var nextTimeSlot = this.addMinsToTime(timeInterval, prevTimeSlot);
        timeSlots.push(nextTimeSlot);

        // update totalMins
        totalMins -= timeInterval;

        // get next time slot
        return this.getTimeSlots(timeInterval, totalMins, timeSlots);
      } else {
        // all done!
        return timeSlots;
      }
    },
    subtractTimes(t2, t1) {
      // get each time's hour and min values
      var [t1Hrs, t1Mins] = this.getHoursAndMinsFromTime(t1);
      var [t2Hrs, t2Mins] = this.getHoursAndMinsFromTime(t2);

      // time arithmetic (subtraction)
      if (t1Mins < t2Mins) {
        t1Hrs--;
        t1Mins += 60;
      }
      var mins = t1Mins - t2Mins;
      var hrs = t1Hrs - t2Hrs;

      return hrs * 60 + mins;
    },
    getHoursAndMinsFromTime(time) {
      return time.split(":").map(function (str) {
        return parseInt(str);
      });
    },
    addMinsToTime(mins, time) {
      // get the times hour and min value
      var [timeHrs, timeMins] = this.getHoursAndMinsFromTime(time);

      // time arithmetic (addition)
      if (timeMins + mins >= 60) {
        var addedHrs = parseInt((timeMins + mins) / 60);
        timeMins = (timeMins + mins) % 60;
        if (timeHrs + addedHrs > 23) {
          timeHrs = (timeHrs + addedHrs) % 24;
        } else {
          timeHrs += addedHrs;
        }
      } else {
        timeMins += mins;
      }

      // make sure the time slots are padded correctly
      return (
        String("00" + timeHrs).slice(-2) +
        ":" +
        String("00" + timeMins).slice(-2)
      );
    },
    getLocalDateString() {
      let date = new Date();
      date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
      return date.toISOString().slice(0, 10);
    },
    roundToNearestInterval(date, groupTimeInterval) {
      const minutes = groupTimeInterval;
      const ms = 1000 * 60 * minutes;
      let newHours = Math.ceil(date.getTime() / ms) * ms;
      date.setTime(newHours);
      return date;
    },
    formatDate(date) {
      let formattedDate =
        date.toString().substring(5, 10) +
        "-" +
        date.toString().substring(0, 4);
      return formattedDate;
    },
    formatTime(time) {
      let modST = time.toString().substring(0, 2) % 12;
      let formattedTime = modST + ":" + time.toString().substring(3, 5);

      if (time.toString().substring(0, 2) > 12) {
        formattedTime = formattedTime + " P.M.";
      } else if (modST == 0 && time.toString().substring(0, 2) == "12") {
        formattedTime = "12:" + time.toString().substring(3, 5) + " P.M.";
      } else if (modST == 0) {
        formattedTime = "12:" + time.toString().substring(3, 5) + " A.M.";
      } else {
        formattedTime = formattedTime + " A.M.";
      }

      return formattedTime;
    },
  },
};