import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";



export default function PromptAndStyle({
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle
}: {
    prompt: string;
    setPrompt: (prompt: string) => void;
    selectedStyle: string;
    setSelectedStyle: (style: string) => void;
}) {
    return (

        <div className="mt-6 space-y-4">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                </label>
                <Input
                    id="prompt"
                    type="text"
                    placeholder="Describe how you want to enhance your image..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full"
                />
            </div>

            <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                </label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="editorial">Editorial</SelectItem>
                        <SelectItem value="streetwear">Streetwear</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}