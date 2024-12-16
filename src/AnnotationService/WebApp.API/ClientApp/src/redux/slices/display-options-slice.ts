import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {annotationService, fileService, networkService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {FileInfo, UserFileInfo} from "../../models/file-info";
import {Annotation} from "../../models/annotations";
import {FetchState, FetchStateResult} from "../hooks/redux.types";
import {Classification, ClassificationReport, NetworkModel} from "../../models/network-models";
import {DisplayDimensions} from "../../screens/audio-details/spectrogram-chart/helpers";

type FollowType = 'None' | 'Classifier' | 'UserAnnotations';

export interface DisplayOptionsSlice {
    follow: FollowType,
    selectedClassifierClassification?: Classification,
    selectedUserAnnotation?: Annotation,
    displayDimensions: DisplayDimensions
}

const initialState = {
    follow: "None",
    displayDimensions: {
        minT: 0,
        maxT: 5,
        minF: 0,
        maxF: 21000
    }
} as DisplayOptionsSlice;


export const analysisSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        setFollowType: (state, action: PayloadAction<FollowType>) => {
            state.follow = action.payload;
        },
        setClassifierClassification: (state, action: PayloadAction<Classification>) => {
            state.selectedClassifierClassification = action.payload
        },
        setUserAnnotationClassification: (state, action: PayloadAction<Annotation>) => {
            state.selectedUserAnnotation = action.payload
        },
        setDisplayDimensions: (state, action: PayloadAction<DisplayDimensions>) => {
            state.displayDimensions = action.payload;
        },
        clearDisplayOptions: (state) => {
            state.follow = "None" ;
            state.displayDimensions = {
                minT: 0,
                maxT: 5,
                minF: 0,
                maxF: 21000
            }
        }
    }
});

export const {setFollowType, setUserAnnotationClassification, setClassifierClassification, clearDisplayOptions, setDisplayDimensions} = analysisSlice.actions;
export default analysisSlice.reducer;