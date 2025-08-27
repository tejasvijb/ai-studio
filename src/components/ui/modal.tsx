'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    alt: string;
}

export function ImageModal({ isOpen, onClose, imageSrc, alt }: ImageModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 max-w-4xl max-h-[90vh] mx-4">
                {/* Close Button */}
                <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="absolute -top-10 right-0 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40"
                >
                    <X className="w-4 h-4" />
                </Button>

                {/* Image */}
                <div className="relative w-full h-full">
                    <img
                        src={imageSrc}
                        alt={alt}
                        className="w-full h-full object-contain rounded-lg shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );
}
