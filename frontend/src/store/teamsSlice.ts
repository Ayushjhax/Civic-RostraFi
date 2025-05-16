import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TeamState, Team, Section, TeamAPIPayload } from "../types/team.types";

const initialState: TeamState = {
  teams: { sections: [] },
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
};

interface SetTeamsPayload {
  sectionName: string;
  sectionId: string;
  selectedTeam: Team[];
}

export const teamsSlice = createSlice({
  name: "Teams",
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<SetTeamsPayload>) => {
      const { sectionName, sectionId, selectedTeam } = action.payload;

      // Find if section already exists
      const existingSection = state.teams.sections.find(
        (section) => section.sectionId === sectionId
      );

      if (existingSection) {
        // Update existing section's teams
        existingSection.selectedTeams = selectedTeam;
      } else {
        // Add new section with correct format
        state.teams.sections.push({
          name: sectionName,
          sectionId,
          selectedTeams: selectedTeam,
        });
      }
    },

    setSuccess: (state, action: PayloadAction<string>) => {
      state.success = true;
      state.successMessage = action.payload;
      state.isError = false;
      state.errorMessage = "";
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isError = true;
      state.errorMessage = action.payload;
      state.success = false;
      state.successMessage = "";
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetStatus: (state) => {
      state.success = false;
      state.isError = false;
      state.successMessage = "";
      state.errorMessage = "";
      state.teams = { sections: [] };
      state.loading = false;
    },
  },
});

export const { setTeams, setError, setLoading, setSuccess, resetStatus } =
  teamsSlice.actions;

const formatTeamsForAPI = (sections: Section[]): TeamAPIPayload => {
  return {
    sections: sections.map((section) => ({
      name: section.name,
      sectionId: section.sectionId,
      selectedTeams: section.selectedTeams.map((team) => team._id),
    })),
  };
};

export const saveTeams =
  (teamData: {
    userId: string;
    teamName: string;
    walletUserId: string;
    tournamentId: string;
    teams: { sections: Section[] };
    totalPoints: number;
  }) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));

      const formattedTeams = formatTeamsForAPI(teamData.teams.sections);

      const response = await fetch("https://be1.rostrafi.fun/api/v1/userTeams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: teamData.userId,
          teamName: teamData.teamName,
          walletUserId: teamData.walletUserId,
          tournamentId: teamData.tournamentId,
          sections: formattedTeams.sections,
          totalPoints: teamData.totalPoints,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save teams");
      }

      dispatch(setSuccess("Teams saved successfully"));

      return data;
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export default teamsSlice.reducer;
