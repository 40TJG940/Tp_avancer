<template>
  <div class="flight" :class="{ 'past-flight': isPastFlight }">
    <div class="flight-header">
      <div class="flight-number">{{ flightDetail.flight_number }}</div>
      <span v-if="isFollowed" class="followed-badge">Following</span>
    </div>
    <div class="flight-city">{{ flightDetail.city }}</div>
    <div class="flight-company">{{ flightDetail.company }}</div>
    <div class="flight-time">
      <template v-if="isArrival">
        <span class="scheduled">{{ flightDetail.arrival_time }}</span>
        <span v-if="flightDetail.arrival_time_estimated && flightDetail.arrival_time_estimated !== 'Cancelled'" 
              class="estimated">
          → {{ flightDetail.arrival_time_estimated }}
        </span>
      </template>
      <template v-else>
        {{ flightDetail.departure_time }}
      </template>
    </div>
    <div class="flight-status" :class="statusClass">
      {{ flightDetail.status }}
    </div>
    <button @click="followFlight" class="follow-button" :disabled="isFollowed">
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
    }
  }
}
</script>

<style scoped>
.flight {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.flight-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flight-time {
  display: flex;
  flex-direction: column;
}

.scheduled {
  font-weight: 500;
}

.estimated {
  color: #666;
  font-size: 0.9em;
}

.flight-status.delayed {
  color: orange;
}

.flight-status.cancelled {
  color: red;
}

.flight-status.on-time {
  color: green;
}

.past-flight {
  opacity: 0.6;
  background-color: #f5f5f5;
}

.follow-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.follow-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.followed-badge {
  background-color: #2196F3;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}
</style>