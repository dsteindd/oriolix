
type LoadingIdlePendingFailed = 'idle' | 'pending' | 'failed';
type LoadingSuccess = 'succeeded'

export interface FetchStateNoResult {
    loading: LoadingIdlePendingFailed
}
export interface FetchStateResult<T>{
    loading: LoadingSuccess,
    data: T
}

export type FetchState<T> = FetchStateNoResult | FetchStateResult<T>;
