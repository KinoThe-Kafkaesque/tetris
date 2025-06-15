import OpenAI from "openai";
import type {
	GenerationResult,
	CopyAsset,
	ImageAsset,
	ColorPalette,
	LayoutAsset,
	GenerationConfig,
	StyleProfile,
	ComponentAsset,
	AssetType,
	Asset,
} from "../types/design";

export class AIService {
	private openai: OpenAI | null = null;

	constructor(apiKey?: string) {
		if (apiKey) {
			this.openai = new OpenAI({
				apiKey,
				dangerouslyAllowBrowser: true,
			});
		}
	}

	private isConfigured(): boolean {
		return this.openai !== null;
	}

	async generateCopy(
		brief: string,
		config: GenerationConfig = {
			temperature: 0.7,
			maxTokens: 3000,
			model: "gpt-4.1",
		},
		styleProfile?: StyleProfile,
	): Promise<GenerationResult<CopyAsset>> {
		if (!this.isConfigured() || !this.openai) {
			return {
				success: false,
				error: "OpenAI API key not configured",
			};
		}

		try {
			const prompt = `Create compelling copy for: ${brief}
			
			${
				styleProfile
					? `
			Brand Context:
			- Colors: ${styleProfile.colors.join(", ")}
			- Tone: ${styleProfile.tone}
			- Guidelines: ${styleProfile.brandGuidelines}
			`
					: ""
			}
			
			Return ONLY valid JSON in this exact format:
			{
				"headline": "string",
				"subline": "string",
				"tone": "string",
				"cta": "string"
			}`;

			const response = await this.openai.chat.completions.create({
				model: config.model,
				messages: [{ role: "user", content: prompt }],
				temperature: config.temperature,
				max_tokens: config.maxTokens,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error("No content generated");
			}

			const parsedContent = JSON.parse(content) as CopyAsset;

			return {
				success: true,
				data: parsedContent,
				metadata: {
					tokensUsed: response.usage?.total_tokens || 0,
					model: config.model,
					temperature: config.temperature,
					prompt,
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	async generatePalette(
		brief: string,
		config: GenerationConfig = {
			temperature: 0.35,
			maxTokens: 400,
			model: "gpt-4o-mini",
		},
		styleProfile?: StyleProfile,
	): Promise<GenerationResult<ColorPalette>> {
		if (!this.isConfigured() || !this.openai) {
			return {
				success: false,
				error: "OpenAI API key not configured",
			};
		}

		try {
			const prompt = `Create a color palette for: ${brief}
			
			Generate 5-7 cohesive colors with proper usage notes.
			
			Return ONLY valid JSON in this exact format:
			{
				"colors": [
					{
						"hex": "#000000",
						"name": "string",
						"usage": "string"
					}
				],
				"contrastRatio": 4.5
			}`;

			const response = await this.openai.chat.completions.create({
				model: config.model,
				messages: [{ role: "user", content: prompt }],
				temperature: config.temperature,
				max_tokens: config.maxTokens,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error("No content generated");
			}

			const parsedContent = JSON.parse(content) as ColorPalette;

			return {
				success: true,
				data: parsedContent,
				metadata: {
					tokensUsed: response.usage?.total_tokens || 0,
					model: config.model,
					temperature: config.temperature,
					prompt,
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	async generateLayout(
		brief: string,
		config: GenerationConfig = {
			temperature: 0.35,
			maxTokens: 400,
			model: "gpt-4o-mini",
		},
		styleProfile?: StyleProfile,
	): Promise<GenerationResult<LayoutAsset>> {
		if (!this.isConfigured() || !this.openai) {
			return {
				success: false,
				error: "OpenAI API key not configured",
			};
		}

		try {
			const prompt = `Create a responsive layout for: ${brief}
			
			Generate CSS Grid structure with breakpoints.
			
			Return ONLY valid JSON in this exact format:
			{
				"gridAreas": ["header", "main", "sidebar", "footer"],
				"breakpoints": {
					"mobile": "grid-template-columns: 1fr",
					"tablet": "grid-template-columns: 1fr 300px",
					"desktop": "grid-template-columns: 1fr 300px"
				},
				"cssProperties": {
					"gap": "1rem",
					"padding": "1rem"
				}
			}`;

			const response = await this.openai.chat.completions.create({
				model: config.model,
				messages: [{ role: "user", content: prompt }],
				temperature: config.temperature,
				max_tokens: config.maxTokens,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error("No content generated");
			}

			const parsedContent = JSON.parse(content) as LayoutAsset;

			return {
				success: true,
				data: parsedContent,
				metadata: {
					tokensUsed: response.usage?.total_tokens || 0,
					model: config.model,
					temperature: config.temperature,
					prompt,
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	async generateImage(
		brief: string,
		styleProfile?: StyleProfile,
	): Promise<GenerationResult<ImageAsset>> {
		if (!this.isConfigured() || !this.openai) {
			return {
				success: false,
				error: "OpenAI API key not configured",
			};
		}

		try {
			let prompt = brief;

			if (styleProfile) {
				prompt += ` Style: ${styleProfile.tone}. Color palette: ${styleProfile.colors.join(", ")}.`;
			}

			prompt += " High quality, professional, clean background.";

			const response = await this.openai.images.generate({
				model: "dall-e-3",
				prompt,
				size: "1024x1024",
				quality: "standard",
				n: 1,
			});

			const imageUrl = response.data?.[0]?.url;
			if (!imageUrl) {
				throw new Error("No image URL generated");
			}

			const imageAsset: ImageAsset = {
				url: imageUrl,
				alt: brief,
				style: styleProfile?.tone || "professional",
				dimensions: {
					width: 1024,
					height: 1024,
				},
			};

			return {
				success: true,
				data: imageAsset,
				metadata: {
					tokensUsed: 0, // Image generation doesn't use tokens
					model: "dall-e-3",
					temperature: 0,
					prompt,
				},
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	private async generateComponent(prompt: string): Promise<ComponentAsset> {
		const systemPrompt = `You are an expert web developer and designer. Generate a complete, self-contained web component based on the user's request.

Rules:
1. Return valid JSON with html, css, javascript (optional), framework, description, width, height
2. HTML should be semantic and accessible
3. CSS should be modern, responsive, and include all necessary styles
4. Use modern CSS features (flexbox, grid, custom properties)
5. JavaScript should be vanilla JS (no external dependencies)
6. Component should work standalone
7. Use appropriate semantic HTML tags
8. Include hover states and micro-interactions where appropriate
9. Ensure good contrast and readability
10. Width and height should be reasonable defaults in pixels

Example response:
{
  "html": "<div class='card'>...</div>",
  "css": ".card { background: white; border-radius: 8px; }",
  "javascript": "// Optional interactive code",
  "framework": "vanilla",
  "description": "Modern card component with hover effects",
  "width": 300,
  "height": 200
}`;

		try {
			const completion = await this.openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: prompt },
				],
				temperature: 0.7,
				max_tokens: 2000,
			});

			const response = completion.choices[0]?.message?.content;
			if (!response) {
				throw new Error("No response from OpenAI");
			}

			const componentData = JSON.parse(response) as ComponentAsset;

			// Validate required fields
			if (
				!componentData.html ||
				!componentData.css ||
				!componentData.description
			) {
				throw new Error("Invalid component data structure");
			}

			// Set defaults if not provided
			componentData.width = componentData.width || 300;
			componentData.height = componentData.height || 200;
			componentData.framework = componentData.framework || "vanilla";

			return componentData;
		} catch (error) {
			console.error("Component generation error:", error);
			throw new Error(
				`Failed to generate component: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async generateAsset(type: AssetType, prompt: string): Promise<Asset> {
		const startTime = Date.now();

		try {
			let content:
				| CopyAsset
				| ImageAsset
				| ColorPalette
				| LayoutAsset
				| ComponentAsset;
			let model: string;
			let temperature: number;

			switch (type) {
				case "copy":
					const copyResult = await this.generateCopy(prompt);
					content = copyResult.data;
					model = "gpt-4o";
					temperature = 0.7;
					break;
				case "image":
					const imageResult = await this.generateImage(prompt);
					content = imageResult.data;
					model = "dall-e-3";
					temperature = 0;
					break;
				case "palette":
					const paletteResult = await this.generatePalette(prompt);
					content = paletteResult.data;
					model = "gpt-4o";
					temperature = 0.3;
					break;
				case "layout":
					const layoutResult = await this.generateLayout(prompt);
					content = layoutResult.data;
					model = "gpt-4o";
					temperature = 0.5;
					break;
				case "component":
					content = await this.generateComponent(prompt);
					model = "gpt-4o";
					temperature = 0.7;
					break;
				default:
					throw new Error(`Unsupported asset type: ${type}`);
			}

			const endTime = Date.now();
			const duration = endTime - startTime;

			return {
				id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				type,
				content,
				metadata: {
					prompt,
					model,
					temperature,
					createdAt: new Date(),
					cost: this.estimateCost(type, duration),
				},
				createdAt: new Date(),
				designId: "",
			};
		} catch (error) {
			console.error(`Error generating ${type} asset:`, error);
			throw error;
		}
	}

	private estimateCost(type: AssetType, duration: number): number {
		// Rough cost estimation based on asset type and generation time
		const baseCosts = {
			copy: 0.002,
			image: 0.04,
			palette: 0.001,
			layout: 0.003,
			component: 0.005,
		};

		return baseCosts[type] * (duration / 1000);
	}
}
