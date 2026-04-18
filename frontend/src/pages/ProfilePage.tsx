import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Save, Award as AwardIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { getProfile, updateProfile, getMyAwards } from "../api/user";

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    // Fetch profile
    const { data: profile } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        initialData: user,
    });

    // Fetch awards
    const { data: awards } = useQuery({
        queryKey: ["my-awards"],
        queryFn: getMyAwards,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: { email: string; name?: string }) => updateProfile(data),
        onSuccess: (updatedUser) => {
            toast.success("Profile updated successfully");
            setUser(updatedUser);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    // Populate form
    useEffect(() => {
        if (profile) {
            setEmail(profile.email);
            setName(profile.name || "");
        }
    }, [profile]);

    const handleSave = () => {
        if (!email) {
            toast.error("Email is required");
            return;
        }

        updateMutation.mutate({
            email,
            name: name || undefined,
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Roles</label>
                        <div className="flex gap-2">
                            {profile?.roles?.map((role: string) => (
                                <Badge key={role} variant="secondary">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Current Match ID</label>
                        <div className="text-gray-600">
                            {profile?.currentMatchId || "Not assigned to a match"}
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Awards */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AwardIcon className="w-5 h-5" />
                        My Awards
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!awards || awards.length === 0 ? (
                        <div className="text-gray-500">No awards yet. Keep playing!</div>
                    ) : (
                        <div className="space-y-3">
                            {awards.map((award: any) => (
                                <div
                                    key={award.id}
                                    className="border p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-lg">{award.title}</div>
                                            {award.description && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {award.description}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline">{award.type}</Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(award.earnedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <AwardIcon className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
