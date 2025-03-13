<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

let timer: any = null;
const hourHand: any = ref('');
const minuteHand: any = ref('');
const secondHand: any = ref('');
// Define a function that will be called repeatedly to update the clock hands
function setDate() {
  // Get the current time as a Date object
  const now = new Date();

  // Calculate the angle in degrees for the second hand based on the current seconds
  const seconds = now.getSeconds();
  const secondsDegrees = (seconds / 60) * 360 + 90;

  // Set the transform style of the second hand element to rotate it to the correct angle
  secondHand.value && (secondHand.value.style.transform = `rotate(${secondsDegrees}deg)`);

  // Calculate the angle in degrees for the minute hand based on the current minutes and seconds
  const minutes = now.getMinutes();
  const minutesDegrees = (minutes / 60) * 360 + (seconds / 60) * 6 + 90;

  // Set the transform style of the minute hand element to rotate it to the correct angle
  minuteHand.value && (minuteHand.value.style.transform = `rotate(${minutesDegrees}deg)`);

  // Calculate the angle in degrees for the hour hand based on the current hours, minutes, and seconds
  const hours = now.getHours();
  const hoursDegrees = (hours / 12) * 360 + (minutes / 60) * 30 + 90;

  // Set the transform style of the hour hand element to rotate it to the correct angle
  hourHand.value && (hourHand.value.style.transform = `rotate(${hoursDegrees}deg)`);
}
onMounted(() => {
  // Call the setDate function every 1000 milliseconds (1 second) to update the clock hands
  timer = setInterval(setDate, 1000);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="clock-wrap">
    <div class="clock">
      <div
        ref="hourHand"
        class="hand hour-hand"
      />
      <div
        ref="minuteHand"
        class="hand minute-hand"
      />
      <div
        ref="secondHand"
        class="hand second-hand"
      />
      <div class="center-dot" />
    </div>
  </div>
</template>

<style scoped lang="less">
  .clock-wrap {
    color: white;
  }

  .clock {
    transform: translate3d(0, 0, 0);
    width: 200px;
    height: 200px;
    border: 1px solid #333;
    border-radius: 50%;
    position: relative;
    margin: 8px auto;
    background-image: url(https://idgrafica.com/wp-content/uploads/2023/02/quadrante-scuro.png);
    background-size: cover;
    background-position: center;
    box-shadow: 0px 4px 5px 2px rgb(0 0 0 / 50%);
  }

  .hand {
    width: 45%;
    margin-left: 5%;
    height: 6px;
    background-color: #333;
    position: absolute;
    top: 50%;
    transform-origin: 100%;
    transform: rotate(90deg);
    filter: drop-shadow(5px 0px 5px black);
  }

  .hour-hand {
    z-index: 3;
    height: 16%;
    background-image: url(https://idgrafica.com/wp-content/uploads/2023/02/ore9.png);
    background-size: contain;
    background-repeat: no-repeat;
    background-color: transparent;
    background-position-y: -0px;
    background-position-x: 100%;
    top: 42%;
  }

  .minute-hand {
    z-index: 2;
    height: 11%;
    background-image: url(https://idgrafica.com/wp-content/uploads/2023/02/minuti9.png);
    background-size: contain;
    background-repeat: no-repeat;
    background-color: transparent;
    background-position-y: 50%;
    background-position-x: 0px;
    top: 44.5%;
    left: 0%;
  }

  .second-hand {
    z-index: 4;
    background-color: red;
    height: 2px;
  }

  .center-dot {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 3%;
    width: 3%;
    background-color: red;
    border-radius: 50%;
    z-index: 10;
  }

  .bla-bla-bla {
    width: 600px;
    margin: auto;
    font-size: 20px;
    text-align: center;
  }
</style>
