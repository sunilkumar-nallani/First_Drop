'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Button from './Button';

interface CopyLinkButtonProps {
    url?: string;
    path?: string;
    className?: string;
}

export default function CopyLinkButton({ url, path, className }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);
    const [fullUrl, setFullUrl] = useState(url || '');

    // Set the full URL dynamically on the client using the current origin
    // This removes 'localhost' hardcoding and adapts to any deployment domain
    React.useEffect(() => {
        if (!url && path) {
            setFullUrl(`${window.location.origin}${path}`);
        }
    }, [url, path]);

    const handleCopy = async () => {
        if (!fullUrl) return;

        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2s
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className={className}
            onClick={handleCopy}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4 mr-2" />
                    Share Link
                </>
            )}
        </Button>
    );
}
