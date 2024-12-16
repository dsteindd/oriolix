import {configureStore} from "@reduxjs/toolkit";
import fileReducer from '../slices/file-slice';
import networkReducer from '../slices/network-slice'
import analysisReducer from '../slices/analysis-slice'
import displayOptionsSlice from "../slices/display-options-slice";
import projectsSlice from "../slices/projects-slice";

export const store = configureStore({
    reducer: {
        file: fileReducer,
        networks: networkReducer,
        analysis: analysisReducer,
        displayOptions: displayOptionsSlice,
        projects: projectsSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

