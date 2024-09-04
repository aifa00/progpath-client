import { createSlice } from "@reduxjs/toolkit";

interface NotifyState {
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
} satisfies NotifyState as NotifyState


const notifySlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        notify: (state, action) => {
            state.value.message = action.payload.message;
            state.value.type = action.payload.type;
        },
        removeNotify: (state) => {
            state.value = initialState.value;
        }
    }
})

export const {notify, removeNotify} = notifySlice.actions;

export default notifySlice.reducer;