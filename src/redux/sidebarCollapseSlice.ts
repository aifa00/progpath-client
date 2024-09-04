import { createSlice } from "@reduxjs/toolkit";

interface NotifyState {
    value: boolean
}

const initialState = {
    value: true
} satisfies NotifyState as NotifyState


const sidebarCollapseSlice = createSlice({
    name: 'sidebar-collapse',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.value =!state.value;
        },
    }
})

export const {toggleSidebar} = sidebarCollapseSlice.actions;

export default sidebarCollapseSlice.reducer;