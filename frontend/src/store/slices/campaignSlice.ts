import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Campaign {
  id: number;
  title: string;
  community: string;
  goal: number;
  raised: number;
  status: 'active' | 'completed' | 'upcoming';
}

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
}

const initialState: CampaignState = {
  campaigns: [],
  loading: false,
  error: null,
};

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setCampaigns: (state, action: PayloadAction<Campaign[]>) => {
      state.campaigns = action.payload;
    },
    addCampaign: (state, action: PayloadAction<Campaign>) => {
      state.campaigns.push(action.payload);
    },
    updateCampaign: (state, action: PayloadAction<Campaign>) => {
      const index = state.campaigns.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.campaigns[index] = action.payload;
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

export const { setCampaigns, addCampaign, updateCampaign, setLoading, setError } = campaignSlice.actions;
export default campaignSlice.reducer;
