import { useQuery } from "@tanstack/react-query";
import { getUsers, getMatches, getInvites } from "../api/admin.ts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, Calendar, Mail } from "lucide-react";

export default function AdminDashboard() {
    const users = useQuery({ queryKey: ["users"], queryFn: getUsers });
    const matches = useQuery({ queryKey: ["matches"], queryFn: getMatches });
    const invites = useQuery({ queryKey: ["invites"], queryFn: getInvites });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Users */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {users.isLoading && <div className="text-gray-500">Loading users...</div>}
                    {users.error && <div className="text-red-500">Failed to load users</div>}
                    {users.data && (
                        <div className="space-y-2">
                            {users.data.map((u: any) => (
                                <div key={u.id} className="border p-4 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{u.email}</div>
                                        {u.name && <div className="text-sm text-gray-500">{u.name}</div>}
                                    </div>
                                    <div className="flex gap-2">
                                        {u.roles.map((role: string) => (
                                            <Badge key={role} variant="secondary">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Matches */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Matches
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {matches.isLoading && <div className="text-gray-500">Loading matches...</div>}
                    {matches.error && <div className="text-red-500">Failed to load matches</div>}
                    {matches.data && (
                        <div className="space-y-2">
                            {matches.data.map((m: any) => (
                                <div key={m.id} className="border p-4 rounded-lg">
                                    <div className="font-medium">{m.name}</div>
                                    {m.startDate && m.endDate && (
                                        <div className="text-sm text-gray-500">
                                            {new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    {m.master && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            Master: {m.master.email}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invites */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Invites
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {invites.isLoading && <div className="text-gray-500">Loading invites...</div>}
                    {invites.error && <div className="text-red-500">Failed to load invites</div>}
                    {invites.data && (
                        <div className="space-y-2">
                            {invites.data.map((i: any) => (
                                <div key={i.id} className="border p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{i.email}</div>
                                            <div className="text-sm text-gray-500">
                                                Token: <code className="bg-gray-100 px-2 py-1 rounded">{i.token}</code>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Match ID: {i.matchId}
                                        </div>
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
