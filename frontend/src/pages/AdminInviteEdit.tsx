import {useParams, useNavigate} from "react-router";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Switch} from "../components/ui/switch";
import {ArrowLeft, Save, Copy} from "lucide-react";
import {toast} from "sonner";
import type {Invite, InviteMetadata} from "../types";
import {getInvite, updateInvite} from "../api/admin";

export default function AdminInviteEdit() {
    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = id === "new";

    const [isActive, setIsActive] = useState(true);
    const [watchAdBeforeJoin, setWatchAdBeforeJoin] = useState(false);
    const [joinAsRole, setJoinAsRole] = useState<"user" | "master" | "admin">("user");
    const [description, setDescription] = useState("");

    // Fetch invite data
    const {data: invite, isLoading} = useQuery({
        queryKey: ["invite", id],
        queryFn: () => getInvite(id!),
        enabled: !isNew,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<Invite>) => updateInvite(id!, data),
        onSuccess: () => {
            toast.success("Invite updated successfully");
            queryClient.invalidateQueries({queryKey: ["invites"]});
            queryClient.invalidateQueries({queryKey: ["invite", id]});
        },
        onError: () => {
            toast.error("Failed to update invite");
        },
    });

    // Populate form when invite data loads
    useEffect(() => {
        if (invite) {
            const meta = invite.metadata ?? {};

            setIsActive(invite.isActive);
            setWatchAdBeforeJoin(meta.watchAdBeforeJoin ?? false);
            setJoinAsRole(meta.joinAsRole ?? "user");
            setDescription(meta.description ?? "");
        }
    }, [invite]);

    const handleSave = () => {
        const metadata: InviteMetadata = {};

        if (watchAdBeforeJoin) metadata.watchAdBeforeJoin = true;
        if (joinAsRole !== "user") metadata.joinAsRole = joinAsRole;
        if (description.trim()) metadata.description = description;

        updateMutation.mutate({
            isActive,
            metadata,
        });
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/invites/join/${invite?.token}`;
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

    if (isNew) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-gray-500">
                    Create invites from the match edit page
                </div>
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
                <h1 className="text-3xl font-bold">Edit Invite</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Token</label>
                        <div className="flex gap-2">
                            <code className="flex-1 bg-gray-100 p-2 rounded">{invite?.token}</code>
                            <Button variant="outline" size="sm" onClick={copyInviteLink}>
                                <Copy className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Invite Name</label>
                        <div className="text-gray-600">{invite?.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Match ID</label>
                        <div className="text-gray-600">{invite?.matchId}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Expires</label>
                        <div className="text-gray-600">
                            {invite?.expiresAt && new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium">Active</label>
                            <p className="text-xs text-gray-500">Allow new users to join with this invite</p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive}/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Join As Role</label>
                        <select
                            value={joinAsRole}
                            onChange={(e) => setJoinAsRole(e.target.value as any)}
                            className="w-full border rounded p-2"
                        >
                            <option value="user">User</option>
                            <option value="master">Master</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium">Watch Ad Before Join</label>
                            <p className="text-xs text-gray-500">Require users to watch an ad before joining</p>
                        </div>
                        <Switch checked={watchAdBeforeJoin} onCheckedChange={setWatchAdBeforeJoin}/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded p-2"
                            rows={3}
                            placeholder="Internal notes about this invite..."
                        />
                    </div>

                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        <Save className="w-4 h-4 mr-2"/>
                        Save
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
