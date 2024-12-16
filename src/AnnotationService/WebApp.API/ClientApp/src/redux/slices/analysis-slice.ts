import {AnyAction, AsyncThunk, createAsyncThunk, createSlice, ThunkDispatch} from '@reduxjs/toolkit'
import {annotationService, fileService, networkService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {FileInfo, UserFileInfo} from "../../models/file-info";
import {Annotation} from "../../models/annotations";
import {FetchState, FetchStateResult} from "../hooks/redux.types";
import {ClassificationReport, NetworkModel} from "../../models/network-models";
import {createApi} from "@reduxjs/toolkit/query";
import {responsiveProperty} from "@mui/material/styles/cssUtils";
import {MaybePromise} from "@reduxjs/toolkit/dist/query/tsHelpers";
import {AppDispatch, RootState} from "../stores/root-store";


const useAnalysisPolling = (
    dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
    getState: () => RootState,
    reportId: string
) => {
    
    const intervalId: NodeJS.Timer =  setInterval(() => {
        const state = getState()
        
        if (state.analysis.analysis.loading == 'succeeded' && state.analysis.analysis.data.status == "Pending"){
            dispatch(fetchById({reportId: reportId}))
        }
        else {
            clearInterval(intervalId)
        }
        
    }, 2000);
    
    
    return () => {
        clearInterval(intervalId)
    }
}

export interface AnalysisSliceState {
    analysis: FetchState<ClassificationReport>
}

const analyseFile = createAsyncThunk<
    ClassificationReport, 
    {fileId: string, networkId: string},
    {
        state: RootState 
    }>(
    'analysis/post',
    async ({fileId, networkId}, {
        dispatch,
        getState
    }) => {
        const token = await authService.getAccessToken();
        const response = await networkService.analyzeFile(token, fileId, networkId);
        
        useAnalysisPolling(dispatch, getState, response.id)
        
        return response
    }
)

const fetchById = createAsyncThunk(
    'analysis/fetch',
    async (payload: {reportId: string}, thunkAPI) => {
        const token = await authService.getAccessToken();
        const response = networkService.getReport(token, payload.reportId);
        
        return response;
    }
)

const initialState = {
    analysis: {
        loading: 'idle'
    }
} as AnalysisSliceState;


export const analysisSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        clearAnalysis: (state) => {
            state.analysis.loading = "idle"
        },
        setupPoller: (state) => {
            
        }
    },
    extraReducers: (builder) => {
        builder.addCase(analyseFile.fulfilled, (state, action) => {
            state.analysis = state.analysis as FetchStateResult<ClassificationReport>;
            state.analysis.loading = 'succeeded';
            state.analysis.data = action.payload;
        })
            .addCase(analyseFile.pending, (state, action) => {
                state.analysis.loading = 'pending'
            })
            .addCase(analyseFile.rejected, (state, action) => {
                state.analysis.loading = 'failed';
            });
        builder.addCase(fetchById.fulfilled, (state, action) => {
            if (action.payload.status == "Done"){
                state.analysis = state.analysis as FetchStateResult<ClassificationReport>;
                state.analysis.data = action.payload
            }
        })
    }
});


export const {clearAnalysis} = analysisSlice.actions;
export default analysisSlice.reducer;
export {analyseFile};