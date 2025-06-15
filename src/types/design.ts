export type AssetType = "copy" | "image" | "palette" | "layout" | "component";

export interface DesignBrief {
	id: string;
	brief: string;
	assets: AssetType[];
	styleProfileId?: string;
	createdAt: Date;
}

export interface Asset {
	id: string;
	type: AssetType;
	metadata: {
		prompt: string;
		model: string;
		temperature: number;
		createdAt: Date;
		cost?: number;
	};
	content: CopyAsset | ImageAsset | ColorPalette | LayoutAsset | ComponentAsset;
	createdAt: Date;
	designId: string;
}

export interface CopyAsset {
	headline: string;
	subline: string;
	tone: string;
	cta?: string;
}

export interface ImageAsset {
	url: string;
	alt: string;
	style: string;
	dimensions: {
		width: number;
		height: number;
	};
}

export interface ColorPalette {
	colors: Array<{
		hex: string;
		name: string;
		usage: string;
	}>;
	contrastRatio?: number;
}

export interface LayoutAsset {
	gridAreas: string[];
	breakpoints: Record<string, string>;
	cssProperties: Record<string, string>;
}

export interface StyleProfile {
	id: string;
	name: string;
	colors: string[];
	fonts: string[];
	tone: string;
	brandGuidelines: string;
}

export interface GenerationConfig {
	temperature: number;
	maxTokens: number;
	model: string;
}

export interface GenerationResult<
	T = CopyAsset | ImageAsset | ColorPalette | LayoutAsset,
> {
	success: boolean;
	data?: T;
	error?: string;
	metadata?: {
		tokensUsed: number;
		model: string;
		temperature: number;
		prompt: string;
	};
}

export interface ComponentAsset {
	html: string;
	css: string;
	javascript?: string;
	framework?: "vanilla" | "react" | "vue";
	description: string;
	width: number;
	height: number;
}
