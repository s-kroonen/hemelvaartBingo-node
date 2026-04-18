import {useParams, useNavigate} from "react-router";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {ArrowLeft, Save, Plus, Trash2} from "lucide-react";
import {toast} from "sonner";
import {type Match, MatchStatus, type Invite} from "../types";
import {getMatch, updateMatch, getMatchInvites, addMatchInvite, removeMatchInvite, createMatch} from "../api/admin";

export default function AdminMatchEdit() {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = id === "new";

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [masterId, setMasterId] = useState("");
    const [status, setStatus] = useState<MatchStatus>(MatchStatus.DRAFT);

    const statusOptions = Object.values(MatchStatus);

    // Fetch match data
    const {data: match, isLoading} = useQuery({
        queryKey: ["match", id],
        queryFn: () => getMatch(id!),
        enabled: !isNew,
    });

    // Fetch match invites
    const {data: invites} = useQuery({
        queryKey: ["match-invites", id],
        queryFn: () => getMatchInvites(id!),
        enabled: !isNew,
    });
    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: Partial<Match>) => createMatch(data),
        onSuccess: () => {
            toast.success("Match updated successfully");
            queryClient.invalidateQueries({queryKey: ["matches"]});
            queryClient.invalidateQueries({queryKey: ["match", id]});
        },
        onError: () => {
            toast.error("Failed to create match");
        },
    });
    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<Match>) => updateMatch(id!, data),
        onSuccess: () => {
            toast.success("Match updated successfully");
            queryClient.invalidateQueries({queryKey: ["matches"]});
            queryClient.invalidateQueries({queryKey: ["match", id]});
        },
        onError: () => {
            toast.error("Failed to update match");
        },
    });

    // Add invite mutation
    const addInviteMutation = useMutation({
        mutationFn: (email: string) => addMatchInvite(id!, email),
        onSuccess: () => {
            toast.success("Invite sent successfully");
            queryClient.invalidateQueries({queryKey: ["match-invites", id]});
        },
        onError: () => {
            toast.error("Failed to send invite");
        },
    });

    // Remove invite mutation
    const removeInviteMutation = useMutation({
        mutationFn: (inviteId: string) => removeMatchInvite(id!, inviteId),
        onSuccess: () => {
            toast.success("Invite removed successfully");
            queryClient.invalidateQueries({queryKey: ["match-invites", id]});
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
            setMasterId(match.masterId);
            setStatus(match.status);
        }
    }, [match]);

    const handleSave = () => {
        if (!name || !startDate || !endDate || !masterId) {
            toast.error("All fields are required");
            return;
        }
        if (isNew) {
            createMutation.mutate({
                name,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                masterId,
                status,
            });
        } else {
            updateMutation.mutate({
                name,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                masterId,
                status,
            });
        }
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
                    <ArrowLeft className="w-4 h-4 mr-2"/>
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
                        <label className="block text-sm font-medium mb-1">Master ID</label>
                        <Input
                            type="text"
                            value={masterId}
                            onChange={(e) => setMasterId(e.target.value)}
                            placeholder="user-123"
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
                        <Save className="w-4 h-4 mr-2"/>
                        Save
                    </Button>
                </CardContent>
            </Card>

            {/* Invites */}
            {!isNew && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Invites</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const email = prompt("Email to invite:");
                                    if (email) {
                                        addInviteMutation.mutate(email);
                                    }
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2"/>
                                Send Invite
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!invites || invites.length === 0 ? (
                            <div className="text-gray-500">No invites sent yet</div>
                        ) : (
                            <div className="space-y-2">
                                {invites.map((invite: Invite) => (
                                    <div
                                        key={invite.id}
                                        className="border p-3 rounded flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">{invite.email}</div>
                                            <div className="text-sm text-gray-500">
                                                Status: {invite.status} • Token:{" "}
                                                <code className="bg-gray-100 px-1 rounded">{invite.token}</code>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeInviteMutation.mutate(invite.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500"/>
                                        </Button>
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
