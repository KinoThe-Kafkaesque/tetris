import React from "react";
import { RefreshCw, Copy, Palette, Layout, Image } from "lucide-react";
import type {
	Asset,
	CopyAsset,
	ImageAsset,
	ColorPalette,
	LayoutAsset,
} from "../types/design";

interface AssetPreviewProps {
	asset: Asset;
	onRegenerate: (assetId: string) => void;
	isRegenerating?: boolean;
}

const CopyPreview: React.FC<{ content: CopyAsset }> = ({ content }) => (
	<div className="space-y-4">
		<div>
			<h3 className="text-2xl font-bold text-gray-900">{content.headline}</h3>
			<p className="text-lg text-gray-600 mt-2">{content.subline}</p>
		</div>
		<div className="flex items-center gap-4 text-sm text-gray-500">
			<span>Tone: {content.tone}</span>
			{content.cta && <span>CTA: {content.cta}</span>}
		</div>
	</div>
);

const ImagePreview: React.FC<{ content: ImageAsset }> = ({ content }) => (
	<div className="space-y-4">
		<img
			src={content.url}
			alt={content.alt}
			className="w-full h-48 object-cover rounded-lg border"
		/>
		<div className="text-sm text-gray-500">
			<p>Style: {content.style}</p>
			<p>
				Dimensions: {content.dimensions.width} × {content.dimensions.height}
			</p>
		</div>
	</div>
);

const PalettePreview: React.FC<{ content: ColorPalette }> = ({ content }) => (
	<div className="space-y-4">
		<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
			{content.colors.map((color, index) => (
				<div key={index} className="space-y-2">
					<div
						className="w-full h-16 rounded-lg border shadow-sm"
						style={{ backgroundColor: color.hex }}
					/>
					<div className="text-sm">
						<p className="font-medium">{color.name}</p>
						<p className="text-gray-500 text-xs">{color.hex}</p>
						<p className="text-gray-600 text-xs">{color.usage}</p>
					</div>
				</div>
			))}
		</div>
		{content.contrastRatio && (
			<p className="text-sm text-gray-500">
				Contrast Ratio: {content.contrastRatio}
			</p>
		)}
	</div>
);

const LayoutPreview: React.FC<{ content: LayoutAsset }> = ({ content }) => (
	<div className="space-y-4">
		<div className="bg-gray-50 p-4 rounded-lg">
			<h4 className="font-medium mb-2">Grid Areas</h4>
			<div className="flex flex-wrap gap-2">
				{content.gridAreas.map((area, index) => (
					<span
						key={index}
						className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
					>
						{area}
					</span>
				))}
			</div>
		</div>

		<div className="bg-gray-50 p-4 rounded-lg">
			<h4 className="font-medium mb-2">Breakpoints</h4>
			<div className="space-y-2 text-sm">
				{Object.entries(content.breakpoints).map(([bp, value]) => (
					<div key={bp} className="flex justify-between">
						<span className="font-medium">{bp}:</span>
						<span className="text-gray-600 font-mono text-xs">{value}</span>
					</div>
				))}
			</div>
		</div>

		<div className="bg-gray-50 p-4 rounded-lg">
			<h4 className="font-medium mb-2">CSS Properties</h4>
			<div className="space-y-1 text-sm font-mono">
				{Object.entries(content.cssProperties).map(([prop, value]) => (
					<div key={prop} className="text-gray-600 text-xs">
						{prop}: {value};
					</div>
				))}
			</div>
		</div>
	</div>
);

const getAssetIcon = (type: Asset["type"]) => {
	const iconProps = { size: 20, className: "text-gray-500" };

	switch (type) {
		case "copy":
			return <Copy {...iconProps} />;
		case "image":
			return <Image {...iconProps} />;
		case "palette":
			return <Palette {...iconProps} />;
		case "layout":
			return <Layout {...iconProps} />;
		default:
			return <Copy {...iconProps} />;
	}
};

const getAssetTitle = (type: Asset["type"]) => {
	switch (type) {
		case "copy":
			return "Copy";
		case "image":
			return "Image";
		case "palette":
			return "Color Palette";
		case "layout":
			return "Layout";
		default:
			return "Asset";
	}
};

export const AssetPreview: React.FC<AssetPreviewProps> = ({
	asset,
	onRegenerate,
	isRegenerating = false,
}) => {
	const renderContent = () => {
		switch (asset.type) {
			case "copy":
				return <CopyPreview content={asset.content as CopyAsset} />;
			case "image":
				return <ImagePreview content={asset.content as ImageAsset} />;
			case "palette":
				return <PalettePreview content={asset.content as ColorPalette} />;
			case "layout":
				return <LayoutPreview content={asset.content as LayoutAsset} />;
			default:
				return <div>Unsupported asset type</div>;
		}
	};

	return (
		<div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{getAssetIcon(asset.type)}
					<h3 className="font-semibold text-gray-900">
						{getAssetTitle(asset.type)}
					</h3>
				</div>
				<button
					onClick={() => onRegenerate(asset.id)}
					disabled={isRegenerating}
					className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<RefreshCw
						size={16}
						className={isRegenerating ? "animate-spin" : ""}
					/>
					Regenerate
				</button>
			</div>

			{renderContent()}

			<div className="text-xs text-gray-400 mt-4 pt-4 border-t">
				Generated: {asset.createdAt.toLocaleString()}
			</div>
		</div>
	);
};
