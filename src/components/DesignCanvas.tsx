import React, { useState, useRef, useCallback } from "react";
import {
	Stage,
	Layer,
	Rect,
	Text,
	Image as KonvaImage,
} from "react-konva";
import {
	Upload,
	Download,
	Move,
	Type,
	Palette,
	Image as ImageIcon,
	Trash2,
	Camera,
	Key,
	Sparkles,
	Code,
} from "lucide-react";
import type {
	Asset,
	CopyAsset,
	ColorPalette,
	ImageAsset,
	ComponentAsset,
} from "../types/design";
import { useComponentGeneration } from "../hooks/useComponentGeneration";
import useImage from "use-image";

interface CanvasElement {
	id: string;
	type: "text" | "image" | "rectangle" | "asset" | "component";
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	data: any;
	selected: boolean;
}

interface DesignCanvasProps {
	assets: Asset[];
	onGenerateAsset: (
		type: "copy" | "image" | "palette" | "component",
		prompt: string,
	) => void;
	onImageUpload: (file: File) => void;
	onRegenerateAsset?: (assetId: string, newPrompt?: string) => void;
	isGenerating: boolean;
	apiKey?: string;
	onApiKeyChange?: (key: string) => void;
}

const CanvasAsset: React.FC<{
	element: CanvasElement;
	onUpdate: (element: CanvasElement) => void;
}> = ({ element, onUpdate }) => {
	const [image] = useImage(element.type === "image" ? element.data.url : "");

	const handleDragEnd = (e: any) => {
		onUpdate({
			...element,
			x: e.target.x(),
			y: e.target.y(),
		});
	};

	const handleTransformEnd = (e: any) => {
		const node = e.target;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();

		onUpdate({
			...element,
			x: node.x(),
			y: node.y(),
			width: Math.max(5, node.width() * scaleX),
			height: Math.max(5, node.height() * scaleY),
			rotation: node.rotation(),
		});

		node.scaleX(1);
		node.scaleY(1);
	};

	if (element.type === "text") {
		return (
			<Text
				x={element.x}
				y={element.y}
				width={element.width}
				height={element.height}
				text={element.data.text}
				fontSize={element.data.fontSize || 16}
				fill={element.data.color || "#000000"}
				fontFamily={element.data.fontFamily || "Arial"}
				rotation={element.rotation}
				draggable
				onDragEnd={handleDragEnd}
				onTransformEnd={handleTransformEnd}
			/>
		);
	}

	if (element.type === "image" && image) {
		return (
			<KonvaImage
				x={element.x}
				y={element.y}
				width={element.width}
				height={element.height}
				image={image}
				rotation={element.rotation}
				draggable
				onDragEnd={handleDragEnd}
				onTransformEnd={handleTransformEnd}
			/>
		);
	}

	if (element.type === "rectangle") {
		return (
			<Rect
				x={element.x}
				y={element.y}
				width={element.width}
				height={element.height}
				fill={element.data.color || "#3b82f6"}
				rotation={element.rotation}
				draggable
				onDragEnd={handleDragEnd}
				onTransformEnd={handleTransformEnd}
			/>
		);
	}

	return null;
};

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
	assets,
	onGenerateAsset,
	onImageUpload,
	onRegenerateAsset,
	isGenerating,
	apiKey = "",
	onApiKeyChange,
}) => {
	const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
	const [selectedElement, setSelectedElement] = useState<string | null>(null);
	const [tool, setTool] = useState<"select" | "text" | "rectangle">("select");
	const [prompt, setPrompt] = useState("");
	const [componentPrompt, setComponentPrompt] = useState("");
	const [showApiKeySection, setShowApiKeySection] = useState(!apiKey);
	const [showApiKey, setShowApiKey] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const stageRef = useRef<any>(null);

	// Component generation hook
	const {
		isGenerating: isGeneratingComponent,
		isRendering: isRenderingComponent,
		error: componentError,
		renderedComponents,
		generateAndRenderComponent,
		renderExistingComponent,
		clearError: clearComponentError,
	} = useComponentGeneration();

	const addElement = useCallback((newElement: Omit<CanvasElement, "id">) => {
		const element: CanvasElement = {
			...newElement,
			id: Date.now().toString(),
		};
		setCanvasElements((prev) => [...prev, element]);
	}, []);

	const updateElement = useCallback((updatedElement: CanvasElement) => {
		setCanvasElements((prev) =>
			prev.map((element) =>
				element.id === updatedElement.id ? updatedElement : element,
			),
		);
	}, []);

	const deleteElement = useCallback((elementId: string) => {
		setCanvasElements((prev) =>
			prev.filter((element) => element.id !== elementId),
		);
		setSelectedElement(null);
	}, []);

	const handleStageClick = (e: any) => {
		const clickedOnEmpty = e.target === e.target.getStage();

		if (clickedOnEmpty) {
			setSelectedElement(null);

			if (tool === "text") {
				const pos = e.target.getStage().getPointerPosition();
				addElement({
					type: "text",
					x: pos.x,
					y: pos.y,
					width: 200,
					height: 50,
					rotation: 0,
					data: {
						text: "Double click to edit",
						fontSize: 16,
						color: "#000000",
					},
					selected: false,
				});
			} else if (tool === "rectangle") {
				const pos = e.target.getStage().getPointerPosition();
				addElement({
					type: "rectangle",
					x: pos.x,
					y: pos.y,
					width: 100,
					height: 100,
					rotation: 0,
					data: { color: "#3b82f6" },
					selected: false,
				});
			}
		}
	};

	const handleAssetDrop = (asset: Asset) => {
		if (asset.type === "copy") {
			const copyContent = asset.content as CopyAsset;
			addElement({
				type: "text",
				x: 100,
				y: 100,
				width: 300,
				height: 100,
				rotation: 0,
				data: {
					text: copyContent.headline,
					fontSize: 24,
					color: "#000000",
					fontFamily: "Arial",
				},
				selected: false,
			});
		} else if (asset.type === "image") {
			const imageContent = asset.content as ImageAsset;
			addElement({
				type: "image",
				x: 100,
				y: 200,
				width: 200,
				height: 200,
				rotation: 0,
				data: { url: imageContent.url },
				selected: false,
			});
		} else if (asset.type === "palette") {
			const paletteContent = asset.content as ColorPalette;
			paletteContent.colors.forEach((color, index) => {
				addElement({
					type: "rectangle",
					x: 50 + index * 60,
					y: 400,
					width: 50,
					height: 50,
					rotation: 0,
					data: { color: color.hex },
					selected: false,
				});
			});
		} else if (asset.type === "component") {
			// Render component and add as image to canvas
			const componentContent = asset.content as ComponentAsset;
			renderExistingComponent(componentContent).then((rendered) => {
				if (rendered) {
					addElement({
						type: "image",
						x: 100,
						y: 100,
						width: rendered.width,
						height: rendered.height,
						rotation: 0,
						data: { url: rendered.imageUrl },
						selected: false,
					});
				}
			});
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onImageUpload(file);

			// Add the image to canvas
			const reader = new FileReader();
			reader.onload = (event) => {
				const imageUrl = event.target?.result as string;
				addElement({
					type: "image",
					x: 100,
					y: 100,
					width: 300,
					height: 200,
					rotation: 0,
					data: { url: imageUrl },
					selected: false,
				});
			};
			reader.readAsDataURL(file);
		}
	};

	const exportCanvas = () => {
		if (stageRef.current) {
			const uri = stageRef.current.toDataURL();
			const link = document.createElement("a");
			link.download = "design.png";
			link.href = uri;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const handleCameraCapture = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				const video = document.createElement("video");
				video.srcObject = stream;
				video.play();

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				video.addEventListener("loadedmetadata", () => {
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;

					setTimeout(() => {
						ctx?.drawImage(video, 0, 0);
						const imageData = canvas.toDataURL("image/png");

						// Stop the stream
						stream.getTracks().forEach((track) => track.stop());

						// Add captured image to canvas
						addElement({
							type: "image",
							x: 100,
							y: 100,
							width: 300,
							height: 200,
							rotation: 0,
							data: { url: imageData },
							selected: false,
						});
					}, 1000);
				});
			})
			.catch((err) => {
				console.error("Error accessing camera:", err);
				alert("Could not access camera. Please check permissions.");
			});
	};

	const handleGenerateWebComponent = async () => {
		if (!componentPrompt.trim() || !apiKey) return;

		clearComponentError();
		const rendered = await generateAndRenderComponent(componentPrompt, apiKey);

		if (rendered) {
			// Add rendered component to canvas
			addElement({
				type: "image",
				x: 100,
				y: 100,
				width: rendered.width,
				height: rendered.height,
				rotation: 0,
				data: { url: rendered.imageUrl },
				selected: false,
			});

			setComponentPrompt("");
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border overflow-hidden">
			{/* API Key Section (if needed) */}
			{showApiKeySection && onApiKeyChange && (
				<div className="border-b bg-blue-50 p-4">
					<div className="flex items-center gap-2 mb-2">
						<Key size={16} className="text-blue-600" />
						<span className="text-sm font-medium text-blue-800">
							OpenAI API Key Required
						</span>
						<button
							type="button"
							onClick={() => setShowApiKey(!showApiKey)}
							className="text-xs text-blue-600 hover:text-blue-800"
						>
							{showApiKey ? "Hide" : "Show"}
						</button>
					</div>
					<div className="flex gap-2">
						<input
							type={showApiKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => onApiKeyChange(e.target.value)}
							placeholder="sk-..."
							className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="button"
							onClick={() => setShowApiKeySection(false)}
							className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
						>
							Continue
						</button>
					</div>
				</div>
			)}

			{/* Component Error */}
			{componentError && (
				<div className="border-b bg-red-50 p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-red-600">{componentError}</span>
						<button
							type="button"
							onClick={clearComponentError}
							className="text-red-600 hover:text-red-800"
						>
							×
						</button>
					</div>
				</div>
			)}

			{/* Toolbar */}
			<div className="border-b bg-gray-50 p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">Design Canvas</h3>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={exportCanvas}
							className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
						>
							<Download size={16} />
							Export
						</button>
					</div>
				</div>

				{/* Tools */}
				<div className="flex items-center gap-2 mb-4">
					<button
						type="button"
						onClick={() => setTool("select")}
						className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
							tool === "select"
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						<Move size={16} />
						Select
					</button>
					<button
						type="button"
						onClick={() => setTool("text")}
						className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
							tool === "text"
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						<Type size={16} />
						Text
					</button>
					<button
						type="button"
						onClick={() => setTool("rectangle")}
						className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
							tool === "rectangle"
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						<Rect />
						Shape
					</button>

					<div className="h-6 w-px bg-gray-300 mx-2" />

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileUpload}
						className="hidden"
					/>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
					>
						<Upload size={16} />
						Upload
					</button>

					<button
						type="button"
						onClick={handleCameraCapture}
						className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
					>
						<Camera size={16} />
						Capture
					</button>

					{selectedElement && (
						<button
							type="button"
							onClick={() => selectedElement && deleteElement(selectedElement)}
							className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							<Trash2 size={16} />
							Delete
						</button>
					)}
				</div>

				{/* AI Asset Generation */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Generate basic assets... e.g., 'modern tech startup logo'"
							className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="button"
							onClick={() => onGenerateAsset("copy", prompt)}
							disabled={!prompt.trim() || isGenerating || !apiKey}
							className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
						>
							<Type size={16} />
							Copy
						</button>
						<button
							type="button"
							onClick={() => onGenerateAsset("image", prompt)}
							disabled={!prompt.trim() || isGenerating || !apiKey}
							className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
						>
							<ImageIcon size={16} />
							Image
						</button>
						<button
							type="button"
							onClick={() => onGenerateAsset("palette", prompt)}
							disabled={!prompt.trim() || isGenerating || !apiKey}
							className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
						>
							<Palette size={16} />
							Palette
						</button>
					</div>

					{/* Web Component Generation */}
					<div className="flex items-center gap-2 pt-2 border-t border-gray-200">
						<input
							type="text"
							value={componentPrompt}
							onChange={(e) => setComponentPrompt(e.target.value)}
							placeholder="Generate web component... e.g., 'modern pricing card with hover effects'"
							className="flex-1 px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						<button
							type="button"
							onClick={handleGenerateWebComponent}
							disabled={
								!componentPrompt.trim() ||
								isGeneratingComponent ||
								isRenderingComponent ||
								!apiKey
							}
							className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
						>
							<Code size={16} />
							{isGeneratingComponent
								? "Generating..."
								: isRenderingComponent
									? "Rendering..."
									: "Web Component"}
						</button>
					</div>
				</div>
			</div>

			<div className="flex">
				{/* Assets Panel */}
				<div className="w-64 border-r bg-gray-50 p-4 max-h-96 overflow-y-auto">
					<h4 className="font-medium text-gray-900 mb-3">Generated Assets</h4>
					<div className="space-y-2">
						{assets.map((asset) => (
							<div
								key={asset.id}
								className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
								onClick={() => handleAssetDrop(asset)}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{asset.type === "copy" && (
											<Type size={16} className="text-blue-600" />
										)}
										{asset.type === "image" && (
											<ImageIcon size={16} className="text-purple-600" />
										)}
										{asset.type === "palette" && (
											<Palette size={16} className="text-green-600" />
										)}
										{asset.type === "component" && (
											<Code size={16} className="text-orange-600" />
										)}
										<span className="text-sm font-medium capitalize">
											{asset.type}
										</span>
									</div>
									{onRegenerateAsset && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onRegenerateAsset(asset.id);
											}}
											className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
										>
											<Sparkles size={12} />
										</button>
									)}
								</div>
								<p className="text-xs text-gray-500 mt-1">
									Click to add to canvas
								</p>
							</div>
						))}

						{/* Rendered Components */}
						{renderedComponents.length > 0 && (
							<div className="pt-3 border-t border-gray-200">
								<h5 className="text-sm font-medium text-gray-700 mb-2">
									Rendered Components
								</h5>
								{renderedComponents.map((rendered, index) => (
									<div
										key={index}
										className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
										onClick={() => {
											addElement({
												type: "image",
												x: 100 + index * 20,
												y: 100 + index * 20,
												width: rendered.width,
												height: rendered.height,
												rotation: 0,
												data: { url: rendered.imageUrl },
												selected: false,
											});
										}}
									>
										<div className="flex items-center gap-2">
											<Code size={16} className="text-orange-600" />
											<span className="text-sm font-medium">Component</span>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											{rendered.component.description}
										</p>
									</div>
								))}
							</div>
						)}

						{assets.length === 0 && renderedComponents.length === 0 && (
							<p className="text-sm text-gray-500 text-center py-4">
								No assets yet. Generate some above!
							</p>
						)}
					</div>
				</div>

				{/* Canvas */}
				<div className="flex-1 bg-white">
					<Stage
						ref={stageRef}
						width={800}
						height={600}
						onClick={handleStageClick}
						className="border-2 border-dashed border-gray-200"
					>
						<Layer>
							{canvasElements.map((element) => (
								<CanvasAsset
									key={element.id}
									element={element}
									onUpdate={updateElement}
								/>
							))}
						</Layer>
					</Stage>
				</div>
			</div>
		</div>
	);
};
