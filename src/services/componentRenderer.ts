import html2canvas from "html2canvas";
import type { ComponentAsset } from "../types/design";

export interface RenderedComponent {
	imageUrl: string;
	width: number;
	height: number;
	component: ComponentAsset;
}

export class ComponentRenderer {
	private renderContainer: HTMLDivElement | null = null;

	constructor() {
		this.setupRenderContainer();
	}

	private setupRenderContainer(): void {
		// Create a hidden container for rendering components
		this.renderContainer = document.createElement("div");
		this.renderContainer.id = "component-render-container";
		this.renderContainer.style.cssText = `
      position: fixed; /* Keep it out of normal flow */
      top: 0; /* Place at top-left corner */
      left: 0;
      /* Positioned off-screen to avoid visual impact but still renderable */
      transform: translate(-9999px, -9999px);
      pointer-events: none;
      z-index: -1;
      background: white;
      box-sizing: border-box;
    `;
		document.body.appendChild(this.renderContainer);
	}

	async renderComponent(component: ComponentAsset): Promise<RenderedComponent> {
		if (!this.renderContainer) {
			throw new Error("Render container not initialized");
		}

		try {
			// Create a wrapper for the component
			const wrapper = document.createElement("div");
			wrapper.style.cssText = `
        width: ${component.width}px;
        height: ${component.height}px;
        padding: 16px;
        box-sizing: border-box;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      `;

			// Add the component's CSS
			const styleElement = document.createElement("style");
			styleElement.textContent = component.css;
			wrapper.appendChild(styleElement);

			// Add the component's HTML
			const contentDiv = document.createElement("div");
			contentDiv.innerHTML = component.html;
			wrapper.appendChild(contentDiv);

			// Add to render container
			this.renderContainer.appendChild(wrapper);

			// Execute JavaScript if present
			if (component.javascript) {
				try {
					// Create a scoped function to avoid global pollution
					const scriptFunction = new Function("element", component.javascript);
					scriptFunction(contentDiv);
				} catch (jsError) {
					console.warn("Component JavaScript execution failed:", jsError);
				}
			}

			// Wait a moment for any CSS animations or dynamic content to settle
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Render to canvas
			const canvas = await html2canvas(wrapper, {
				width: component.width,
				height: component.height,
				background: "#ffffff",
				useCORS: true,
				allowTaint: true,
				logging: false,
			});

			// Convert to image URL
			const imageUrl = canvas.toDataURL("image/png", 1.0);
			console.log("imageUrl", imageUrl);
			// Cleanup
			this.renderContainer.removeChild(wrapper);

			return {
				imageUrl,
				width: component.width,
				height: component.height,
				component,
			};
		} catch (error) {
			console.error("Component rendering failed:", error);
			throw new Error(
				`Failed to render component: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async renderMultipleComponents(
		components: ComponentAsset[],
	): Promise<RenderedComponent[]> {
		const rendered: RenderedComponent[] = [];

		for (const component of components) {
			try {
				const result = await this.renderComponent(component);
				rendered.push(result);
			} catch (error) {
				console.error(
					`Failed to render component ${component.description}:`,
					error,
				);
			}
		}

		return rendered;
	}

	destroy(): void {
		if (this.renderContainer?.parentNode) {
			this.renderContainer.parentNode.removeChild(this.renderContainer);
			this.renderContainer = null;
		}
	}
}

// Singleton instance
export const componentRenderer = new ComponentRenderer();

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
	componentRenderer.destroy();
});
