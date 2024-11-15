import { createSlice } from "@reduxjs/toolkit";

interface FormState {
    value: string
} 

const initialState = {
    value: ''
} satisfies FormState as FormState;

const formSlice = createSlice ({
    name: 'form',
    initialState,
    reducers: {
        setForm: (state, action) => {
            state.value = action.payload;
        },
        resetForm: (state) => {
            state.value = initialState.value;
        }
    }
})

export const {setForm, resetForm} = formSlice.actions;

export default formSlice.reducer;