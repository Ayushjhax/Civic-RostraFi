import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  allData: null,
  loading: false,
  error: false,
};

export const allSectionsAndTeamsSlice = createSlice({
  name: "allSectionsAndTeams",
  initialState,
  reducers: {
    setAllSectionsAndTeams: (state, action: PayloadAction<any>) => {
      state.allData = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload;
    },
  },
});

export const { setAllSectionsAndTeams, setLoading, setError } =
  allSectionsAndTeamsSlice.actions;

export const fetchAllSectionsAndTeams = () => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    const response = await fetch("http://127.0.0.1:3001/api/v1/sections");
    const data = await response.json();
    console.log(data);
    dispatch(setAllSectionsAndTeams(data));
  } catch {
    dispatch(setError(true));
  }
  dispatch(setLoading(false));
};

export default allSectionsAndTeamsSlice.reducer;
