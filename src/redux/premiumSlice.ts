import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: false
}
const premiumSlice = createSlice({
    name: 'premium',
    initialState,
    reducers: {
        togglePremiumComponent: (state) => {
            state.value = !state.value
        }
    }
});

export const {togglePremiumComponent} = premiumSlice.actions;

export default premiumSlice.reducer;