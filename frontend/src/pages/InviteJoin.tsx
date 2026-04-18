import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { getInviteByToken, joinWithInvite } from "../api/invite";
import { useAuthStore } from "../store/authStore";

export default function InviteJoin() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [adWatched, setAdWatched] = useState(false);

    // Fetch invite details
    const { data: invite, isLoading, error } = useQuery({
        queryKey: ["invite-token", token],
        queryFn: () => getInviteByToken(token!),
        enabled: !!token,
    });
    const meta = {
        joinAsRole: invite?.metadata?.joinAsRole ?? "user",
        watchAdBeforeJoin: invite?.metadata?.watchAdBeforeJoin ?? false,
        description: invite?.metadata?.description ?? "",
    };
    // Join mutation
    const joinMutation = useMutation({
        mutationFn: () => joinWithInvite(token!),
        onSuccess: () => {
            toast.success("Successfully joined the match!");
            navigate("/");
        },
        onError: () => {
            toast.error( "Failed to join match");
        },
    });

    const handleJoin = () => {
        if (meta.watchAdBeforeJoin && !adWatched) {
            // Simulate ad watching
            toast.info("Please watch the ad to continue");
            setTimeout(() => {
                setAdWatched(true);
                toast.success("Ad complete! You can now join.");
            }, 3000);
            return;
        }

        joinMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-lg">Loading invite...</div>
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            Invalid Invite
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            This invite link is invalid or has expired.
                        </p>
                        <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isExpired = new Date(invite.expiresAt) < new Date();
    const canJoin = invite.isActive && !isExpired && isAuthenticated;

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {canJoin ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Join Match
                            </>
                        ) : (
                            <>
                                <Clock className="w-5 h-5 text-yellow-600" />
                                Invite Status
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Match ID</div>
                        <div className="font-medium">{invite.matchId}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500 mb-1">Join As</div>
                        <Badge>{meta.joinAsRole}</Badge>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500 mb-1">Expires</div>
                        <div className="font-medium">
                            {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                    </div>

                    {!invite.isActive && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm">
                            This invite is currently inactive
                        </div>
                    )}

                    {isExpired && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-sm">
                            This invite has expired
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded text-sm">
                            Please log in to join this match
                        </div>
                    )}

                    {meta.watchAdBeforeJoin && !adWatched && canJoin && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded text-sm">
                            You'll need to watch a short ad before joining
                        </div>
                    )}

                    {adWatched && (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-sm">
                            ✓ Ad watched! Ready to join.
                        </div>
                    )}

                    <div className="flex gap-2">
                        {!isAuthenticated ? (
                            <Button onClick={() => navigate("/login")} className="w-full">
                                Go to Login
                            </Button>
                        ) : canJoin ? (
                            <Button
                                onClick={handleJoin}
                                disabled={joinMutation.isPending}
                                className="w-full"
                            >
                                {joinMutation.isPending ? "Joining..." : "Join Match"}
                            </Button>
                        ) : (
                            <Button disabled className="w-full">
                                Cannot Join
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
