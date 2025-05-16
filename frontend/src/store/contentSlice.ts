import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Influencer {
  _id: string;
  title: string;
  description: string;
  image: string;
  points: number;
  voteCost: number;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  duration: number;
  yesPercentage: number;
  noPercentage: number;
  timeRemaining: number;
  isExpired: boolean;
  id: string;
}

// Interface for user votes
interface UserVote {
  _id: string;
  user: string;
  content: {
    _id: string;
    id: string;
    yesPercentage: number | null;
    noPercentage: number | null;
    timeRemaining: number | null;
    isExpired: boolean;
  };
  voteType: "yes" | "no";
  pointsSpent: number;
  createdAt: string;
  updatedAt: string;
}

interface ContentState {
  content: Influencer[];
  userVotes: UserVote[];
  loading: boolean;
  isError: boolean;
  success: boolean;
  errorMessage: string;
  successMessage: string;
}

const initialState: ContentState = {
  content: [],
  userVotes: [],
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
};

interface SetContentPayload {
  content: Influencer[];
}

interface SetUserVotesPayload {
  userVotes: UserVote[];
}

// Vote interface
interface VotePayload {
  userId: string;
  contentId: string;
  voteType: "yes" | "no";
  pointsSpent: number;
}

export const contentSlice = createSlice({
  name: "Content",
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<SetContentPayload>) => {
      state.content = action.payload.content;
    },
    // New reducer to set user votes
    setUserVotes: (state, action: PayloadAction<SetUserVotesPayload>) => {
      state.userVotes = action.payload.userVotes;
    },
    // Add a single vote to userVotes array
    addUserVote: (state, action: PayloadAction<UserVote>) => {
      state.userVotes.push(action.payload);
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
      state.content = [];
      state.loading = false;
    },
    // Enhanced reducer to update content after voting with immediate UI updates
    updateContentAfterVote: (
      state,
      action: PayloadAction<{
        contentId: string;
        voteType: "yes" | "no";
        pointsSpent: number;
        userId: string;
      }>
    ) => {
      const { contentId, voteType, pointsSpent, userId } = action.payload;
      const contentIndex = state.content.findIndex(
        (item) => item._id === contentId || item.id === contentId
      );

      if (contentIndex !== -1) {
        const content = { ...state.content[contentIndex] };

        // Update vote counts based on vote type
        if (voteType === "yes") {
          content.yesVotes += 1;
        } else {
          content.noVotes += 1;
        }

        // Update total votes
        content.totalVotes += 1;

        // Recalculate percentages
        content.yesPercentage = Math.round(
          (content.yesVotes / content.totalVotes) * 100
        );
        content.noPercentage = Math.round(
          (content.noVotes / content.totalVotes) * 100
        );

        // Update the content in the state
        state.content[contentIndex] = content;

        // Create and add the user vote
        const newVote: UserVote = {
          _id: Date.now().toString(), // Temporary ID until we get the real one from the API
          user: userId,
          content: {
            _id: content._id,
            id: content.id,
            yesPercentage: content.yesPercentage,
            noPercentage: content.noPercentage,
            timeRemaining: content.timeRemaining,
            isExpired: content.isExpired,
          },
          voteType: voteType,
          pointsSpent: pointsSpent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add the vote to userVotes
        state.userVotes.push(newVote);
      }
    },
    // Update a specific user vote with real API data
    updateUserVote: (
      state,
      action: PayloadAction<{
        tempId: string;
        realVote: UserVote;
      }>
    ) => {
      const { tempId, realVote } = action.payload;
      const voteIndex = state.userVotes.findIndex(
        (vote) => vote._id === tempId
      );

      if (voteIndex !== -1) {
        state.userVotes[voteIndex] = realVote;
      }
    },
  },
});

export const {
  setContent,
  setUserVotes,
  addUserVote,
  setError,
  setLoading,
  setSuccess,
  resetStatus,
  updateContentAfterVote,
  updateUserVote,
} = contentSlice.actions;

export const fetchContent = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    const response = await fetch("http://127.0.0.1:3001/api/v1/content");

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch content");
    }

    dispatch(setContent({ content: data.data || data }));
    dispatch(setSuccess("Content fetched successfully"));

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

// New function to fetch user votes
export const fetchUserVotes = (userId: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    const response = await fetch(
      `http://127.0.0.1:3001/api/v1/vote/user/${userId}`
    );

    const data = await response.json();
    console.log("User votes data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user votes");
    }

    dispatch(setUserVotes({ userVotes: data.data || [] }));
    dispatch(setSuccess("User votes fetched successfully"));

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

// Improved function to vote on content with optimistic UI updates
export const voteOnContent =
  (voteData: VotePayload) => async (dispatch: any, getState: any) => {
    try {
      const { contentId, voteType, userId, pointsSpent } = voteData;
      const tempVoteId = `temp-${Date.now()}`;

      // First update the UI optimistically
      dispatch(
        updateContentAfterVote({
          contentId,
          voteType,
          pointsSpent,
          userId,
        })
      );

      // Then make the API call
      dispatch(setLoading(true));

      const response = await fetch("http://127.0.0.1:3001/api/v1/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voteData),
      });

      const data = await response.json();
      console.log("Vote response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to vote on content");
      }

      // Get the latest content data after successful vote
      const state = getState();
      const contentItem = state.Content.content.find(
        (item: Influencer) => item._id === contentId || item.id === contentId
      );

      // Create the official user vote object with real API data
      const officialVote: UserVote = {
        _id: data.data._id || Date.now().toString(),
        user: userId,
        content: {
          _id: contentId,
          id: contentId,
          yesPercentage: contentItem ? contentItem.yesPercentage : null,
          noPercentage: contentItem ? contentItem.noPercentage : null,
          timeRemaining: contentItem ? contentItem.timeRemaining : null,
          isExpired: contentItem ? contentItem.isExpired : false,
        },
        voteType: voteType,
        pointsSpent: data.data.pointsSpent || pointsSpent,
        createdAt: data.data.createdAt || new Date().toISOString(),
        updatedAt: data.data.updatedAt || new Date().toISOString(),
      };

      // Find and update the temporary vote with real data if needed
      const latestUserVotes = state.Content.userVotes;
      const tempVoteIndex = latestUserVotes.findIndex(
        (vote: UserVote) => vote._id === tempVoteId
      );

      if (tempVoteIndex !== -1) {
        dispatch(
          updateUserVote({
            tempId: tempVoteId,
            realVote: officialVote,
          })
        );
      }

      dispatch(setSuccess("Vote recorded successfully"));
      return data;
    } catch (error) {
      // If there's an error, we might want to roll back the optimistic update
      // This would require additional logic to track and revert changes

      if (error instanceof Error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export default contentSlice.reducer;
