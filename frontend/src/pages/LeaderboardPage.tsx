import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useMatchStore } from "../store/matchStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

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
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>No match selected. Please select a match.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading leaderboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500">
                    Failed to load leaderboard
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>No players yet</p>
                </div>
            </div>
        );
    }

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
        return null;
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-6 h-6" />
                        Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data.map((player: any, index: number) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                    index < 3 ? 'bg-gray-50 border-gray-300' : 'bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 text-center font-bold text-gray-600">
                                        {getRankIcon(index) || `#${index + 1}`}
                                    </div>
                                    <div>
                                        <div className="font-medium">{player.name}</div>
                                        {player.email && (
                                            <div className="text-sm text-gray-500">{player.email}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {player.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
