import {Combobox} from "@headlessui/react";
import {useEffect, useState} from "react";
import {useMatchStore} from "../../store/matchStore";
import {getMyMatches, setCurrentMatch} from "../../api/matches";

export default function MatchSelector() {
    const {matches, setMatches, currentMatchId, setMatch} = useMatchStore();

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyMatches();
                setMatches(data);

                if (!currentMatchId && data.length > 0) {
                    setMatch(data[0].id);
                }
            } catch (e) {
                console.error("Failed to load matches");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);
    if (!matches)
        return (
            <div className="text-sm text-gray-400">
                Fetch Error
            </div>
        );
    const filtered =
        query === ""
            ? matches
            : matches.filter((m) =>
                m.name.toLowerCase().includes(query.toLowerCase())
            );

    const selected = matches.find((m) => m.id === currentMatchId);

    const handleChange = async (match: any) => {
        if (!match) return;

        setMatch(match.id);
        await setCurrentMatch(match.id);
    };

    // 🧠 Empty state
    if (loading) {
        return <div className="text-sm text-gray-400">Loading matches...</div>;
    }

    if (matches.length === 0) {
        return (
            <div className="text-sm text-gray-400">
                No matches available
            </div>
        );
    }

    return (
        <div className="w-64">
            <Combobox value={selected} onChange={handleChange}>
                <div className="relative">
                    <Combobox.Input
                        className="w-full border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        displayValue={(m: any) => m?.name || ""}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Select match..."
                    />

                    <Combobox.Options
                        className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                        {filtered.length === 0 && (
                            <div className="p-2 text-sm text-gray-400">
                                No results
                            </div>
                        )}

                        {filtered.map((match) => (
                            <Combobox.Option
                                key={match.id}
                                value={match}
                                className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                            >
                                {match.name}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </div>
            </Combobox>
        </div>
    );
}