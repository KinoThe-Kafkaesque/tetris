import { useState } from "react";
import { Sparkles, RotateCcw, X } from "lucide-react";
import { useDesignGeneration } from "./hooks/useDesignGeneration";
import { useImageAnalysis } from "./hooks/useImageAnalysis";
import { DesignForm } from "./components/DesignForm";
import { DesignCanvas } from "./components/DesignCanvas";
import type { AssetType } from "./types/design";
import "./App.css";

const App: React.FC = () => {
	const [showForm, setShowForm] = useState(true);

	const {
		isLoading,
		error,
		currentDesign,
		assets,
		apiKey,
		setApiKey,
		createDesign,
		regenerateAsset,
		clearError,
		resetDesign,
	} = useDesignGeneration();

	const {
		analyzeImage,
		isAnalyzing,
		error: analysisError,
		clearError: clearAnalysisError,
	} = useImageAnalysis(apiKey);

	const handleAssetGeneration = async (type: AssetType, prompt: string) => {
		// Generate a single asset and add it to the current design
		await createDesign(prompt, [type]);
	};

	const handleImageUpload = async (file: File) => {
		try {
			clearAnalysisError();
			const extractedAssets = await analyzeImage(file);

			if (extractedAssets.length > 0) {
				// Create a new design with the extracted assets
				await createDesign("Design extracted from uploaded image", [
					"palette",
					"copy",
				]);
			}
		} catch (err) {
			console.error("Failed to analyze image:", err);
		}
	};

	const handleInitialDesign = async (
		brief: string,
		assetTypes: AssetType[],
	) => {
		await createDesign(brief, assetTypes);
		setShowForm(false); // Hide form after initial generation
	};

	const handleNewDesign = () => {
		resetDesign();
		setShowForm(true);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<Sparkles size={32} className="text-blue-600" />
						<h1 className="text-3xl font-bold text-gray-900">
							Generative Design Studio
						</h1>
					</div>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Create, manipulate, and refine design assets with AI. Generate
						content on-demand and compose visually on an interactive canvas.
					</p>
				</div>

				{/* Error State */}
				{(error || analysisError) && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-2">
								<X size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
								<div>
									<h3 className="font-medium text-red-800">Error</h3>
									<p className="text-sm text-red-700 mt-1">
										{error || analysisError}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => {
									clearError();
									clearAnalysisError();
								}}
								className="text-red-600 hover:text-red-800 transition-colors"
							>
								<X size={16} />
							</button>
						</div>
					</div>
				)}

				{/* Main Content */}
				{showForm && !currentDesign ? (
					/* Initial Design Setup */
					<div className="max-w-2xl mx-auto">
						<div className="bg-white rounded-lg shadow-sm border p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">
								Start Your Design
							</h2>
							<DesignForm
								onSubmit={handleInitialDesign}
								onApiKeyChange={setApiKey}
								isLoading={isLoading}
								error={null} // Handled above
								apiKey={apiKey}
							/>
						</div>

						{/* Quick Start Options */}
						<div className="mt-8 text-center">
							<p className="text-gray-600 mb-4">
								Or jump straight to the canvas:
							</p>
							<button
								type="button"
								onClick={() => setShowForm(false)}
								className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
							>
								Skip to Canvas
							</button>
						</div>
					</div>
				) : (
					/* Integrated Canvas View */
					<div className="space-y-6">
						{/* Current Design Info */}
						{currentDesign && (
							<div className="bg-white rounded-lg shadow-sm border p-4">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">
											{currentDesign.brief}
										</h2>
										<p className="text-sm text-gray-500">
											{assets.length} assets • Created{" "}
											{currentDesign.createdAt.toLocaleTimeString()}
										</p>
									</div>
									<button
										type="button"
										onClick={handleNewDesign}
										className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									>
										<RotateCcw size={16} />
										New Design
									</button>
								</div>
							</div>
						)}

						{/* Integrated Canvas */}
						<DesignCanvas
							assets={assets}
							onGenerateAsset={handleAssetGeneration}
							onImageUpload={handleImageUpload}
							onRegenerateAsset={regenerateAsset}
							isGenerating={isLoading || isAnalyzing}
							apiKey={apiKey}
							onApiKeyChange={setApiKey}
						/>

						{/* Loading Overlay */}
						{(isLoading || isAnalyzing) && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg p-6 shadow-xl">
									<div className="flex items-center gap-3">
										<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
										<span className="text-gray-900 font-medium">
											{isAnalyzing
												? "Analyzing image..."
												: "Generating assets..."}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Footer */}
				<div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
					<p>
						Powered by OpenAI • Your API key is stored locally and never shared
						•
						<span className="text-blue-600 hover:text-blue-800 ml-1 cursor-pointer">
							Learn more about API usage
						</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default App;
