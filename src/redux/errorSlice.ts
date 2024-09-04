import { createSlice } from "@reduxjs/toolkit";


interface FormState {
    type: string
}

const initialState = {
    type: ''
} satisfies FormState as FormState;



const errorSlice = createSlice({
    name: 'Error',
    initialState,
    reducers: {
        setServerError: (state) => {
            state.type = 'serverError'
        },
        setNetworkError: (state) => {
            state.type = 'networkError'
        }
    }
})


export const {setServerError, setNetworkError} = errorSlice.actions;

export default errorSlice.reducer;