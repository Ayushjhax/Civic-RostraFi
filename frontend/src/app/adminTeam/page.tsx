"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Loader2,
  ChevronDown,
  Settings,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface Team {
  id: string;
  name: string;
  image: string;
  description: string;
  audio: string;
  points: string;
}

interface Section {
  id: string;
  name: string;
  teams: Team[];
  _id: string;
}

export default function AdminDashboard() {
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamImage, setTeamImage] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamAudio, setTeamAudio] = useState("");
  const [teamPoints, setTeamPoints] = useState("");
  const [twitterId, setTwitterId] = useState("");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    fetchSectionsAndTeams();
  }, []);

  const fetchSectionsAndTeams = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:3001/api/v1/sections");
      if (!response.ok) throw new Error("Failed to fetch sections and teams");
      const data = await response.json();
      setSections(data || []);
    } catch (err) {
      setError("Failed to load sections and teams. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createSection = async () => {
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:3001/api/v1/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sectionName }),
      });
      if (!response.ok) throw new Error("Failed to create section");
      const newSection = await response.json();
      setSections([...sections, { ...newSection, teams: [] }]);
      setSectionName("");
    } catch (err) {
      setError("Failed to create section. Please try again.");
      console.error(err);
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectionId = e.target.value;
    if (!sectionId) {
      setSelectedSection(null);
      return;
    }

    const section = sections.find((s) => s.name === sectionId);
    if (section) {
      setSelectedSection(section);
    }
  };

  const addTeam = async () => {
    setError("");
    if (!selectedSection) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:3001/api/v1/sections/${selectedSection._id}/teams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: teamName,
            image: teamImage,
            description: teamDescription,
            audio: teamAudio,
            points: teamPoints,
            twitterId: twitterId,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to add team");
      const newTeam = await response.json();
      setSections(
        sections.map((section) =>
          section.id === selectedSection.id
            ? { ...section, teams: [...section.teams, newTeam] }
            : section
        )
      );
      setSelectedSection({
        ...selectedSection,
        teams: [...selectedSection.teams, newTeam],
      });
      setTeamName("");
      setTeamImage("");
      setTeamDescription("");
      setTeamAudio("");
      setTeamPoints("");
      setTwitterId("");
    } catch (err) {
      setError("Failed to add team. Please try again.");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your sections and teams</p>
          </div>
          <Settings className="w-8 h-8 text-gray-400 hover:text-white transition-colors cursor-pointer" />
        </div>

        {error && (
          <div className="bg-red-950/50 backdrop-blur-sm border-2 border-red-500/50 text-white px-6 py-4 rounded-xl relative mb-8 animate-pulse">
            <span className="block font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <h2 className="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Create Section
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="Section Name"
                className="flex-grow px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-zinc-500 transition duration-200"
              />
              <button
                onClick={createSection}
                disabled={!sectionName}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/20"
              >
                Create
              </button>
            </div>
          </section>

          <section className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <h2 className="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Sections Overview
            </h2>
            <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {sections.length === 0 ? (
                <p className="text-zinc-400 italic">No sections created yet.</p>
              ) : (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div
                      key={section._id}
                      className="bg-black/30 backdrop-blur-sm rounded-xl border border-zinc-800/50 transition duration-300 hover:border-purple-500/30 group"
                    >
                      <div
                        className="p-6 cursor-pointer flex items-center justify-between"
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === section.id ? null : section.id
                          )
                        }
                      >
                        <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {section.name}
                        </h3>
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-200 ${
                            expandedSection === section.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {expandedSection === section.id && (
                        <div className="px-6 pb-6">
                          {section.teams.length === 0 ? (
                            <p className="text-zinc-400 italic">No teams yet</p>
                          ) : (
                            <div className="grid gap-4">
                              {section.teams.map((team) => (
                                <div
                                  key={team.id}
                                  className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800/30 hover:border-purple-500/30 transition duration-200 group"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors mb-2">
                                        {team.name}
                                      </h4>
                                      <p className="text-sm text-zinc-400">
                                        {team.description}
                                      </p>
                                    </div>
                                    {team.image && (
                                      <Image
                                        src={team.image}
                                        alt={team.name}
                                        width={80}
                                        height={80}
                                        className="rounded-lg"
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
          <h2 className="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Add New Team
          </h2>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="block mb-2 font-medium text-white">
                Select Section
              </label>
              <div className="relative">
                <select
                  value={selectedSection?.name || ""}
                  onChange={handleSectionChange}
                  className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white appearance-none"
                >
                  <option value="">Choose a section</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-white">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-white">
                Team Image URL
              </label>
              <input
                type="text"
                value={teamImage}
                onChange={(e) => setTeamImage(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-white">
                Team Audio URL
              </label>
              <input
                type="text"
                value={teamAudio}
                onChange={(e) => setTeamAudio(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-white">
                Team Points
              </label>
              <input
                type="text"
                value={teamPoints}
                onChange={(e) => setTeamPoints(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-white">
                Team Twitter ID
              </label>
              <input
                type="text"
                value={twitterId}
                onChange={(e) => setTwitterId(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-white">
                Team Description
              </label>
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border-2 border-zinc-800/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
                rows={4}
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={addTeam}
                disabled={
                  !selectedSection ||
                  !teamName ||
                  !teamImage ||
                  !teamDescription ||
                  !teamAudio ||
                  !teamPoints
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/20 flex items-center justify-center"
              >
                <PlusCircle className="mr-2" size={20} />
                Add Team
              </button>
            </div>
          </form>
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
