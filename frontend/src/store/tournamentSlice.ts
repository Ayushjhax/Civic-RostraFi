import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Tournament {
  _id: string;
  name: string;
  timeLimit: number;
  registrationTimeLimit: number;
  startDate: string;
  endDate: string;
  registrationEndDate: string;
  prizePool: number;
  image: string;
  icon: string;
  platform: string;
  pointsForVisit: number;
  visited: string[];
  participated: string[];
  isActive: boolean;
  isOngoing: boolean;
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface TournamentState {
  tournaments: Tournament[];
  openRegistrationTournaments: Tournament[];
  selectedTournament: Tournament | null;
  count: number;
  openRegistrationCount: number;
  isParticiapated: boolean;
  isError: boolean;
  error: string;
  loading: boolean;
  openRegistrationLoading: boolean;
}

const initialState: TournamentState = {
  tournaments: [],
  openRegistrationTournaments: [],
  selectedTournament: null,
  count: 0,
  openRegistrationCount: 0,
  isParticiapated: false,
  isError: false,
  error: "",
  loading: false,
  openRegistrationLoading: false,
};

export const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {
    setTournaments: (state, action: PayloadAction<Tournament[]>) => {
      state.tournaments = action.payload;
    },
    setOpenRegistrationTournaments: (
      state,
      action: PayloadAction<Tournament[]>
    ) => {
      state.openRegistrationTournaments = action.payload;
      console.log(action.payload);
    },
    setTournamentCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setOpenRegistrationCount: (state, action: PayloadAction<number>) => {
      state.openRegistrationCount = action.payload;
    },
    setSelectedTournament: (state, action: PayloadAction<Tournament>) => {
      state.selectedTournament = action.payload;
    },
    setIsParticipated: (state, action: PayloadAction<boolean>) => {
      state.isParticiapated = action.payload;
    },
    addToVisited: (state, action: PayloadAction<string>) => {
      if (state.selectedTournament) {
        if (!state.selectedTournament.visited.includes(action.payload)) {
          state.selectedTournament.visited.push(action.payload);
        }
        // Also update in the tournaments array
        const tournamentIndex = state.tournaments.findIndex(
          (t) => t._id === state.selectedTournament?._id
        );
        if (tournamentIndex !== -1) {
          if (
            !state.tournaments[tournamentIndex].visited.includes(action.payload)
          ) {
            state.tournaments[tournamentIndex].visited.push(action.payload);
          }
        }

        // Also update in the openRegistrationTournaments array
        const openRegTournamentIndex =
          state.openRegistrationTournaments.findIndex(
            (t) => t._id === state.selectedTournament?._id
          );
        if (openRegTournamentIndex !== -1) {
          if (
            !state.openRegistrationTournaments[
              openRegTournamentIndex
            ].visited.includes(action.payload)
          ) {
            state.openRegistrationTournaments[
              openRegTournamentIndex
            ].visited.push(action.payload);
          }
        }
      }
    },
    addToParticipated: (state, action: PayloadAction<string>) => {
      if (state.selectedTournament) {
        if (!state.selectedTournament.participated.includes(action.payload)) {
          state.selectedTournament.participated.push(action.payload);
        }
        // Also update in the tournaments array
        const tournamentIndex = state.tournaments.findIndex(
          (t) => t._id === state.selectedTournament?._id
        );
        if (tournamentIndex !== -1) {
          if (
            !state.tournaments[tournamentIndex].participated.includes(
              action.payload
            )
          ) {
            state.tournaments[tournamentIndex].participated.push(
              action.payload
            );
          }
        }

        // Also update in the openRegistrationTournaments array
        const openRegTournamentIndex =
          state.openRegistrationTournaments.findIndex(
            (t) => t._id === state.selectedTournament?._id
          );
        if (openRegTournamentIndex !== -1) {
          if (
            !state.openRegistrationTournaments[
              openRegTournamentIndex
            ].participated.includes(action.payload)
          ) {
            state.openRegistrationTournaments[
              openRegTournamentIndex
            ].participated.push(action.payload);
          }
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOpenRegistrationLoading: (state, action: PayloadAction<boolean>) => {
      state.openRegistrationLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isError = true;
      state.error = action.payload;
    },
    resetError: (state) => {
      state.isError = false;
      state.error = "";
    },
    resetTournamentState: (state) => {
      state.tournaments = [];
      state.openRegistrationTournaments = [];
      state.selectedTournament = null;
      state.count = 0;
      state.openRegistrationCount = 0;
      state.isError = false;
      state.error = "";
      state.loading = false;
      state.openRegistrationLoading = false;
      state.isParticiapated = false;
    },
  },
});

export const {
  setTournaments,
  setOpenRegistrationTournaments,
  setTournamentCount,
  setOpenRegistrationCount,
  setSelectedTournament,
  addToVisited,
  addToParticipated,
  setLoading,
  setOpenRegistrationLoading,
  setError,
  resetError,
  resetTournamentState,
  setIsParticipated,
} = tournamentSlice.actions;

export const fetchTournaments = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      "http://127.0.0.1:3001/api/v1/compitition/tournaments?active=true",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch tournaments");
    }

    dispatch(setTournaments(data.data));
    dispatch(setTournamentCount(data.count));
    return data;
  } catch (e) {
    if (e instanceof Error) {
      dispatch(setError(e.message));
    } else {
      dispatch(setError("An unknown error occurred"));
    }
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchOpenRegistrationTournaments = () => async (dispatch: any) => {
  try {
    dispatch(setOpenRegistrationLoading(true));
    const response = await fetch(
      "http://127.0.0.1:3001/api/v1/compitition/tournaments/open-registration",
      {
        method: "GET",
      }
    );

    const data = await response.json();
    console.log("Open registration tournaments:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch open registration tournaments"
      );
    }

    dispatch(setOpenRegistrationTournaments(data.data));
    dispatch(setOpenRegistrationCount(data.count));
    return data;
  } catch (e) {
    if (e instanceof Error) {
      dispatch(setError(e.message));
    } else {
      dispatch(setError("An unknown error occurred"));
    }
  } finally {
    dispatch(setOpenRegistrationLoading(false));
  }
};

export const fetchTournamentById =
  (tournamentId: string) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/tournaments/${tournamentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tournament");
      }

      dispatch(setSelectedTournament(data.data));
      return data.data;
    } catch (e) {
      if (e instanceof Error) {
        dispatch(setError(e.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export const visitTournament =
  (tournamentId: string, userId: string) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/compitition/tournaments/${tournamentId}/visit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to record tournament visit");
      }

      dispatch(addToVisited(userId));
      return data;
    } catch (e) {
      if (e instanceof Error) {
        dispatch(setError(e.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export const participateInTournament =
  (tournamentId: string, walletAddress: string) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/compitition/tournaments/${tournamentId}/participate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to participate in tournament");
      }

      if (data.success) {
        dispatch(setIsParticipated(true));
      } else {
        dispatch(setIsParticipated(false));
      }

      // dispatch(addToParticipated(userId));
      return data;
    } catch (e) {
      if (e instanceof Error) {
        dispatch(setError(e.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export default tournamentSlice.reducer;
