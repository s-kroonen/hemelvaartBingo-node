import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";
import { useMatchStore } from "../../store/matchStore";

export default function LeaderboardPage() {
    const matchId = useMatchStore((s) => s.currentMatchId);

    const { data, isLoading } = useQuery({
        queryKey: ["leaderboard", matchId],
        queryFn: async () => {
            const res = await api.get(`/matches/${matchId}/leaderboard`);
            return res.data;
        },
        enabled: !!matchId,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-xl mb-4">Leaderboard</h1>

            {data?.map((player: any) => (
                <div key={player.id} className="p-2 border-b">
                    {player.name} - {player.score}
                </div>
            ))}
        </div>
    );
}