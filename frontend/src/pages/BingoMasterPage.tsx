import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMasterMatches,
    getMatchDetails,
    updateMatchName,
    updateMatchDates,
    getMatchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getMatchParticipants,
    inviteUser,
    removeParticipant,
    regenerateUserCard,
    getMatchInvites,
    deleteInvite,
} from "../api/master";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { Calendar, Users, ListTodo, Mail, Trash2, Edit2, Plus, RefreshCw, Save, X } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";

export default function BingoMasterPage() {
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    // const queryClient = useQueryClient();

    // Fetch matches where user is master
    const { data: matches, isLoading: matchesLoading } = useQuery({
        queryKey: ["master-matches"],
        queryFn: getMasterMatches,
    });

    // Fetch selected match details
    const { data: matchDetails } = useQuery({
        queryKey: ["match-details", selectedMatchId],
        queryFn: () => getMatchDetails(selectedMatchId!),
        enabled: !!selectedMatchId,
    });

    if (matchesLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading your matches...</div>
            </div>
        );
    }

    if (!matches || matches.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>You are not a master of any matches yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Bingo Master Dashboard</h1>

            {/* Match Selector */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Select Match</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedMatchId || ""} onValueChange={setSelectedMatchId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a match to manage" />
                        </SelectTrigger>
                        <SelectContent>
                            {matches.map((match: any) => (
                                <SelectItem key={match.id} value={match.id}>
                                    {match.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Match Management Tabs */}
            {selectedMatchId && (
                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="details">
                            <Calendar className="w-4 h-4 mr-2" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="events">
                            <ListTodo className="w-4 h-4 mr-2" />
                            Events
                        </TabsTrigger>
                        <TabsTrigger value="participants">
                            <Users className="w-4 h-4 mr-2" />
                            Participants
                        </TabsTrigger>
                        <TabsTrigger value="invites">
                            <Mail className="w-4 h-4 mr-2" />
                            Invites
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <MatchDetailsTab matchId={selectedMatchId} matchDetails={matchDetails} />
                    </TabsContent>

                    <TabsContent value="events">
                        <EventsTab matchId={selectedMatchId} />
                    </TabsContent>

                    <TabsContent value="participants">
                        <ParticipantsTab matchId={selectedMatchId} />
                    </TabsContent>

                    <TabsContent value="invites">
                        <InvitesTab matchId={selectedMatchId} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

// Match Details Tab Component
function MatchDetailsTab({ matchId, matchDetails }: { matchId: string; matchDetails: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const queryClient = useQueryClient();

    const updateNameMutation = useMutation({
        mutationFn: (newName: string) => updateMatchName(matchId, newName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-details", matchId] });
            queryClient.invalidateQueries({ queryKey: ["master-matches"] });
            toast.success("Match name updated successfully");
            setIsEditing(false);
        },
        onError: () => {
            toast.error("Failed to update match name");
        },
    });

    const updateDatesMutation = useMutation({
        mutationFn: ({ start, end }: { start: string; end: string }) =>
            updateMatchDates(matchId, start, end),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-details", matchId] });
            toast.success("Match dates updated successfully");
        },
        onError: () => {
            toast.error("Failed to update match dates");
        },
    });

    const handleUpdateName = () => {
        if (name.trim()) {
            updateNameMutation.mutate(name);
        }
    };

    const handleUpdateDates = () => {
        if (startDate && endDate) {
            updateDatesMutation.mutate({ start: startDate, end: endDate });
        }
    };

    if (!matchDetails) {
        return <div className="text-gray-500">Loading match details...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Match Name */}
                <div>
                    <Label>Match Name</Label>
                    {isEditing ? (
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter match name"
                            />
                            <Button onClick={handleUpdateName} disabled={updateNameMutation.isPending}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setName("");
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between mt-2 p-3 border rounded-lg">
                            <span className="font-medium">{matchDetails.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setName(matchDetails.name);
                                    setIsEditing(true);
                                }}
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Match Dates */}
                <div>
                    <Label>Match Duration</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <Label className="text-sm text-gray-600">Start Date</Label>
                            <Input
                                type="date"
                                value={startDate || (matchDetails.startDate ? format(new Date(matchDetails.startDate), 'yyyy-MM-dd') : '')}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-sm text-gray-600">End Date</Label>
                            <Input
                                type="date"
                                value={endDate || (matchDetails.endDate ? format(new Date(matchDetails.endDate), 'yyyy-MM-dd') : '')}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        className="mt-3"
                        onClick={handleUpdateDates}
                        disabled={updateDatesMutation.isPending}
                    >
                        Update Dates
                    </Button>
                </div>

                {/* Match Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {matchDetails.participantCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Participants</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {matchDetails.eventCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Events</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {matchDetails.inviteCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Pending Invites</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Events Tab Component
function EventsTab({ matchId }: { matchId: string }) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: events, isLoading } = useQuery({
        queryKey: ["match-events", matchId],
        queryFn: () => getMatchEvents(matchId),
    });

    const createMutation = useMutation({
        mutationFn: (event: { name: string; description?: string }) =>
            createEvent(matchId, event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-events", matchId] });
            toast.success("Event created successfully");
            setIsCreateDialogOpen(false);
        },
        onError: () => {
            toast.error("Failed to create event");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ eventId, event }: { eventId: string; event: any }) =>
            updateEvent(matchId, eventId, event),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-events", matchId] });
            toast.success("Event updated successfully");
            setEditingEvent(null);
        },
        onError: () => {
            toast.error("Failed to update event");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (eventId: string) => deleteEvent(matchId, eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-events", matchId] });
            toast.success("Event deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete event");
        },
    });

    if (isLoading) {
        return <div className="text-gray-500">Loading events...</div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Match Events</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                        </DialogHeader>
                        <EventForm
                            onSubmit={(data) => createMutation.mutate(data)}
                            isLoading={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {!events || events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <ListTodo className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No events yet. Create your first event!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {events.map((event: any) => (
                            <div
                                key={event.id}
                                className="border p-4 rounded-lg flex items-start justify-between"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">{event.name}</div>
                                    {event.description && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {event.description}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Dialog
                                        open={editingEvent?.id === event.id}
                                        onOpenChange={(open: boolean) => !open && setEditingEvent(null)}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingEvent(event)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Event</DialogTitle>
                                            </DialogHeader>
                                            <EventForm
                                                initialData={event}
                                                onSubmit={(data) =>
                                                    updateMutation.mutate({ eventId: event.id, event: data })
                                                }
                                                isLoading={updateMutation.isPending}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this event? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteMutation.mutate(event.id)}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Event Form Component
function EventForm({
                       initialData,
                       onSubmit,
                       isLoading,
                   }: {
    initialData?: any;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}) {
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Event Name *</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., First Bingo"
                    required
                />
            </div>
            <div>
                <Label>Description (Optional)</Label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add event details..."
                    rows={3}
                />
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isLoading || !name.trim()}>
                    {isLoading ? "Saving..." : "Save Event"}
                </Button>
            </DialogFooter>
        </form>
    );
}

// Participants Tab Component
function ParticipantsTab({ matchId }: { matchId: string }) {
    const queryClient = useQueryClient();

    const { data: participants, isLoading } = useQuery({
        queryKey: ["match-participants", matchId],
        queryFn: () => getMatchParticipants(matchId),
    });

    const regenerateMutation = useMutation({
        mutationFn: (userId: string) => regenerateUserCard(matchId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-participants", matchId] });
            toast.success("Card regenerated successfully");
        },
        onError: () => {
            toast.error("Failed to regenerate card");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeParticipant(matchId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-participants", matchId] });
            toast.success("Participant removed successfully");
        },
        onError: () => {
            toast.error("Failed to remove participant");
        },
    });

    if (isLoading) {
        return <div className="text-gray-500">Loading participants...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Match Participants</CardTitle>
            </CardHeader>
            <CardContent>
                {!participants || participants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No participants yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {participants.map((participant: any) => (
                            <div
                                key={participant.id}
                                className="border p-4 rounded-lg flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{participant.name || participant.email}</div>
                                    <div className="text-sm text-gray-600">{participant.email}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Score: <span className="font-medium">{participant.score || 0}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Regenerate Card
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Regenerate Card</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will generate a new bingo card for {participant.name || participant.email}. Their current progress will be lost. Continue?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => regenerateMutation.mutate(participant.id)}
                                                >
                                                    Regenerate
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Participant</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove {participant.name || participant.email} from this match?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => removeMutation.mutate(participant.id)}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Invites Tab Component
function InvitesTab({ matchId }: { matchId: string }) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    const queryClient = useQueryClient();

    const { data: invites, isLoading } = useQuery({
        queryKey: ["match-invites", matchId],
        queryFn: () => getMatchInvites(matchId),
    });

    const inviteMutation = useMutation({
        mutationFn: (email: string) => inviteUser(matchId, email),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-invites", matchId] });
            toast.success("Invitation sent successfully");
            setIsInviteDialogOpen(false);
            setEmail("");
        },
        onError: () => {
            toast.error("Failed to send invitation");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (inviteId: string) => deleteInvite(matchId, inviteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["match-invites", matchId] });
            toast.success("Invite deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete invite");
        },
    });

    const handleInvite = () => {
        if (email.trim()) {
            inviteMutation.mutate(email);
        }
    };

    if (isLoading) {
        return <div className="text-gray-500">Loading invites...</div>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Match Invitations</CardTitle>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Invite
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite User to Match</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleInvite}
                                    disabled={inviteMutation.isPending || !email.trim()}
                                >
                                    {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {!invites || invites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No pending invites.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {invites.map((invite: any) => (
                            <div
                                key={invite.id}
                                className="border p-4 rounded-lg flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{invite.email}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Token: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{invite.token}</code>
                                    </div>
                                    {invite.createdAt && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Sent: {new Date(invite.createdAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Invite</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this invitation?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteMutation.mutate(invite.id)}
                                                className="bg-red-500 hover:bg-red-600"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
