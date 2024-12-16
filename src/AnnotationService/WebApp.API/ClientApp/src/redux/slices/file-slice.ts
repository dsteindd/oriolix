import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {annotationService, fileService, projectService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {FileInfo, UserFileInfo} from "../../models/file-info";
import {Annotation} from "../../models/annotations";
import {FetchState, FetchStateResult} from "../hooks/redux.types";

const fetchFileInfoById = createAsyncThunk<FileInfo, {fileId: string, projectId: string}>(
    'files/fetchById',
    async ({fileId, projectId}, thunkAPI) => {
        const token = await authService.getAccessToken();
        const response = projectService.getFileInfo(token, projectId, fileId);
        return response
    }
)

const fetchFileAnnotations = createAsyncThunk<Annotation[], {fileId: string, projectId: string}>(
    "files/fetchAnnotations",
    async ({fileId, projectId}, thunkAPI) => {
        const token = await authService.getAccessToken();
        const annotations = await projectService.getProjectFileAnnotations(token, projectId, fileId);
        return annotations;
    }
)

export interface FileSliceState {
    fileInfo: FetchState<FileInfo>,
    annotations: FetchState<Annotation[]>
}

const initialState = {
    fileInfo: {
        loading: 'idle'
    },
    annotations: {
        loading: 'idle'
    }
} as FileSliceState;


export const fileSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        clearFile: (state) => {
            state.fileInfo.loading = "idle"
            state.annotations.loading = "idle"
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFileInfoById.fulfilled, (state, action) => {
            state.fileInfo = state.fileInfo as FetchStateResult<FileInfo>;
            state.fileInfo.loading = 'succeeded';
            state.fileInfo.data = action.payload;
        })
            .addCase(fetchFileAnnotations.fulfilled, (state, action) => {
                state.annotations = state.annotations as FetchStateResult<Annotation[]>;
                state.annotations.loading = 'succeeded';
                state.annotations.data = action.payload
                
            })
    }
});

export const {clearFile} = fileSlice.actions;
export default fileSlice.reducer;
export {fetchFileInfoById, fetchFileAnnotations};