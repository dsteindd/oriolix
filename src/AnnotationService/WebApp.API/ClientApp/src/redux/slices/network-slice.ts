import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {annotationService, fileService, networkService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";
import {FileInfo, UserFileInfo} from "../../models/file-info";
import {Annotation} from "../../models/annotations";
import {FetchState, FetchStateResult} from "../hooks/redux.types";
import {NetworkModel} from "../../models/network-models";

const fetchNetworks = createAsyncThunk(
    'networks/fetch',
    async (thunkAPI) => {
        const token = await authService.getAccessToken();
        const response = networkService.getModels(token);
        return response
    }
)

export interface NetworkSliceState {
    networks: FetchState<NetworkModel[]>
}

const initialState = {
    networks: {
        loading: 'idle'
    }
} as NetworkSliceState;


export const networkSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        clearNetworks: (state) => {
            // TODO: acutally don't need to clear this
            state.networks.loading = "idle"
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchNetworks.fulfilled, (state, action) => {
            state.networks = state.networks as FetchStateResult<NetworkModel[]>;
            state.networks.loading = 'succeeded';
            state.networks.data = action.payload;
        })
    }
});

export const {clearNetworks} = networkSlice.actions;
export default networkSlice.reducer;
export {fetchNetworks};