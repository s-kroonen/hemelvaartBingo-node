import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAd, createAd, updateAd } from "../api/admin";
import { useState, useEffect } from "react";
import {Button} from "@/components/ui/button.tsx";

export default function AdminAdEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === "new";

    const { data } = useQuery({
        queryKey: ["ad", id],
        queryFn: () => getAd(id!),
        enabled: !isNew,
    });

    const [form, setForm] = useState<any>({
        name: "",
        url: "",
        type: "photo",
        forcedWatchTime: 5,
        placementTags: [],
        metadata: {},
        isActive: true,
    });

    useEffect(() => {
        if (data) setForm(data);
    }, [data]);

    const mutation = useMutation({
        mutationFn: (data: any) =>
            isNew ? createAd(data) : updateAd(id!, data),
        onSuccess: () => navigate("/admin"),
    });

    return (
        <div className="container mx-auto p-6 max-w-xl space-y-4">
            <h1 className="text-2xl font-bold">
                {isNew ? "Create Ad" : "Edit Ad"}
            </h1>

            <input
                className="w-full border p-2 rounded"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
                className="w-full border p-2 rounded"
                placeholder="URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
            />

            <select
                className="w-full border p-2 rounded"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
            </select>

            <input
                type="number"
                className="w-full border p-2 rounded"
                value={form.forcedWatchTime}
                onChange={(e) =>
                    setForm({ ...form, forcedWatchTime: Number(e.target.value) })
                }
            />

            <input
                className="w-full border p-2 rounded"
                placeholder="Tags (comma separated)"
                value={form.placementTags.join(",")}
                onChange={(e) =>
                    setForm({
                        ...form,
                        placementTags: e.target.value.split(","),
                    })
                }
            />

            <textarea
                className="w-full border p-2 rounded"
                placeholder="Metadata JSON"
                value={JSON.stringify(form.metadata)}
                onChange={(e) => {
                    try {
                        setForm({ ...form, metadata: JSON.parse(e.target.value) });
                    } catch {}
                }}
            />

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                    }
                />
                Active
            </label>

            <Button onClick={() => mutation.mutate(form)}>
                Save
            </Button>
        </div>
    );
}