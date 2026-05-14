import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Bell, Send, Users, Calendar, User, Loader2, CheckCircle2 } from "lucide-react";
import type { Match, User as UserType } from "../types";
import { getMatches, getUsers, sendNotification } from "../api/admin";
import type { NotificationTarget } from "../api/admin";

type TargetOption = { value: NotificationTarget; label: string; icon: React.ReactNode };

export function NotificationsTab() {
    const [target, setTarget] = useState<NotificationTarget>("all");
    const [matchId, setMatchId] = useState("");
    const [userId, setUserId] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [lastResult, setLastResult] = useState<{ sent: number } | null>(null);

    const matches = useQuery({ queryKey: ["matches"], queryFn: getMatches });
    const users = useQuery({ queryKey: ["users"], queryFn: getUsers });

    const mutation = useMutation({
        mutationFn: sendNotification,
        onSuccess: (data) => {
            setLastResult(data);
            setTitle("");
            setBody("");
        },
    });

    const canSubmit =
        title.trim() &&
        body.trim() &&
        (target === "all" ||
            (target === "match" && matchId) ||
            (target === "user" && userId));

    function handleSend() {
        if (!canSubmit) return;
        setLastResult(null);
        mutation.mutate({ target, title, body, matchId, userId });
    }

    const targetOptions: TargetOption[] = [
        { value: "all",   label: "All Users",  icon: <Users    className="w-4 h-4" /> },
        { value: "match", label: "Match",       icon: <Calendar className="w-4 h-4" /> },
        { value: "user",  label: "Single User", icon: <User     className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Send Push Notification
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">

                    {/* Target toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Send to</label>
                        <div className="flex gap-2">
                            {targetOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setTarget(opt.value);
                                        setMatchId("");
                                        setUserId("");
                                        setLastResult(null);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                                        ${target === opt.value
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Match picker */}
                    {target === "match" && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Select match</label>
                            {matches.isLoading && <p className="text-sm text-gray-500">Loading matches…</p>}
                            {matches.data && (
                                <select
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={matchId}
                                    onChange={(e) => setMatchId(e.target.value)}
                                >
                                    <option value="">— choose a match —</option>
                                    {matches.data.map((m: Match) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* User picker */}
                    {target === "user" && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Select user</label>
                            {users.isLoading && <p className="text-sm text-gray-500">Loading users…</p>}
                            {users.data && (
                                <select
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                >
                                    <option value="">— choose a user —</option>
                                    {users.data.map((u: UserType) => (
                                        <option key={u.id} value={u.id}>
                                            {u.email}{u.username ? ` (${u.username})` : ""}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            placeholder="Notification title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                            placeholder="Notification body…"
                            rows={3}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>

                    {/* Recipient preview */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Sending to:</span>
                        {target === "all" && <Badge variant="secondary">All users</Badge>}
                        {target === "match" && matchId && (
                            <Badge variant="secondary">
                                {matches.data?.find((m: Match) => m.id === matchId)?.name ?? matchId}
                            </Badge>
                        )}
                        {target === "user" && userId && (
                            <Badge variant="secondary">
                                {users.data?.find((u: UserType) => u.id === userId)?.email ?? userId}
                            </Badge>
                        )}
                    </div>

                    {/* Error */}
                    {mutation.isError && (
                        <p className="text-sm text-red-500">
                            Failed: {(mutation.error as Error).message}
                        </p>
                    )}

                    {/* Success */}
                    {lastResult && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Sent to {lastResult.sent} device{lastResult.sent !== 1 ? "s" : ""}
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleSend}
                        disabled={!canSubmit || mutation.isPending}
                        className="w-full"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending…
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Notification
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}