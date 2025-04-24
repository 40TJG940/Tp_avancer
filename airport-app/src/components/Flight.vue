<template>
  <div class="flight" :class="{ 'past-flight': isPastFlight }">
    <div class="flight-header">
      <div class="flight-number">{{ flightDetail.flight_number }}</div>
      <span v-if="isFollowed" class="followed-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        Following
      </span>
    </div>
    <div class="flight-city">{{ flightDetail.city }}</div>
    <div class="flight-company">{{ flightDetail.company }}</div>
    <div class="flight-time">
      <template v-if="isArrival">
        <span class="scheduled">{{ formatTime(flightDetail.arrival_time) }}</span>
        <span v-if="flightDetail.arrival_time_estimated && flightDetail.arrival_time_estimated !== 'Cancelled'" 
              class="estimated">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          {{ formatTime(flightDetail.arrival_time_estimated) }}
        </span>
      </template>
      <template v-else>
        {{ formatTime(flightDetail.departure_time) }}
      </template>
    </div>
    <div class="flight-status" :class="statusClass">
      {{ flightDetail.status }}
    </div>
    <button @click="followFlight" class="follow-button" :disabled="isFollowed">
      <svg v-if="!isFollowed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      {{ isFollowed ? 'Following' : 'Follow' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'Flight',
  props: {
    flightDetail: {
      type: Object,
      required: true
    },
    isArrival: {
      type: Boolean,
      default: false
    },
    isFollowed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    statusClass() {
      if (this.flightDetail.status === 'Delayed') {
        return 'delayed';
      } else if (this.flightDetail.status === 'Cancelled') {
        return 'cancelled';
      } else {
        return 'on-time';
      }
    },
    isPastFlight() {
      const currentTime = new Date();
      const flightTime = this.isArrival 
        ? new Date(`${new Date().toDateString()} ${this.flightDetail.arrival_time}`) 
        : new Date(`${new Date().toDateString()} ${this.flightDetail.departure_time}`);
      
      return flightTime < currentTime;
    }
  },
  methods: {
    followFlight() {
      if (!this.isFollowed) {
        this.$emit('follow', this.flightDetail);
      }
    },
    formatTime(time) {
      if (!time) return '';
      return time;
    }
  }
}
</script>

<style scoped>
/* Les styles sont définis dans le fichier style.css global */
.followed-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.estimated {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>