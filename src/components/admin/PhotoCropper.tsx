import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

export const PhotoCropper: React.FC<{ file: File; aspect: number; onCancel: () => void; onSave: (file: File) => void }> = ({ file, aspect, onCancel, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 360, height: 360 / aspect });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { imageRef.current = image; draw(); };
    image.src = url;
    const resize = () => { const width = Math.min(520, window.innerWidth - 48); setSize({ width, height: width / aspect }); };
    resize(); window.addEventListener('resize', resize);
    return () => { URL.revokeObjectURL(url); window.removeEventListener('resize', resize); };
  }, [file, aspect]);

  const draw = () => {
    const canvas = canvasRef.current; const image = imageRef.current;
    if (!canvas || !image) return;
    const ratio = Math.min(3, Math.max(1, image.naturalWidth / size.width));
    canvas.width = Math.round(size.width * ratio); canvas.height = Math.round(size.height * ratio);
    const base = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom;
    const width = image.naturalWidth * base; const height = image.naturalHeight * base;
    const maxX = Math.max(0, (width - canvas.width) / 2); const maxY = Math.max(0, (height - canvas.height) / 2);
    const x = (canvas.width - width) / 2 + offset.x * maxX; const y = (canvas.height - height) / 2 + offset.y * maxY;
    const context = canvas.getContext('2d'); context?.clearRect(0, 0, canvas.width, canvas.height); context?.drawImage(image, x, y, width, height);
  };
  useEffect(() => { draw(); }, [zoom, offset, size]);

  const save = () => canvasRef.current?.toBlob((blob) => {
    if (!blob) return;
    onSave(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-crop.webp`, { type: 'image/webp' }));
  }, 'image/webp', 0.94);

  return <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#181A2E]/80 p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-xl rounded-3xl border-2 border-[#FCBF49] bg-white p-5">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-extrabold">Atur posisi dan crop foto</h3><button type="button" onClick={onCancel} aria-label="Tutup"><X/></button></div>
      <p className="mb-3 text-xs text-[#5C403D]">Geser foto untuk mengatur posisi. Gunakan penggeser untuk zoom.</p>
      <canvas ref={canvasRef} style={{ width: size.width, height: size.height, touchAction: 'none' }} className="mx-auto max-w-full rounded-xl bg-black" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }; }} onPointerMove={(e) => { const d = dragRef.current; if (!d) return; const canvas = canvasRef.current; if (!canvas) return; const maxX = Math.max(1, (canvas.width * zoom - canvas.width) / 2); const maxY = Math.max(1, (canvas.height * zoom - canvas.height) / 2); setOffset({ x: Math.max(-1, Math.min(1, d.ox + (e.clientX - d.x) * canvas.width / size.width / maxX)), y: Math.max(-1, Math.min(1, d.oy + (e.clientY - d.y) * canvas.height / size.height / maxY)) }); }} onPointerUp={() => { dragRef.current = null; }} />
      <label className="mt-4 block text-xs font-bold">Zoom <input className="ml-2 w-3/4 accent-[#D62828]" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}/></label>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onCancel} className="min-h-10 rounded-full border px-4 text-xs font-bold">Batal</button><button type="button" onClick={save} className="btn-tactile-red min-h-10 rounded-full px-5 text-xs font-bold"><Check className="mr-1 inline h-4 w-4"/>Gunakan Crop</button></div>
    </div>
  </div>;
};
