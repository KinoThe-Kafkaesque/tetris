import React, { useState } from "react";
import { Wand2, Key, AlertCircle } from "lucide-react";
import type { AssetType, StyleProfile } from "../types/design";

interface DesignFormProps {
	onSubmit: (
		brief: string,
		assets: AssetType[],
		styleProfile?: StyleProfile,
	) => void;
	onApiKeyChange: (key: string) => void;
	isLoading: boolean;
	error: string | null;
	apiKey: string;
}

const ASSET_OPTIONS: Array<{
	type: AssetType;
	label: string;
	description: string;
}> = [
	{ type: "copy", label: "Copy", description: "Headlines, sublines, and CTAs" },
	{ type: "image", label: "Image", description: "AI-generated illustrations" },
	{
		type: "palette",
		label: "Color Palette",
		description: "Cohesive color schemes",
	},
	{ type: "layout", label: "Layout", description: "CSS Grid structures" },
];

export const DesignForm: React.FC<DesignFormProps> = ({
	onSubmit,
	onApiKeyChange,
	isLoading,
	error,
	apiKey,
}) => {
	const [brief, setBrief] = useState("");
	const [selectedAssets, setSelectedAssets] = useState<AssetType[]>(["copy"]);
	const [showApiKey, setShowApiKey] = useState(false);

	const handleAssetToggle = (assetType: AssetType) => {
		setSelectedAssets((prev) =>
			prev.includes(assetType)
				? prev.filter((type) => type !== assetType)
				: [...prev, assetType],
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (brief.trim() && selectedAssets.length > 0) {
			onSubmit(brief.trim(), selectedAssets);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* API Key Section */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-center gap-2 mb-2">
					<Key size={16} className="text-blue-600" />
					<span className="text-sm font-medium text-blue-800">
						OpenAI API Key
					</span>
					<button
						type="button"
						onClick={() => setShowApiKey(!showApiKey)}
						className="text-xs text-blue-600 hover:text-blue-800"
					>
						{showApiKey ? "Hide" : "Show"}
					</button>
				</div>
				<input
					type={showApiKey ? "text" : "password"}
					value={apiKey}
					onChange={(e) => onApiKeyChange(e.target.value)}
					placeholder="sk-..."
					className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				<p className="text-xs text-blue-600 mt-1">
					Your API key is stored locally and never sent to our servers
				</p>
			</div>

			{/* Design Brief */}
			<div>
				<label
					htmlFor="brief"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Design Brief
				</label>
				<textarea
					id="brief"
					value={brief}
					onChange={(e) => setBrief(e.target.value)}
					placeholder="Describe what you want to create... e.g., 'A modern landing page for a tech startup with a clean, professional look and sci-fi elements'"
					rows={4}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					required
				/>
			</div>

			{/* Asset Type Selection */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">
					Assets to Generate
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{ASSET_OPTIONS.map((option) => (
						<label
							key={option.type}
							className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
								selectedAssets.includes(option.type)
									? "border-blue-500 bg-blue-50"
									: "border-gray-300 hover:border-gray-400"
							}`}
						>
							<input
								type="checkbox"
								checked={selectedAssets.includes(option.type)}
								onChange={() => handleAssetToggle(option.type)}
								className="sr-only"
							/>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="font-medium text-gray-900">
										{option.label}
									</span>
									{selectedAssets.includes(option.type) && (
										<div className="w-2 h-2 bg-blue-500 rounded-full" />
									)}
								</div>
								<p className="text-sm text-gray-500 mt-1">
									{option.description}
								</p>
							</div>
						</label>
					))}
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
					<AlertCircle size={16} className="text-red-600 flex-shrink-0" />
					<span className="text-sm text-red-800">{error}</span>
				</div>
			)}

			{/* Submit Button */}
			<button
				type="submit"
				disabled={
					isLoading || !brief.trim() || selectedAssets.length === 0 || !apiKey
				}
				className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{isLoading ? (
					<>
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						Generating...
					</>
				) : (
					<>
						<Wand2 size={16} />
						Generate Design Assets
					</>
				)}
			</button>
		</form>
	);
};
