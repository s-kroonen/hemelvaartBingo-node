import { useQuery } from "@tanstack/react-query";
import { getUsers, getMatches, getInvites } from "../../api/admin";

export default function AdminDashboard() {
    const users = useQuery({ queryKey: ["users"], queryFn: getUsers });
    const matches = useQuery({ queryKey: ["matches"], queryFn: getMatches });
    const invites = useQuery({ queryKey: ["invites"], queryFn: getInvites });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            {/* Users */}
            <section>
                <h2 className="text-xl">Users</h2>
                {users.data?.map((u: any) => (
                    <div key={u.id} className="border p-2">
                        {u.email} - {u.roles.join(", ")}
                    </div>
                ))}
            </section>

            {/* Matches */}
            <section>
                <h2 className="text-xl">Matches</h2>
                {matches.data?.map((m: any) => (
                    <div key={m.id} className="border p-2">
                        {m.name}
                    </div>
                ))}
            </section>

            {/* Invites */}
            <section>
                <h2 className="text-xl">Invites</h2>
                {invites.data?.map((i: any) => (
                    <div key={i.id} className="border p-2">
                        {i.token} - match: {i.matchId}
                    </div>
                ))}
            </section>
        </div>
    );
}