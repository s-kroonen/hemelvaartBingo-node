import {useQuery} from "@tanstack/react-query";
import {getUsers, getMatches, getInvites} from "../api/admin";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Badge} from "../components/ui/badge";
import {Button} from "../components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../components/ui/tabs";
import {Users, Calendar, Mail, Plus, Edit} from "lucide-react";
import {useNavigate} from "react-router";
import type {User, Match, Invite} from "../types";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const users = useQuery({queryKey: ["users"], queryFn: getUsers});
    const matches = useQuery({queryKey: ["matches"], queryFn: getMatches});
    const invites = useQuery({queryKey: ["invites"], queryFn: getInvites});

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">
                        <Users className="w-4 h-4 mr-2"/>
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="matches">
                        <Calendar className="w-4 h-4 mr-2"/>
                        Matches
                    </TabsTrigger>
                    <TabsTrigger value="invites">
                        <Mail className="w-4 h-4 mr-2"/>
                        Invites
                    </TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => navigate("/admin/users/new")}>
                            <Plus className="w-4 h-4 mr-2"/>
                            Create User
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {users.isLoading && <div className="text-gray-500">Loading users...</div>}
                            {users.error && <div className="text-red-500">Failed to load users</div>}
                            {users.data && (
                                <div className="space-y-2">
                                    {users.data.map((u: User) => (
                                        <div
                                            key={u.id}
                                            className="border p-4 rounded-lg flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/admin/users/${u.id}`)}
                                        >
                                            <div>
                                                <div className="font-medium">{u.email}</div>
                                                {u.username && <div className="text-sm text-gray-500">{u.username}</div>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {u.roles.map((role: string) => (
                                                        <Badge key={role} variant="secondary">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/users/${u.id}`);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Matches Tab */}
                <TabsContent value="matches" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => navigate("/admin/matches/new")}>
                            <Plus className="w-4 h-4 mr-2"/>
                            Create Match
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Matches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {matches.isLoading && <div className="text-gray-500">Loading matches...</div>}
                            {matches.error && <div className="text-red-500">Failed to load matches</div>}
                            {matches.data && (
                                <div className="space-y-2">
                                    {matches.data.map((m: Match) => (
                                        <div
                                            key={m.id}
                                            className="border p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                                            onClick={() => navigate(`/admin/matches/${m.id}`)}
                                        >
                                            <div>
                                                <div className="font-medium">{m.name}</div>
                                                {m.startDate && m.endDate && (
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(m.startDate).toLocaleDateString()} -{" "}
                                                        {new Date(m.endDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {m.masters?.length || 0} masters • {m.players?.length || 0} players
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/matches/${m.id}`);
                                                }}
                                            >
                                                <Edit className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Invites Tab */}
                <TabsContent value="invites" className="space-y-4">
                    {/*<div className="flex justify-end">*/}
                    {/*    <Button onClick={() => navigate("/admin/invites/new")}>*/}
                    {/*        <Plus className="w-4 h-4 mr-2"/>*/}
                    {/*        Create Invite*/}
                    {/*    </Button>*/}
                    {/*</div>*/}

                    <Card>
                        <CardHeader>
                            <CardTitle>All Invites</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invites.isLoading && <div className="text-gray-500">Loading invites...</div>}
                            {invites.error && <div className="text-red-500">Failed to load invites</div>}
                            {invites.data && (
                                <div className="space-y-2">
                                    {invites.data.map((i: Invite) => (
                                        <div
                                            key={i.id}
                                            className="border p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/admin/invites/${i.id}`)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{i.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Token: <code
                                                        className="bg-gray-100 px-2 py-1 rounded">{i.token}</code>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm text-gray-600">Match ID: {i.matchId}</div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/invites/${i.id}`);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
