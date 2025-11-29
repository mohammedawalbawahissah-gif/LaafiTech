import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Community {
  id: number;
  name: string;
  region: string;
  population: number;
  needLevel: 'critical' | 'high' | 'moderate';
}

interface CommunityState {
  communities: Community[];
  loading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  communities: [],
  loading: false,
  error: null,
};

const communitySlice = createSlice({
  name: 'communities',
  initialState,
  reducers: {
    setCommunities: (state, action: PayloadAction<Community[]>) => {
      state.communities = action.payload;
    },
    addCommunity: (state, action: PayloadAction<Community>) => {
      state.communities.push(action.payload);
    },
    updateCommunity: (state, action: PayloadAction<Community>) => {
      const index = state.communities.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.communities[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCommunities, addCommunity, updateCommunity, setLoading, setError } = communitySlice.actions;
export default communitySlice.reducer;
