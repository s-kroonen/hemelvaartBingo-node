import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import {type Invite, InviteStatus } from "../types";
import { getInvite, updateInvite } from "../api/admin";

export default function AdminInviteEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = id === "new";

    const [email, setEmail] = useState("");
    const [matchId, setMatchId] = useState("");
    const [status, setStatus] = useState<InviteStatus>(InviteStatus.PENDING);

    const statusOptions = Object.values(InviteStatus);

    // Fetch invite data
    const { data: invite, isLoading } = useQuery({
        queryKey: ["invite", id],
        queryFn: () => getInvite(id!),
        enabled: !isNew,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<Invite>) => updateInvite(id!, data),
        onSuccess: () => {
            toast.success("Invite updated successfully");
            queryClient.invalidateQueries({ queryKey: ["invites"] });
            queryClient.invalidateQueries({ queryKey: ["invite", id] });
        },
        onError: () => {
            toast.error("Failed to update invite");
        },
    });

    // Populate form when invite data loads
    useEffect(() => {
        if (invite) {
            setEmail(invite.email);
            setMatchId(invite.matchId);
            setStatus(invite.status);
        }
    }, [invite]);

    const handleSave = () => {
        if (!email || !matchId) {
            toast.error("Email and Match ID are required");
            return;
        }

        updateMutation.mutate({
            email,
            matchId,
            status,
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold">{isNew ? "Create Invite" : "Edit Invite"}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Match ID</label>
                        <Input
                            type="text"
                            value={matchId}
                            onChange={(e) => setMatchId(e.target.value)}
                            placeholder="match-123"
                        />
                    </div>

                    {!isNew && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as InviteStatus)}
                                    className="w-full border rounded p-2"
                                >
                                    {statusOptions.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Token</label>
                                <code className="block bg-gray-100 p-2 rounded">{invite?.token}</code>
                            </div>
                        </>
                    )}

                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
