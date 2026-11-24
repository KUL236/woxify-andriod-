import { LANGUAGES } from "../constants/languages.ts";

interface Props {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

export default function LanguageSelector({
    value,
    onChange,
    label,
}: Props) {
    return (
        <div className="mb-4">
            <label className="block text-sm text-white mb-2">
                {label}
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
            >
                {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                    </option>
                ))}
            </select>
        </div>
    );
}