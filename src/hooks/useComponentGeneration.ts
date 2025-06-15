import { useState, useCallback } from "react";
import { AIService } from "../services/aiService";
import {
	componentRenderer,
	type RenderedComponent,
} from "../services/componentRenderer";
import type { ComponentAsset } from "../types/design";

interface UseComponentGenerationReturn {
	isGenerating: boolean;
	isRendering: boolean;
	error: string | null;
	renderedComponents: RenderedComponent[];
	generateAndRenderComponent: (
		prompt: string,
		apiKey: string,
	) => Promise<RenderedComponent | null>;
	renderExistingComponent: (
		component: ComponentAsset,
	) => Promise<RenderedComponent | null>;
	clearError: () => void;
	clearComponents: () => void;
}

export const useComponentGeneration = (): UseComponentGenerationReturn => {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isRendering, setIsRendering] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [renderedComponents, setRenderedComponents] = useState<
		RenderedComponent[]
	>([]);

	const generateAndRenderComponent = useCallback(
		async (
			prompt: string,
			apiKey: string,
		): Promise<RenderedComponent | null> => {
			if (!apiKey.trim()) {
				setError("API key is required");
				return null;
			}

			setIsGenerating(true);
			setError(null);

			try {
				// Generate component using AI
				const aiService = new AIService(apiKey);
				const asset = await aiService.generateAsset("component", prompt);
				const componentContent = asset.content as ComponentAsset;

				setIsGenerating(false);
				setIsRendering(true);

				// Render component to image
				const rendered =
					await componentRenderer.renderComponent(componentContent);

				// Add to rendered components list
				setRenderedComponents((prev) => [...prev, rendered]);

				return rendered;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to generate component";
				setError(errorMessage);
				console.error("Component generation failed:", err);
				return null;
			} finally {
				setIsGenerating(false);
				setIsRendering(false);
			}
		},
		[],
	);

	const renderExistingComponent = useCallback(
		async (component: ComponentAsset): Promise<RenderedComponent | null> => {
			setIsRendering(true);
			setError(null);

			try {
				const rendered = await componentRenderer.renderComponent(component);
				setRenderedComponents((prev) => [...prev, rendered]);
				return rendered;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to render component";
				setError(errorMessage);
				console.error("Component rendering failed:", err);
				return null;
			} finally {
				setIsRendering(false);
			}
		},
		[],
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const clearComponents = useCallback(() => {
		setRenderedComponents([]);
	}, []);

	return {
		isGenerating,
		isRendering,
		error,
		renderedComponents,
		generateAndRenderComponent,
		renderExistingComponent,
		clearError,
		clearComponents,
	};
};
