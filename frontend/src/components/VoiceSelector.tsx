import { VOICES } from "../constants/voices";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function VoiceSelector({
    value,
    onChange,
}: Props) {
    return (
        <div className="mb-4">
            <label className="block text-sm text-white mb-2">
                Voice
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
            >
                {VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                        {voice.name}
                    </option>
                ))}
            </select>
        </div>
    );
}