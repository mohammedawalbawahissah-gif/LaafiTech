import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Donor {
  id: number;
  name: string;
  type: 'individual' | 'corporate' | 'ngo';
  totalContributed: number;
}

interface DonorState {
  donors: Donor[];
  loading: boolean;
  error: string | null;
}

const initialState: DonorState = {
  donors: [],
  loading: false,
  error: null,
};

const donorSlice = createSlice({
  name: 'donors',
  initialState,
  reducers: {
    setDonors: (state, action: PayloadAction<Donor[]>) => {
      state.donors = action.payload;
    },
    addDonor: (state, action: PayloadAction<Donor>) => {
      state.donors.push(action.payload);
    },
    updateDonor: (state, action: PayloadAction<Donor>) => {
      const index = state.donors.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.donors[index] = action.payload;
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

export const { setDonors, addDonor, updateDonor, setLoading, setError } = donorSlice.actions;
export default donorSlice.reducer;
