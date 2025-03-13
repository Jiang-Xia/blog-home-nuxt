import { defineStore } from 'pinia';
// 延迟函数 delay(1000)
const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
export const useMainStore = defineStore('main', {
  state: () => ({
    counter: 0,
  }),
  getters: {
    double: state => state.counter * 2,
  },
  actions: {
    increment() {
      // `this` is the store instance
      this.counter++;
    },
  },
});

export const useWebsiteStore = defineStore('websiteStore', {
  state: () => ({
    name: '',
    description: '',
  }),
  actions: {
    async fetch() {},
  },
});
