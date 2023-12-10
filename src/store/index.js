// Utilities
import { createPinia } from 'pinia'
import { getActivePinia } from 'pinia';

export const resetAllPiniaStores = () => {
    const activeStores = Object.keys(getActivePinia().state.value);

    activeStores.forEach((store) => {
        getActivePinia()._s.get(store).$reset();
    });
};

export default createPinia()
