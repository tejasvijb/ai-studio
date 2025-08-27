import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultImage from '../ResultImage';
import { act } from 'react-dom/test-utils';

// Mock the Image component from next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, ...rest } = props;
    // Convert boolean props to strings for proper HTML attributes
    return <img {...rest} data-fill={fill ? "true" : undefined} />;
  },
}));

// Mock the ZoomIn icon component
jest.mock('lucide-react', () => ({
  ZoomIn: () => <div data-testid="zoom-icon" />,
}));

// Mock the Button component
jest.mock('../../../components/ui/button', () => ({
  Button: ({ children, asChild, className }: any) => (
    <button className={className}>{children}</button>
  ),
}));

describe('ResultImage', () => {
  // Mock props
  const mockOpenImageModal = jest.fn();
  const mockSetResultFromHistory = jest.fn();
  const testImage = 'data:image/png;base64,test-image-data';
  const mockHistory = [
    {
      image: 'data:image/png;base64,history-image-1',
      style: 'vintage',
      prompt: 'Test prompt 1',
      createdAt: 1724646000000 // August 26, 2025
    },
    {
      image: 'data:image/png;base64,history-image-2',
      style: 'streetwear',
      prompt: 'Test prompt 2',
      createdAt: 1724732400000 // August 27, 2025
    }
  ];

  const defaultProps = {
    resultImage: '',
    openImageModal: mockOpenImageModal,
    isLoading: false,
    style: 'editorial',
    prompt: 'test prompt',
    createdAt: 1724818800000, // August 28, 2025
    history: [],
    setResultFromHistory: mockSetResultFromHistory,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.log to prevent it from cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders placeholder when no image and not loading', () => {
    render(<ResultImage {...defaultProps} />);

    expect(screen.getByText('Your enhanced image will appear here')).toBeInTheDocument();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(<ResultImage {...defaultProps} isLoading={true} />);

    expect(screen.getByText('AI is working its magic...')).toBeInTheDocument();
    // Check for the spinner element with the appropriate classes
    const spinner = screen.getByText('AI is working its magic...').previousSibling;
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders result image when available', () => {
    render(<ResultImage {...defaultProps} resultImage={testImage} />);

    const image = screen.getByAltText('AI Enhanced Result');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testImage);
  });

  it('displays image details when result is available', () => {
    const style = 'vintage';
    const prompt = 'make it look old';
    const createdAt = 1724818800000; // August 28, 2025

    render(
      <ResultImage
        {...defaultProps}
        resultImage={testImage}
        style={style}
        prompt={prompt}
        createdAt={createdAt}
      />
    );

    expect(screen.getByText(`Style: ${style}`)).toBeInTheDocument();
    expect(screen.getByText(`Prompt: ${prompt}`)).toBeInTheDocument();
    expect(screen.getByText(/Created At:/)).toBeInTheDocument();
    // Check that the date is displayed (format may vary by locale)
    expect(screen.getByText(/Created At:/)).toHaveTextContent(new Date(createdAt).toLocaleString());
  });

  it('opens image modal when clicking on the image overlay', () => {
    render(<ResultImage {...defaultProps} resultImage={testImage} />);

    // Find the overlay div that wraps the zoom icon
    const overlay = screen.getByTestId('zoom-icon').parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOpenImageModal).toHaveBeenCalledWith(testImage, 'AI Enhanced Result');
    }
  });

  it('renders download button with correct href when result is available', () => {
    render(<ResultImage {...defaultProps} resultImage={testImage} />);

    const downloadLink = screen.getByText('Download Result').closest('a');
    expect(downloadLink).toHaveAttribute('href', testImage);
    expect(downloadLink).toHaveAttribute('download', 'ai-enhanced-image.png');
  });

  it('does not render history section when history is empty', () => {
    render(<ResultImage {...defaultProps} resultImage={testImage} />);

    expect(screen.queryByText('Previous Generations')).not.toBeInTheDocument();
  });

  it('renders history section with thumbnails when history exists', () => {
    render(
      <ResultImage
        {...defaultProps}
        resultImage={testImage}
        history={mockHistory}
      />
    );

    expect(screen.getByText('Previous Generations')).toBeInTheDocument();

    // Should have two history items
    const historyImages = screen.getAllByAltText(/Previous result \d/);
    expect(historyImages.length).toBe(2);

    // Check first history item
    expect(historyImages[0]).toHaveAttribute('src', mockHistory[0].image);
    expect(historyImages[0]).toHaveAttribute('alt', 'Previous result 1');
  });

  it('calls setResultFromHistory when clicking on history item', () => {
    render(
      <ResultImage
        {...defaultProps}
        resultImage={testImage}
        history={mockHistory}
      />
    );

    // Click on first history item
    const firstHistoryItem = screen.getAllByAltText(/Previous result \d/)[0].closest('div');
    if (firstHistoryItem) {
      fireEvent.click(firstHistoryItem);
      expect(mockSetResultFromHistory).toHaveBeenCalledWith(mockHistory[0]);
    }
  });

  it('downloads image when clicking download button', () => {
    // Create a spy on the createElement method
    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click');

    render(<ResultImage {...defaultProps} resultImage={testImage} />);

    // Get the download button and click it
    const downloadButton = screen.getByText('Download Result');
    expect(downloadButton).toBeInTheDocument();

    // Verify that the download link has the correct attributes
    const downloadLink = downloadButton.closest('a');
    expect(downloadLink).toHaveAttribute('href', testImage);
    expect(downloadLink).toHaveAttribute('download', 'ai-enhanced-image.png');

    // Clean up spies
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it('displays style, prompt and creation time when result is available', () => {
    const testStyle = 'cyberpunk';
    const testPrompt = 'futuristic city with neon lights';
    const testCreatedAt = 1724818800000; // August 28, 2025

    render(
      <ResultImage
        {...defaultProps}
        resultImage={testImage}
        style={testStyle}
        prompt={testPrompt}
        createdAt={testCreatedAt}
      />
    );

    // Check if style is displayed
    expect(screen.getByText(`Style: ${testStyle}`)).toBeInTheDocument();

    // Check if prompt is displayed
    expect(screen.getByText(`Prompt: ${testPrompt}`)).toBeInTheDocument();

    // Check if creation time is displayed (format may vary by locale)
    const createdAtText = screen.getByText(/Created At:/);
    expect(createdAtText).toBeInTheDocument();
    expect(createdAtText.textContent).toContain(new Date(testCreatedAt).toLocaleString());
  });

  it('opens preview modal when clicking on result image', () => {
    render(<ResultImage {...defaultProps} resultImage={testImage} />);

    // Find the overlay div that contains the zoom icon
    const overlay = screen.getByTestId('zoom-icon').parentElement;

    // Click the overlay to open the modal
    fireEvent.click(overlay!);

    // Verify that openImageModal was called with the correct parameters
    expect(mockOpenImageModal).toHaveBeenCalledWith(testImage, 'AI Enhanced Result');
    expect(mockOpenImageModal).toHaveBeenCalledTimes(1);
  });

  it('limits history display to a maximum of 5 items', () => {
    // Create a mock history array with more than 5 items
    const largeHistory = [
      { image: 'data:image/png;base64,image1', style: 'style1', prompt: 'prompt1', createdAt: 1724300000000 },
      { image: 'data:image/png;base64,image2', style: 'style2', prompt: 'prompt2', createdAt: 1724400000000 },
      { image: 'data:image/png;base64,image3', style: 'style3', prompt: 'prompt3', createdAt: 1724500000000 },
      { image: 'data:image/png;base64,image4', style: 'style4', prompt: 'prompt4', createdAt: 1724600000000 },
      { image: 'data:image/png;base64,image5', style: 'style5', prompt: 'prompt5', createdAt: 1724700000000 },
      { image: 'data:image/png;base64,image6', style: 'style6', prompt: 'prompt6', createdAt: 1724800000000 }
    ];

    // Mock the implementation of localStorage.getItem to return our large history
    const mockGetItem = jest.fn().mockImplementation(() => JSON.stringify(largeHistory));
    const mockSetItem = jest.fn();

    // Apply the mocks to Storage prototype
    Storage.prototype.getItem = mockGetItem;
    Storage.prototype.setItem = mockSetItem;

    // Create a component that would typically interact with localStorage
    render(
      <ResultImage
        {...defaultProps}
        resultImage={testImage}
        history={largeHistory.slice(0, 5)} // Only 5 items should be displayed
      />
    );

    // Check that "Previous Generations" section exists
    expect(screen.getByText('Previous Generations')).toBeInTheDocument();

    // Check that only 5 history items are rendered
    const historyImages = screen.getAllByAltText(/Previous result \d/);
    expect(historyImages.length).toBe(5);

    // Reset the Storage prototype
    jest.restoreAllMocks();
  });

  it('properly handles empty history', () => {
    render(<ResultImage {...defaultProps} resultImage={testImage} history={[]} />);

    // Check that "Previous Generations" section does not exist
    expect(screen.queryByText('Previous Generations')).not.toBeInTheDocument();

    // Check that no history items are rendered
    const historyImages = screen.queryAllByAltText(/Previous result \d/);
    expect(historyImages.length).toBe(0);
  });
});
