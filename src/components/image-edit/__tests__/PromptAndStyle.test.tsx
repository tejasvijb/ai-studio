import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptAndStyle from '../PromptAndStyle';

// Mock UI components to avoid issues with Radix UI
jest.mock('../../../components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder }: any) => (
    <input
      data-testid={id}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

jest.mock('../../../components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => {
    // Simulate select by exposing a test function to change value
    const handleChange = (event: { target: { value: any } }) => {
      onValueChange(event.target.value);
    };
    return (
      <div data-testid="select-container">
        <select data-testid="style-select" value={value} onChange={handleChange}>
          <option value="editorial">Editorial</option>
          <option value="streetwear">Streetwear</option>
          <option value="vintage">Vintage</option>
        </select>
        {children}
      </div>
    );
  },
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

describe('PromptAndStyle', () => {
  const mockSetPrompt = jest.fn();
  const mockSetSelectedStyle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial values', () => {
    render(
      <PromptAndStyle
        prompt="Initial prompt text"
        setPrompt={mockSetPrompt}
        selectedStyle="editorial"
        setSelectedStyle={mockSetSelectedStyle}
      />
    );

    // Check prompt input
    const promptInput = screen.getByTestId('prompt');
    expect(promptInput).toBeInTheDocument();
    expect(promptInput).toHaveValue('Initial prompt text');

    // Check style select
    const styleSelect = screen.getByTestId('style-select');
    expect(styleSelect).toBeInTheDocument();
    expect(styleSelect).toHaveValue('editorial');
  });

  it('calls setPrompt when input value changes', () => {
    render(
      <PromptAndStyle
        prompt=""
        setPrompt={mockSetPrompt}
        selectedStyle="editorial"
        setSelectedStyle={mockSetSelectedStyle}
      />
    );

    const promptInput = screen.getByTestId('prompt');
    fireEvent.change(promptInput, { target: { value: 'New prompt text' } });

    expect(mockSetPrompt).toHaveBeenCalledWith('New prompt text');
  });

  it('calls setSelectedStyle when select value changes', () => {
    render(
      <PromptAndStyle
        prompt=""
        setPrompt={mockSetPrompt}
        selectedStyle="editorial"
        setSelectedStyle={mockSetSelectedStyle}
      />
    );

    const styleSelect = screen.getByTestId('style-select');
    fireEvent.change(styleSelect, { target: { value: 'vintage' } });

    expect(mockSetSelectedStyle).toHaveBeenCalledWith('vintage');
  });

  it('renders labels for inputs', () => {
    render(
      <PromptAndStyle
        prompt=""
        setPrompt={mockSetPrompt}
        selectedStyle="editorial"
        setSelectedStyle={mockSetSelectedStyle}
      />
    );

    expect(screen.getByText('Prompt')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
  });

  it('renders placeholder for prompt input', () => {
    render(
      <PromptAndStyle
        prompt=""
        setPrompt={mockSetPrompt}
        selectedStyle="editorial"
        setSelectedStyle={mockSetSelectedStyle}
      />
    );

    const promptInput = screen.getByTestId('prompt');
    expect(promptInput).toHaveAttribute(
      'placeholder',
      'Describe how you want to enhance your image...'
    );
  });
});
