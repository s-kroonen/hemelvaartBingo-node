import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { ArrowLeft, Save, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type {User, Award} from "../types";
import { getUser, updateUser, getUserCard, regenerateUserCard, getUserAwards, addUserAward, removeUserAward } from "../api/admin";

export default function AdminUserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = id === "new";

    const [email, setEmail] = useState("");
    const [username, setName] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [currentMatchId, setCurrentMatchId] = useState("");

    const availableRoles = ["user", "master", "admin"];

    // Fetch user data
    const { data: user, isLoading } = useQuery({
        queryKey: ["user", id],
        queryFn: () => getUser(id!),
        enabled: !isNew,
    });

    // Fetch user card
    const { data: card } = useQuery({
        queryKey: ["user-card", id],
        queryFn: () => getUserCard(id!),
        enabled: !isNew,
    });

    // Fetch user awards
    const { data: awards } = useQuery({
        queryKey: ["user-awards", id],
        queryFn: () => getUserAwards(id!),
        enabled: !isNew,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<User>) => updateUser(id!, data),
        onSuccess: () => {
            toast.success("User updated successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", id] });
        },
        onError: () => {
            toast.error("Failed to update user");
        },
    });

    // Regenerate card mutation
    const regenerateCardMutation = useMutation({
        mutationFn: () => regenerateUserCard(id!),
        onSuccess: () => {
            toast.success("Card regenerated successfully");
            queryClient.invalidateQueries({ queryKey: ["user-card", id] });
        },
        onError: () => {
            toast.error("Failed to regenerate card");
        },
    });

    // Add award mutation
    const addAwardMutation = useMutation({
        mutationFn: (award: Partial<Award>) => addUserAward(id!, award),
        onSuccess: () => {
            toast.success("Award added successfully");
            queryClient.invalidateQueries({ queryKey: ["user-awards", id] });
        },
        onError: () => {
            toast.error("Failed to add award");
        },
    });

    // Remove award mutation
    const removeAwardMutation = useMutation({
        mutationFn: (awardId: string) => removeUserAward(id!, awardId),
        onSuccess: () => {
            toast.success("Award removed successfully");
            queryClient.invalidateQueries({ queryKey: ["user-awards", id] });
        },
        onError: () => {
            toast.error("Failed to remove award");
        },
    });

    // Populate form when user data loads
    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setName(user.name || "");
            setSelectedRoles(user.roles);
            setCurrentMatchId(user.currentMatchId || "");
        }
    }, [user]);

    const handleSave = () => {
        if (!email || selectedRoles.length === 0) {
            toast.error("Email and at least one role are required");
            return;
        }

        updateMutation.mutate({
            email,
            username: username || undefined,
            roles: selectedRoles,
            currentMatchId: currentMatchId || null,
        });
    };

    const toggleRole = (role: string) => {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
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
                <h1 className="text-3xl font-bold">{isNew ? "Create User" : "Edit User"}</h1>
            </div>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
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
                        <label className="block text-sm font-medium mb-1">Name (optional)</label>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Current Match ID</label>
                        <Input
                            type="text"
                            value={currentMatchId}
                            onChange={(e) => setCurrentMatchId(e.target.value)}
                            placeholder="match-123"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Roles</label>
                        <div className="flex gap-2">
                            {availableRoles.map((role) => (
                                <Badge
                                    key={role}
                                    variant={selectedRoles.includes(role) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleRole(role)}
                                >
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </CardContent>
            </Card>

            {/* Bingo Card */}
            {!isNew && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Bingo Card</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => regenerateCardMutation.mutate()}
                                disabled={regenerateCardMutation.isPending}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!card && <div className="text-gray-500">No card assigned</div>}
                        {card && (
                            <div className="grid grid-cols-5 gap-2 max-w-md">
                                {card.cells.map((cell: any) => (
                                    <div
                                        key={cell.id}
                                        className={`border p-3 rounded text-center text-sm ${
                                            cell.isChecked ? "bg-green-100 border-green-500" : "bg-white"
                                        }`}
                                    >
                                        {cell.value}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Awards */}
            {!isNew && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Awards</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const title = prompt("Award title:");
                                    if (title) {
                                        addAwardMutation.mutate({
                                            title,
                                            type: "SPECIAL" as any,
                                            matchId: currentMatchId || user?.currentMatchId || "",
                                            earnedAt: new Date().toISOString(),
                                        });
                                    }
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Award
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!awards || awards.length === 0 ? (
                            <div className="text-gray-500">No awards yet</div>
                        ) : (
                            <div className="space-y-2">
                                {awards.map((award: Award) => (
                                    <div key={award.id} className="border p-3 rounded flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{award.title}</div>
                                            <div className="text-sm text-gray-500">
                                                {award.type} • {new Date(award.earnedAt).toLocaleDateString()}
                                            </div>
                                            {award.description && (
                                                <div className="text-sm text-gray-600 mt-1">{award.description}</div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAwardMutation.mutate(award.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
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
