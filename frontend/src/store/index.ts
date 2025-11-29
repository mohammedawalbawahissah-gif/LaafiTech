import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from './slices/campaignSlice';
import communityReducer from './slices/communitySlice';
import donorReducer from './slices/donorSlice';

export const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
    communities: communityReducer,
    donors: donorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
