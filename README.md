# Generative Design Tool

A powerful client-side generative design application that combines AI-powered
asset generation with an interactive canvas for creating stunning visual
designs.

## Features

### 🎨 AI-Powered Asset Generation

- **Copy Generation**: Create compelling headlines and marketing copy
- **Image Generation**: Generate custom images from text descriptions
- **Color Palettes**: Generate harmonious color schemes
- **Web Components**: Create interactive UI components with HTML, CSS, and
  JavaScript

### 🖼️ Interactive Design Canvas

- **Drag & Drop**: Seamlessly add generated assets to your canvas
- **Visual Editing**: Move, resize, and rotate elements with intuitive controls
- **Multi-tool Support**: Text tool, shape tool, and selection tool
- **Image Upload**: Add your own images via file upload or camera capture
- **Export**: Save your designs as PNG images

### 🧩 Component Rendering

- **Live Preview**: See generated web components rendered in real-time
- **Canvas Integration**: Add rendered components as images to your design
- **Interactive Elements**: Components support CSS animations and JavaScript
  interactions

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js (React Konva)
- **AI Integration**: OpenAI API
- **Component Rendering**: html2canvas
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tetris
```

2. Install dependencies:

```bash
# Using npm
npm install

# Using bun
bun install
```

3. Start the development server:

```bash
# Using npm
npm run dev

# Using bun
bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Configuration

1. When you first open the application, you'll be prompted to enter your OpenAI
   API key
2. The API key is stored locally in your browser and never sent to any server
   except OpenAI
3. You can show/hide the API key and update it at any time

## Usage

### Generating Assets

1. **Basic Assets**: Enter a prompt in the main input field and click:
   - **Copy**: Generate marketing copy and headlines
   - **Image**: Create custom images
   - **Palette**: Generate color schemes

2. **Web Components**: Use the component input field to generate interactive UI
   elements:
   - Example: "modern pricing card with hover effects"
   - Example: "animated button with gradient background"

### Using the Canvas

1. **Adding Elements**:
   - Click on generated assets in the sidebar to add them to the canvas
   - Use the Text tool to add custom text
   - Use the Shape tool to add rectangles
   - Upload images or capture from camera

2. **Editing Elements**:
   - Select elements to move, resize, or rotate them
   - Use the Delete button to remove selected elements

3. **Exporting**:
   - Click the Export button to download your design as a PNG

## Project Structure

```
src/
├── components/          # React components
│   ├── DesignCanvas.tsx # Main canvas component
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useComponentGeneration.ts
│   ├── useDesignGeneration.ts
│   └── useImageAnalysis.ts
├── services/           # Business logic
│   ├── aiService.ts    # OpenAI integration
│   └── componentRenderer.ts # Component to image rendering
├── types/              # TypeScript type definitions
│   └── design.ts
└── assets/             # Static assets
```

## API Integration

The application integrates with OpenAI's API for:

- **GPT-4**: Text generation for copy and component code
- **DALL-E 3**: Image generation from text prompts

All API calls are made directly from the client, ensuring your data stays
private.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Architecture

The application follows functional programming patterns with:

- Pure functions for data transformations
- Immutable state management
- Composable React hooks
- Separation of concerns between UI and business logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the functional programming patterns
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Component Rendering Issues

If generated components don't render correctly:

1. Check the browser console for JavaScript errors
2. Ensure the component HTML/CSS is valid
3. Try regenerating the component with a simpler prompt

### API Key Issues

- Ensure your OpenAI API key is valid and has sufficient credits
- Check that the key has access to GPT-4 and DALL-E 3
- Refresh the page if you encounter authentication errors

### Performance

- Large images may take time to render
- Complex components with animations may affect performance
- Consider reducing canvas size for better performance on slower devices
