"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";

interface QRCodeProps {
    value: string;
    size?: number;
    fileName?: string;
}

export function PathologyQRCode({ value, size = 256, fileName = "pathology-qr" }: QRCodeProps) {
    const qrRef = useRef<HTMLCanvasElement>(null);

    const downloadQR = () => {
        const canvas = qrRef.current;
        if (!canvas) return;
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${fileName}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-white shadow-sm">
            <QRCodeCanvas
                ref={qrRef}
                value={value}
                size={size}
                level="H"
                minVersion={7}
                title="Simón Bolívar"
                fgColor="rgb(3 133 57)"
                bgColor="rgb(255 255 255)"
                marginSize={1}
                imageSettings={{
                    excavate: true,
                    src: "/Universidad_Simon_Bolivar.png",
                    height: 60,
                    width: 90,
                    x: 83,
                    y: 98,
                }}
            />
            <Button onClick={downloadQR} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Descargar QR
            </Button>
        </div>
    );
}
