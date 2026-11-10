"use client";
import React, { useState, useEffect } from "react";
import Team from '@/components/Team';
import Loader from "@/components/Loader";
import axios, { AxiosError } from "axios";
import type { TeamData, ApiResponse } from "@/types/team";

export default function TeamPage() {
  const [timerDone, setTimerDone] = useState<boolean>(false);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [dataReady, setDataReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const teamsResponse = await axios.get<ApiResponse>("/api/teams");
        const teams = teamsResponse.data?.teams ?? [];
        
        if (teams.length === 0) {
          setError("No teams found");
          setTeamData(null);
        } else {
          setTeamData(teams[0]);
          setError(null);
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorMessage = axiosError.response?.status === 404 
          ? "Team data not found" 
          : "Failed to load team members";
        
        setError(errorMessage);
        setTeamData(null);
        console.error("Error fetching team data:", err);
      } finally {
        setDataReady(true);
      }
    }
    
    fetchTeamData();
  }, []);

  const isReady = timerDone && dataReady;

  if (!isReady) {
    return <Loader className="fixed inset-0 z-[9999] bg-white dark:bg-g-almost-black" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-g-almost-black">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <Team teamData={teamData} />;
}