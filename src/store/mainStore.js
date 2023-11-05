import { defineStore } from "pinia";
export const useMainStore = defineStore("main", {
  state: () => {
    return {
      isSearch: false,
      isChat: true,
      isGroup: false,
    };
  },

  
  persist: false,
});
