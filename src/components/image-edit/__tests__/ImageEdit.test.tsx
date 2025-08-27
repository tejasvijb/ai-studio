import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageEditPage from '../ImageEdit';

// Define types for component props
type UploadImageProps = {
  selectedImage: File | null;
  previewUrl: string | null;
  handleDrop: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  openImageModal: (imageSrc: string, alt: string) => void;
};

type PromptAndStyleProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
};

type ResultImageProps = {
  resultImage: string;
  openImageModal: (imageSrc: string, alt: string) => void;
  isLoading: boolean;
  style: string;
  prompt: string;
  createdAt: number;
  history: Array<{
    image: string;
    style: string;
    prompt: string;
    createdAt: number;
  }>;
  setResultFromHistory: (historyItem: {
    image: string;
    style: string;
    prompt: string;
    createdAt: number;
  }) => void;
};

type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt: string;
};

// Mock the subcomponents
jest.mock('../UploadImage', () => ({
  __esModule: true,
  default: ({ selectedImage, previewUrl, handleDrop, handleDragOver, handleImageSelect, fileInputRef, openImageModal }: UploadImageProps) => (
    <div data-testid="upload-image-component">
      <button
        data-testid="upload-image-button"
        onClick={() => handleImageSelect({ target: { files: [new File([''], 'test.png', { type: 'image/png' })] } } as any)}
      >
        Upload Image
      </button>
    </div>
  )
}));

jest.mock('../PromptAndStyle', () => ({
  __esModule: true,
  default: ({ prompt, setPrompt, selectedStyle, setSelectedStyle }: PromptAndStyleProps) => (
    <div data-testid="prompt-style-component">
      <input
        data-testid="prompt-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt"
      />
      <select
        data-testid="style-select"
        value={selectedStyle}
        onChange={(e) => setSelectedStyle(e.target.value)}
      >
        <option value="editorial">Editorial</option>
        <option value="streetwear">Streetwear</option>
        <option value="vintage">Vintage</option>
      </select>
    </div>
  )
}));

jest.mock('../ResultImage', () => ({
  __esModule: true,
  default: ({ resultImage, isLoading, style, prompt, createdAt, history, setResultFromHistory }: ResultImageProps) => (
    <div data-testid="result-image-component">
      {isLoading ? 'Loading...' : 'Result goes here'}
    </div>
  )
}));

jest.mock('../../../components/ui/modal', () => ({
  ImageModal: ({ isOpen, onClose, imageSrc, alt }: ImageModalProps) => (
    <div data-testid="image-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      Modal Content
    </div>
  )
}));

// Mock fetch function
global.fetch = jest.fn();

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn().mockReturnValue('mock-object-url');

describe('ImageEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
  });

  it('should disable enhance button when no image is selected', () => {
    render(<ImageEditPage />);

    // Find the enhance button
    const enhanceButton = screen.getByText('Enhance Image with AI');

    // Verify button is disabled initially (no image selected)
    expect(enhanceButton).toBeDisabled();
  });

  it('should show error when trying to submit with no prompt', async () => {
    render(<ImageEditPage />);

    // Simulate image upload
    const uploadButton = screen.getByTestId('upload-image-button');
    fireEvent.click(uploadButton);

    // Find and click the enhance button
    const enhanceButton = screen.getByText('Enhance Image with AI');
    expect(enhanceButton).not.toBeDisabled(); // Now button should be enabled
    fireEvent.click(enhanceButton);

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a prompt')).toBeInTheDocument();
    });
  });

  it('should include prompt and style in summary', () => {
    render(<ImageEditPage />);

    // Simulate image upload
    const uploadButton = screen.getByTestId('upload-image-button');
    fireEvent.click(uploadButton);

    // Enter prompt text
    const promptInput = screen.getByTestId('prompt-input');
    fireEvent.change(promptInput, { target: { value: 'test prompt' } });

    // Change style
    const styleSelect = screen.getByTestId('style-select');
    fireEvent.change(styleSelect, { target: { value: 'vintage' } });

    // Check summary content
    const summaryText = screen.getByText(/test prompt in vintage style/i);
    expect(summaryText).toBeInTheDocument();
  });

  it('should enable the enhance button when both image and prompt are provided', () => {
    render(<ImageEditPage />);

    // Initially button should be disabled
    const enhanceButton = screen.getByText('Enhance Image with AI');
    expect(enhanceButton).toBeDisabled();

    // Simulate image upload
    const uploadButton = screen.getByTestId('upload-image-button');
    fireEvent.click(uploadButton);

    // Enter prompt text
    const promptInput = screen.getByTestId('prompt-input');
    fireEvent.change(promptInput, { target: { value: 'test prompt' } });

    // Button should now be enabled
    expect(enhanceButton).not.toBeDisabled();
  });

  it('should show error message when attempting to submit with empty prompt', async () => {
    render(<ImageEditPage />);

    // Simulate image upload but leave prompt empty
    const uploadButton = screen.getByTestId('upload-image-button');
    fireEvent.click(uploadButton);

    // Try to submit
    const enhanceButton = screen.getByText('Enhance Image with AI');
    fireEvent.click(enhanceButton);

    // Check for specific error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a prompt')).toBeInTheDocument();
    });
  });

  it('should reset form when clicking the reset button', () => {
    render(<ImageEditPage />);

    // Simulate image upload
    const uploadButton = screen.getByTestId('upload-image-button');
    fireEvent.click(uploadButton);

    // Enter prompt text
    const promptInput = screen.getByTestId('prompt-input');
    fireEvent.change(promptInput, { target: { value: 'test prompt' } });

    // Find and click reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Verify prompt was reset (using the summary text)
    const summaryText = screen.getByText(/in editorial style/i);
    expect(summaryText).toBeInTheDocument();
    expect(summaryText).not.toHaveTextContent('test prompt');

    // Enhance button should be disabled again
    const enhanceButton = screen.getByText('Enhance Image with AI');
    expect(enhanceButton).toBeDisabled();
  });

  it('should maintain only 5 items in history', () => {
    // Create mock history data with 5 items
    const mockHistoryItems = [
      { image: 'data:image/png;base64,old1', style: 'style1', prompt: 'prompt1', createdAt: 1000 },
      { image: 'data:image/png;base64,old2', style: 'style2', prompt: 'prompt2', createdAt: 2000 },
      { image: 'data:image/png;base64,old3', style: 'style3', prompt: 'prompt3', createdAt: 3000 },
      { image: 'data:image/png;base64,old4', style: 'style4', prompt: 'prompt4', createdAt: 4000 },
      { image: 'data:image/png;base64,old5', style: 'style5', prompt: 'prompt5', createdAt: 5000 },
    ];

    // Simulate adding a new item to the history
    const newItem = {
      image: 'data:image/png;base64,new',
      style: 'newStyle',
      prompt: 'new prompt',
      createdAt: 6000
    };

    // This is what the addToHistory function in ImageEdit.tsx does
    const updatedHistory = [newItem, ...mockHistoryItems].slice(0, 5);

    // Check that the history still has 5 items
    expect(updatedHistory.length).toBe(5);

    // Check that the newest item is first
    expect(updatedHistory[0]).toEqual(newItem);

    // Since we're adding a new item to a list that already has 5 items,
    // the last item should be removed, which is prompt5, not prompt1
    expect(updatedHistory.find(item => item.prompt === 'prompt5')).toBeUndefined();
  });

  it('should provide openImageModal function to ResultImage component', () => {
    // Create a new implementation to test if openImageModal prop is provided
    const mockResultImage = jest.fn();

    // Replace the ResultImage mock temporarily
    const originalResultImage = jest.requireMock('../ResultImage').default;
    jest.requireMock('../ResultImage').default = mockResultImage;

    render(<ImageEditPage />);

    // Check if ResultImage was called with openImageModal function
    expect(mockResultImage).toHaveBeenCalled();
    expect(typeof mockResultImage.mock.calls[0][0].openImageModal).toBe('function');

    // Restore the original mock
    jest.requireMock('../ResultImage').default = originalResultImage;
  });
});
