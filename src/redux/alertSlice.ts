import { createSlice } from "@reduxjs/toolkit";

interface AlertState {
    value: {
        message: string,
        type: string,
    };
}

const initialState = {
    value: {
        message: '',
        type: '',
    }
} satisfies AlertState as AlertState


const alertSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAlert: (state, action) => {
            state.value.message = action.payload.message;
            state.value.type = action.payload.type;
        },
        removeAlert: (state) => {
            state.value = initialState.value;
        }
    }
})

export const {setAlert, removeAlert} = alertSlice.actions;

export default alertSlice.reducer;