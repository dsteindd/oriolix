import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {annotationService, fileService, projectService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {FileInfo, UserFileInfo} from "../../models/file-info";
import {Annotation} from "../../models/annotations";
import {FetchState, FetchStateResult} from "../hooks/redux.types";
import {Project, UserProject} from "../../models/projects";


const fetchProjects = createAsyncThunk(
    "projects/fetch",
    async (_ ,thunkAPI) => {
        const token = await authService.getAccessToken();
        const projects = await projectService.getProjects(token);
        return projects;
    }
)

export interface ProjectsSliceState {
    projects: FetchState<Project[]>
}

const initialState = {
    projects: {
        loading: 'idle'
    }
} as ProjectsSliceState;


export const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        clearProjects: (state) => {
            state.projects.loading = "idle"
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProjects.fulfilled, (state, action) => {
            state.projects = state.projects as FetchStateResult<Project[]>;
            state.projects.loading = 'succeeded';
            state.projects.data = action.payload;
        })
    }
});

export const {clearProjects} = projectsSlice.actions;
export default projectsSlice.reducer;
export {fetchProjects};