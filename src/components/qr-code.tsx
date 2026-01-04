"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";

interface QRCodeProps {
    value: string;
    size?: number;
    fileName?: string;
}

export function PathologyQRCode({ value, size = 256, fileName = "pathology-qr" }: QRCodeProps) {
    const qrRef = useRef<SVGSVGElement>(null);

    const downloadQR = () => {
        const svg = qrRef.current;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = size;
            canvas.height = size;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${fileName}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-white shadow-sm">
            <QRCodeSVG
                ref={qrRef}
                value={value}
                size={size}
                level="H"
                minVersion={7}
                imageSettings={{
                    excavate: true,
                    src: "/Universidad_Simon_Bolivar.png",
                    height: 60,
                    width: 90,
                    x: 83,
                    y: 98,
                }}
                title="Simón Bolívar"
                fgColor="rgb(3 133 57)"
                bgColor="rgb(255 255 255)"
            />
            <Button onClick={downloadQR} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Descargar QR
            </Button>
        </div>
    );
}
