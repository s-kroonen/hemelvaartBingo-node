import { Combobox } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useMatchStore } from "../../store/matchStore";
import { getMyMatches, setCurrentMatch } from "../../api/matches";

export default function MatchSelector() {
    const { matches, setMatches, currentMatchId, setMatch } = useMatchStore();

    const [query, setQuery] = useState("");

    useEffect(() => {
        const load = async () => {
            const data = await getMyMatches();
            setMatches(data);

            // Auto select from backend if none in localStorage
            if (!currentMatchId && data.length > 0) {
                setMatch(data[0].id);
            }
        };

        load();
    }, []);

    const filtered =
        query === ""
            ? matches
            : matches.filter((m) =>
                m.name.toLowerCase().includes(query.toLowerCase())
            );

    const selected = matches.find((m) => m.id === currentMatchId);

    const handleChange = async (match: any) => {
        setMatch(match.id);
        await setCurrentMatch(match.id); // persist to backend
    };

    return (
        <div className="w-64">
            <Combobox value={selected} onChange={handleChange}>
                <Combobox.Input
                    className="w-full border p-1"
                    displayValue={(m: any) => m?.name || ""}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Select match..."
                />

                <Combobox.Options className="bg-white border mt-1 max-h-60 overflow-auto">
                    {filtered.map((match) => (
                        <Combobox.Option
                            key={match.id}
                            value={match}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                        >
                            {match.name}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>
        </div>
    );
}