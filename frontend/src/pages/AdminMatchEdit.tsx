import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Save, Plus, Trash2, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import {type Match, MatchStatus, type Invite, type User } from "../types";
import {
    getMatch,
    updateMatch,
    getMatchInvites,
    addMatchInvite,
    deleteInvite,
    getUsersByRole,
    addMatchMaster,
    removeMatchMaster,
    updateInvite
} from "../api/admin";

export default function AdminMatchEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = id === "new";

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [cardSize, setCardSize] = useState(5);
    const [status, setStatus] = useState<MatchStatus>(MatchStatus.DRAFT);
    const [selectedMasterToAdd, setSelectedMasterToAdd] = useState("");

    const statusOptions = Object.values(MatchStatus);

    // Fetch match data
    const { data: match, isLoading } = useQuery({
        queryKey: ["match", id],
        queryFn: () => getMatch(id!),
        enabled: !isNew,
    });

    // Fetch users with master role
    const { data: masterUsers } = useQuery({
        queryKey: ["users-masters"],
        queryFn: () => getUsersByRole("master"),
    });

    // Fetch match invites
    const { data: invites } = useQuery({
        queryKey: ["match-invites", id],
        queryFn: () => getMatchInvites(id!),
        enabled: !isNew,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<Match>) => updateMatch(id!, data),
        onSuccess: () => {
            toast.success("Match updated successfully");
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["match", id] });
        },
        onError: () => {
            toast.error("Failed to update match");
        },
    });

    // Add master mutation
    const addMasterMutation = useMutation({
        mutationFn: (userId: string) => addMatchMaster(id!, userId),
        onSuccess: () => {
            toast.success("Master added successfully");
            queryClient.invalidateQueries({ queryKey: ["match", id] });
            setSelectedMasterToAdd("");
        },
        onError: () => {
            toast.error("Failed to add master");
        },
    });

    // Remove master mutation
    const removeMasterMutation = useMutation({
        mutationFn: (userId: string) => removeMatchMaster(id!, userId),
        onSuccess: () => {
            toast.success("Master removed successfully");
            queryClient.invalidateQueries({ queryKey: ["match", id] });
        },
        onError: () => {
            toast.error("Failed to remove master");
        },
    });

    // Add invite mutation
    const addInviteMutation = useMutation({
        mutationFn: () => addMatchInvite(id!),
        onSuccess: () => {
            toast.success("Invite created successfully");
            queryClient.invalidateQueries({ queryKey: ["match-invites", id] });
        },
        onError: () => {
            toast.error("Failed to create invite");
        },
    });

    // Toggle invite active mutation
    const toggleInviteMutation = useMutation({
        mutationFn: ({ inviteId, isActive }: { inviteId: string; isActive: boolean }) =>
            updateInvite(inviteId, { isActive }),
        onSuccess: () => {
            toast.success("Invite status updated");
            queryClient.invalidateQueries({ queryKey: ["match-invites", id] });
        },
        onError: () => {
            toast.error("Failed to update invite");
        },
    });

    // Remove invite mutation
    const removeInviteMutation = useMutation({
        mutationFn: (inviteId: string) => deleteInvite(inviteId),
        onSuccess: () => {
            toast.success("Invite removed successfully");
            queryClient.invalidateQueries({ queryKey: ["match-invites", id] });
        },
        onError: () => {
            toast.error("Failed to remove invite");
        },
    });

    // Populate form when match data loads
    useEffect(() => {
        if (match) {
            setName(match.name);
            setStartDate(match.startDate.split("T")[0]);
            setEndDate(match.endDate.split("T")[0]);
            setCardSize(match.cardSize || 5);
            setStatus(match.status);
        }
    }, [match]);

    const handleSave = () => {
        if (!name || !startDate || !endDate) {
            toast.error("Name, start date, and end date are required");
            return;
        }

        updateMutation.mutate({
            name,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            cardSize,
            status,
        });
    };

    const copyInviteLink = (token: string) => {
        const link = `${window.location.origin}/invites/join/${token}`;
        navigator.clipboard.writeText(link);
        toast.success("Invite link copied to clipboard");
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
                <h1 className="text-3xl font-bold">{isNew ? "Create Match" : "Edit Match"}</h1>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Match Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Spring 2026 Bingo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Card Size (default 5 for 5x5)</label>
                        <Input
                            type="number"
                            min="3"
                            max="10"
                            value={cardSize}
                            onChange={(e) => setCardSize(parseInt(e.target.value) || 5)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as MatchStatus)}
                            className="w-full border rounded p-2"
                        >
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </CardContent>
            </Card>

            {/* Masters */}
            {!isNew && (
                <Card>
                    <CardHeader>
                        <CardTitle>Masters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <select
                                value={selectedMasterToAdd}
                                onChange={(e) => setSelectedMasterToAdd(e.target.value)}
                                className="flex-1 border rounded p-2"
                            >
                                <option value="">Select a master to add...</option>
                                {masterUsers?.map((user: User) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username || user.email}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={() => selectedMasterToAdd && addMasterMutation.mutate(selectedMasterToAdd)}
                                disabled={!selectedMasterToAdd || addMasterMutation.isPending}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {match?.masters?.length === 0 && (
                                <div className="text-gray-500">No masters assigned yet</div>
                            )}
                            {match?.masters?.map((master: User) => (
                                <div key={master.id} className="border p-3 rounded flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{master.username || master.email}</div>
                                        <div className="text-sm text-gray-500">{master.email}</div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMasterMutation.mutate(master.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Players */}
            {!isNew && (
                <Card>
                    <CardHeader>
                        <CardTitle>Players ({match?.players?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {match?.players?.length === 0 && (
                            <div className="text-gray-500">No players yet</div>
                        )}
                        {match?.players && match.players.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {match.players.map((player: User) => (
                                    <div key={player.id} className="border p-2 rounded text-sm">
                                        {player.username || player.email}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Invites */}
            {!isNew && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Invites (Multi-use)</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addInviteMutation.mutate()}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Invite
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!invites || invites.length === 0 ? (
                            <div className="text-gray-500">No invites created yet</div>
                        ) : (
                            <div className="space-y-2">
                                {invites.map((invite: Invite) => (
                                    <div
                                        key={invite.id}
                                        className="border p-3 rounded space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                    {invite.name}
                                                </code>
                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                    {invite.token}
                                                </code>
                                                <Badge variant={invite.isActive ? "default" : "secondary"}>
                                                    {invite.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {invite.metadata?.joinAsRole ?? "user"}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyInviteLink(invite.token)}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleInviteMutation.mutate({
                                                            inviteId: invite.id,
                                                            isActive: !invite.isActive,
                                                        })
                                                    }
                                                >
                                                    {invite.isActive ? (
                                                        <ToggleRight className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeInviteMutation.mutate(invite.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                                            {invite.metadata?.watchAdBeforeJoin && " • Ad required"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
