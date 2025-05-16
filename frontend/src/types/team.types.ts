export interface TeamMember {
  _id: string;
  name: string;
  image: string;
  description: string;
}

// export interface Section {
//   _id: string;
//   name: string;
//   teams: Team[];
// }

export interface UserTeamSection {
  name: string;
  sectionId: string;
  selectedTeams: string[];
}

export interface Team {
  _id: string;
  name: string;
  image: string;
  description: string;
  followers: number;
  points: number;
}

export interface Section {
  name: string;
  sectionId: string;
  selectedTeams: Team[];
  // _id: string;
  // teams: Team[];
}

export interface TeamState {
  teams: {
    sections: Section[];
  };
  loading: boolean;
  isError: boolean;
  success: boolean;
  errorMessage: string;
  successMessage: string;
}

export interface TeamAPIPayload {
  sections: {
    name: string;
    sectionId: string;
    selectedTeams: string[];
  }[];
}
