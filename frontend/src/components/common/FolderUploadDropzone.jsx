import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, X, File, Sparkles, Loader2 } from 'lucide-react';

export const FolderUploadDropzone = ({
  label = "Raw Assets & Project Files",
  description = "Drag and drop your raw footage, B-Roll, sound assets, or project folders",
  acceptedFileTypes = "*",
  maxFiles = 20,
  onFilesSelected,
  badgeText = "FILES"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const simulateUpload = (selectedFiles) => {
    setIsUploading(true);
    setUploadProgress(10);
    setIsCompleted(false);

    let progress = 10;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setIsCompleted(true);
        }, 400);
      } else {
        setUploadProgress(progress);
      }
    }, 180);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
      simulateUpload(droppedFiles);
      if (onFilesSelected) onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosenFiles = Array.from(e.target.files);
      setFiles(chosenFiles);
      simulateUpload(chosenFiles);
      if (onFilesSelected) onFilesSelected(chosenFiles);
    }
  };

  const calculateTotalSize = () => {
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes === 0) return '80 MB';
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
    setIsCompleted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFilesSelected) onFilesSelected([]);
  };

  return (
    <div className="w-full select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 p-6 md:p-8 flex flex-col items-center justify-center text-center border-2 border-dashed ${
          isDragging
            ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_50px_rgba(124,58,237,0.45)] scale-[1.01]'
            : 'bg-[#0E131F]/70 border-white/[0.08] hover:border-purple-500/40 hover:bg-[#121827]/80'
        }`}
      >
        {/* Iridescent background aura when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-indigo-500/20 to-blue-500/20 animate-pulse pointer-events-none" />
        )}

        {/* 3D Folder Graphic */}
        <div className="relative mb-4 flex items-center justify-center">
          {/* Glowing orbital ring */}
          <div
            className={`absolute w-28 h-28 rounded-full transition-all duration-500 ${
              isDragging
                ? 'bg-purple-500/30 blur-xl scale-125'
                : 'bg-indigo-600/15 blur-lg'
            }`}
          />

          {/* 3D Folder Representation matching uploaded reference */}
          <div
            className={`relative transition-transform duration-300 ${
              isDragging ? 'scale-110 -rotate-2' : 'group-hover:scale-105'
            }`}
          >
            <div className="w-20 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl shadow-purple-950/60 flex items-center justify-center relative border border-white/20">
              {/* Inner folder paper sheets */}
              <div className="absolute -top-2 w-14 h-4 rounded-t-lg bg-indigo-300/40 border-t border-x border-white/30" />
              <div className="absolute -top-1 w-16 h-3 rounded-t-lg bg-white/60" />
              <div className="w-full h-full rounded-2xl flex items-center justify-center z-10">
                <UploadCloud
                  className={`w-7 h-7 text-white transition-transform ${
                    isDragging ? 'scale-110 translate-y-[-2px]' : ''
                  }`}
                />
              </div>

              {/* Glass "FILES" Badge on Folder matching reference */}
              <div className="absolute -left-2 bottom-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md border border-white/25 text-[9px] font-extrabold tracking-widest text-white shadow-md z-20">
                {badgeText}
              </div>
            </div>
          </div>
        </div>

        {/* Text Labels */}
        <div className="relative z-10 max-w-sm">
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>{isDragging ? 'Drop files into the folder!' : label}</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {isDragging
              ? 'Release to upload all assets and raw footage.'
              : description}
          </p>
          <span className="inline-block mt-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.04] text-purple-300 border border-purple-500/20 hover:bg-purple-900/30 transition-colors">
            Click to Browse or Drag Folder
          </span>
        </div>
      </div>

      {/* Progress & Upload Card Matching Reference media_1788377150051.jpg */}
      {(isUploading || isCompleted || files.length > 0) && (
        <div className="mt-4 p-4 rounded-2xl bg-[#0F1422]/90 backdrop-blur-xl border border-purple-500/30 shadow-2xl relative animate-fade-in">
          {/* Close button in top right */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Remove uploaded files"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Folder Info Header */}
          <div className="flex items-center gap-3.5 mb-3.5">
            {/* Folder icon with FILES glass tag */}
            <div className="relative shrink-0">
              <div className="w-12 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center border border-white/20 shadow-md">
                <File className="w-4 h-4 text-white" />
                <span className="absolute -left-1.5 bottom-1 px-1 py-0.2 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-[7px] font-black text-white">
                  FILES
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-white leading-tight">
                {files.length > 1
                  ? `${files[0].name} +${files.length - 1} more files`
                  : files[0]?.name || 'Project Docs & Raw Assets'}
              </h5>
              <span className="text-xs text-slate-400 mt-0.5 block font-mono">
                {calculateTotalSize()} • {files.length || 3} assets queued
              </span>
            </div>
          </div>

          {/* Minimal Aesthetic Glass Progress Bar matching reference */}
          <div className="p-3 rounded-xl bg-[#07090E]/80 border border-white/[0.05]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span>Uploading ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Upload Complete</span>
                  </>
                )}
              </span>
              <span className="font-bold text-white font-mono">
                {uploadProgress}%
              </span>
            </div>

            {/* Glowing white/purple sleek progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 via-indigo-200 to-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderUploadDropzone;
