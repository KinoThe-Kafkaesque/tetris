import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
	DesignBrief,
	Asset,
	AssetType,
	StyleProfile,
	GenerationResult,
	CopyAsset,
	ColorPalette,
	LayoutAsset,
	ImageAsset,
} from "../types/design";
import { AIService } from "../services/aiService";

interface DesignGenerationState {
	isLoading: boolean;
	error: string | null;
	currentDesign: DesignBrief | null;
	assets: Asset[];
	apiKey: string;
}

interface DesignGenerationActions {
	setApiKey: (key: string) => void;
	createDesign: (
		brief: string,
		assetTypes: AssetType[],
		styleProfile?: StyleProfile,
	) => void;
	regenerateAsset: (assetId: string, newPrompt?: string) => void;
	clearError: () => void;
	resetDesign: () => void;
}

export const useDesignGeneration = (): DesignGenerationState &
	DesignGenerationActions => {
	const [state, setState] = useState<DesignGenerationState>({
		isLoading: false,
		error: null,
		currentDesign: null,
		assets: [],
		apiKey: "",
	});

	const setApiKey = useCallback((key: string) => {
		setState((prev) => ({ ...prev, apiKey: key }));
	}, []);

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	const resetDesign = useCallback(() => {
		setState((prev) => ({
			...prev,
			currentDesign: null,
			assets: [],
			error: null,
		}));
	}, []);

	const addAsset = useCallback(
		(
			type: AssetType,
			content: CopyAsset | ImageAsset | ColorPalette | LayoutAsset,
			prompt: string,
			designId: string,
		) => {
			const newAsset: Asset = {
				id: uuidv4(),
				type,
				content,
				designId,
				createdAt: new Date(),
    metadata: {
      prompt: prompt,
      model: "",
      temperature: 0,
      createdAt: new Date(),
    },
			};

			setState((prev) => ({
				...prev,
				assets: [...prev.assets, newAsset],
			}));
		},
		[],
	);

	const generateAsset = useCallback(
		async (
			aiService: AIService,
			type: AssetType,
			brief: string,
			designId: string,
			styleProfile?: StyleProfile,
		) => {
			let result: GenerationResult;

			switch (type) {
				case "copy":
					result = await aiService.generateCopy(brief, undefined, styleProfile);
					break;
				case "palette":
					result = await aiService.generatePalette(
						brief,
						undefined,
						styleProfile,
					);
					break;
				case "layout":
					result = await aiService.generateLayout(
						brief,
						undefined,
						styleProfile,
					);
					break;
				case "image":
					result = await aiService.generateImage(brief, styleProfile);
					break;
				default:
					result = { success: false, error: `Unsupported asset type: ${type}` };
			}

			if (result.success && result.data) {
				addAsset(type, result.data, brief, designId);
			} else {
				throw new Error(result.error || `Failed to generate ${type}`);
			}
		},
		[addAsset],
	);

	const createDesign = useCallback(
		async (
			brief: string,
			assetTypes: AssetType[],
			styleProfile?: StyleProfile,
		) => {
			if (!state.apiKey) {
				setState((prev) => ({
					...prev,
					error: "Please provide an OpenAI API key",
				}));
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			try {
				const designId = uuidv4();
				const newDesign: DesignBrief = {
					id: designId,
					brief,
					assets: assetTypes,
					styleProfileId: styleProfile?.id,
					createdAt: new Date(),
				};

				setState((prev) => ({
					...prev,
					currentDesign: newDesign,
					assets: [],
				}));

				const aiService = new AIService(state.apiKey);

				// Generate assets in parallel for better performance
				const generatePromises = assetTypes.map((type) =>
					generateAsset(aiService, type, brief, designId, styleProfile),
				);

				await Promise.all(generatePromises);
			} catch (error) {
				setState((prev) => ({
					...prev,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				}));
			} finally {
				setState((prev) => ({ ...prev, isLoading: false }));
			}
		},
		[state.apiKey, generateAsset],
	);

	const regenerateAsset = useCallback(
		async (assetId: string, newPrompt?: string) => {
			if (!state.apiKey || !state.currentDesign) return;

			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			try {
				const asset = state.assets.find((a) => a.id === assetId);
				if (!asset) {
					throw new Error("Asset not found");
				}

				const aiService = new AIService(state.apiKey);
				const prompt = newPrompt || asset.metadata.prompt;

				await generateAsset(
					aiService,
					asset.type,
					prompt,
					state.currentDesign.id,
				);

				// Remove the old asset
				setState((prev) => ({
					...prev,
					assets: prev.assets.filter((a) => a.id !== assetId),
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				}));
			} finally {
				setState((prev) => ({ ...prev, isLoading: false }));
			}
		},
		[state.apiKey, state.currentDesign, state.assets, generateAsset],
	);

	return {
		...state,
		setApiKey,
		createDesign,
		regenerateAsset,
		clearError,
		resetDesign,
	};
};
