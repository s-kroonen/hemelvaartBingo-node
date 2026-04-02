import { useQuery } from "@tanstack/react-query";
import api from "../../api/client.ts";
import { useMatchStore } from "../../store/matchStore.ts";

export default function LeaderboardPage() {
    const matchId = useMatchStore((s) => s.currentMatchId);

    const { data, isLoading, error } = useQuery({
        queryKey: ["leaderboard", matchId],
        queryFn: async () => {
            const res = await api.get(`/matches/${matchId}/leaderboard`);
            return res.data;
        },
        enabled: !!matchId,
    });

    if (!matchId) {
        return (
            <div className="text-gray-500">
                No match selected. Please select a match.
            </div>
        );
    }

    if (isLoading) return <div>Loading leaderboard...</div>;

    if (error) {
        return (
            <div className="text-red-500">
                Failed to load leaderboard
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-gray-500">
                No players yet
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-xl mb-4">Leaderboard</h1>

            {data.map((player: any) => (
                <div key={player.id} className="p-2 border-b">
                    {player.name} - {player.score}
                </div>
            ))}
        </div>
    );
}