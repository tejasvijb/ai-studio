'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageModal } from '@/components/ui/modal';
import UploadImage from './UploadImage';
import PromptAndStyle from './PromptAndStyle';
import ResultImage from './ResultImage';


const additionalPrompt = 'Make sure it looks realistic, matches the lighting and body shape, and blends seamlessly with the original photo.';

export default function ImageEditPage() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState({
        image: '',
        style: '',
        prompt: '',
        createdAt: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<string>('editorial');
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [modalAlt, setModalAlt] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [history, setHistory] = useState<Array<{
        image: string;
        style: string;
        prompt: string;
        createdAt: number;
    }>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load history from localStorage on component mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('imageEditHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Failed to parse saved history:', error);
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('imageEditHistory', JSON.stringify(history));
    }, [history]);

    const addToHistory = (newResult: {
        image: string;
        style: string;
        prompt: string;
        createdAt: number;
    }) => {
        setHistory(prevHistory => {
            const updatedHistory = [newResult, ...prevHistory.slice(0, 4)];
            return updatedHistory;
        });
    };

    const setResultFromHistory = (historyItem: {
        image: string;
        style: string;
        prompt: string;
        createdAt: number;
    }) => {
        setResultImage(historyItem);
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setError(null);
            setResultImage({
                image: '',
                style: '',
                prompt: '',
                createdAt: 0
            });

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            const generatedPrompt = `${prompt} in ${selectedStyle} style. ${additionalPrompt}`;
            formData.append('prompt', generatedPrompt);
            formData.append('style', selectedStyle);

            const response = await fetch('/api/image-edit', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log(result);

            if (!response.ok) {
                throw new Error(result.error || 'Failed to process image');
            }

            if (result.image?.b64_json) {
                const newResult = {
                    image: `data:image/png;base64,${result.image.b64_json}`,
                    style: result.style,
                    prompt: result.prompt,
                    createdAt: result.createdAt
                };
                setResultImage(newResult);
                addToHistory(newResult);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setError(null);
            setResultImage({
                image: '',
                style: '',
                prompt: '',
                createdAt: 0
            });

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    const resetForm = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResultImage({
            image: '',
            style: '',
            prompt: '',
            createdAt: 0
        });
        setError(null);
        setPrompt('');
        setSelectedStyle('editorial');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openImageModal = (imageSrc: string, alt: string) => {
        setModalImage(imageSrc);
        setModalAlt(alt);
        setIsModalOpen(true);
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
        setModalAlt('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Image Editor
                    </h1>
                    <p className="text-xl text-gray-600">
                        Upload an image and let AI enhance it with beautiful styling
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Upload Image
                        </h2>
                        <UploadImage
                            selectedImage={selectedImage}
                            previewUrl={previewUrl}
                            handleDrop={handleDrop}
                            handleDragOver={handleDragOver}
                            handleImageSelect={handleImageSelect}
                            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                            openImageModal={openImageModal}
                        />

                        {/* Prompt and Style Selection */}

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary:</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {`${prompt} in ${selectedStyle} style. ${additionalPrompt}`}
                            </p>
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <PromptAndStyle
                            prompt={prompt}
                            setPrompt={setPrompt}
                            selectedStyle={selectedStyle}
                            setSelectedStyle={setSelectedStyle}
                        />

                        <div className="mt-6 space-y-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedImage || isLoading}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    'Enhance Image with AI'
                                )}
                            </Button>

                            {selectedImage && (
                                <Button
                                    onClick={resetForm}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            AI Enhanced Result
                        </h2>

                        <ResultImage
                            style={resultImage.style}
                            prompt={resultImage.prompt}
                            createdAt={resultImage.createdAt}
                            resultImage={resultImage.image}
                            openImageModal={openImageModal}
                            isLoading={isLoading}
                            history={history}
                            setResultFromHistory={setResultFromHistory}
                        />
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            <ImageModal
                isOpen={isModalOpen}
                onClose={closeImageModal}
                imageSrc={modalImage || ''}
                alt={modalAlt}
            />
        </div>
    );
}
