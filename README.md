# AI Studio

A modern web application showcasing AI-powered tools, built with Next.js, OpenAI, and Tailwind CSS.

## Features

-   **AI Image Editor**: Upload images and let AI enhance them with beautiful styling
-   Modern, responsive UI with drag-and-drop functionality
-   Real-time image processing using OpenAI's image editing API
-   Beautiful gradient designs and smooth animations

## Getting Started

### Prerequisites

-   Node.js 18+
-   OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd ai-studio
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

4. Get your OpenAI API key:
    - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
    - Create a new API key
    - Copy it to your `.env` file

### Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Navigate to the AI Image Editor to start editing images

### Running Tests

#### Unit Tests

Run Jest unit tests with:

```bash
npm test
```

#### End-to-End Tests

Run Cypress end-to-end tests:

1. Start the development server in one terminal:

```bash
npm run dev
```

2. Open Cypress in another terminal:

```bash
npm run cypress:open
```

3. In the Cypress UI, click on "E2E Testing", choose a browser, and select the `image-edit-flow.cy.js` test to run.

## Usage

### AI Image Editor

1. **Upload Image**: Drag and drop an image or click to browse files
2. **Process**: Click "Enhance Image with AI" to start processing
3. **Download**: Once complete, download your enhanced image

The AI will enhance your image with:

-   Improved styling and aesthetics
-   Better color balance
-   Enhanced visual appeal
-   Professional-looking results

## API Endpoints

-   `POST /api/image-edit`: Processes image editing requests using OpenAI's API

## Technologies Used

-   **Frontend**: Next.js 15, React 19, TypeScript
-   **Styling**: Tailwind CSS 4
-   **AI Integration**: OpenAI API
-   **UI Components**: Custom components with modern design patterns

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── image-edit/
│   │       └── route.ts          # Image editing API
│   ├── image-edit/
│   │   └── page.tsx              # Image editor page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   └── ui/                       # Reusable UI components
└── lib/
    └── utils.ts                  # Utility functions
```

## Environment Variables

| Variable         | Description                              | Required |
| ---------------- | ---------------------------------------- | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key for image processing | Yes      |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
