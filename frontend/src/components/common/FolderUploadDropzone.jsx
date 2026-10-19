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
    <div className="w-full select-none text-[#261615] dark:text-[#FDEBDE]">
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
        className={`relative overflow-hidden cursor-pointer transition-all duration-300 p-6 md:p-8 flex flex-col items-center justify-center text-center border-2 border-dashed ${
          isDragging
            ? 'bg-[#FFEBAA]/40 dark:bg-[#FFEBAA]/10 border-[#382322] dark:border-[#FFEBAA] shadow-[6px_6px_0_#382322] dark:shadow-[6px_6px_0_#FFEBAA]/20 scale-[1.01]'
            : 'bg-[#FFFDF9] dark:bg-[#201413] border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] hover:bg-[#FFF7F1] dark:hover:bg-[#2A1B19]'
        }`}
      >
        {/* Iridescent background aura when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#FFEBAA]/20 pointer-events-none" />
        )}

        {/* 3D Editorial Folder Graphic */}
        <div className="relative mb-4 flex items-center justify-center">
          <div
            className={`relative transition-transform duration-300 ${
              isDragging ? 'scale-110 -rotate-2' : 'group-hover:scale-105'
            }`}
          >
            <div className="w-20 h-16 bg-[#FFEBAA] dark:bg-[#FFEBAA]/90 border-2 border-[#382322] shadow-[3px_3px_0_#382322] flex items-center justify-center relative">
              {/* Inner folder paper sheets */}
              <div className="absolute -top-2 w-14 h-4 bg-[#FFFDF9] border-t-2 border-x-2 border-[#382322]" />
              <div className="absolute -top-1 w-16 h-3 bg-[#FDEBDE] border-t-2 border-x-2 border-[#382322]" />
              <div className="w-full h-full flex items-center justify-center z-10">
                <UploadCloud
                  className={`w-7 h-7 text-[#261615] transition-transform ${
                    isDragging ? 'scale-110 translate-y-[-2px]' : ''
                  }`}
                />
              </div>

              {/* Brutalist "FILES" Badge on Folder */}
              <div className="absolute -left-2 bottom-2 px-2 py-0.5 bg-[#261615] text-[#FFEBAA] border border-[#382322] text-[9px] font-mono font-black tracking-widest shadow-[1px_1px_0_#382322] z-20">
                {badgeText}
              </div>
            </div>
          </div>
        </div>

        {/* Text Labels */}
        <div className="relative z-10 max-w-sm">
          <h4 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight flex items-center justify-center gap-1.5">
            <span>{isDragging ? 'Drop files into the folder!' : label}</span>
            <Sparkles className="w-3.5 h-3.5 text-[#8A5200] dark:text-[#FFEBAA]" />
          </h4>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 leading-relaxed font-sans">
            {isDragging
              ? 'Release to upload all assets and raw footage.'
              : description}
          </p>
          <span className="inline-block mt-3 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA] dark:hover:text-[#261615] transition-colors">
            Click to Browse or Drag Folder
          </span>
        </div>
      </div>

      {/* Progress & Upload Card */}
      {(isUploading || isCompleted || files.length > 0) && (
        <div className="mt-4 p-4 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[4px_4px_0_#382322] dark:shadow-[4px_4px_0_#000] relative animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
          {/* Close button in top right */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-1 border border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FDEBDE] transition-colors cursor-pointer"
            title="Remove uploaded files"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Folder Info Header */}
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="relative shrink-0">
              <div className="w-12 h-10 bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center">
                <File className="w-4 h-4 text-[#261615]" />
                <span className="absolute -left-1.5 bottom-1 px-1 py-0.2 bg-[#261615] text-[#FFEBAA] text-[7px] font-mono font-black">
                  FILES
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] leading-tight">
                {files.length > 1
                  ? `${files[0].name} +${files.length - 1} more files`
                  : files[0]?.name || 'Project Docs & Raw Assets'}
              </h5>
              <span className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 block font-mono">
                {calculateTotalSize()} • {files.length || 3} assets queued
              </span>
            </div>
          </div>

          {/* Minimal Editorial Progress Bar */}
          <div className="p-3 bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322]/20 dark:border-[#FDEBDE]/20">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#5C3A38] dark:text-[#D4B8A8] font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-[#8A5200] dark:text-[#FFEBAA] animate-spin" />
                    <span>Uploading ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
                    <span className="text-[#059669] dark:text-[#34D399]">Upload Complete</span>
                  </>
                )}
              </span>
              <span className="font-bold text-[#261615] dark:text-[#FDEBDE] font-mono">
                {uploadProgress}%
              </span>
            </div>

            {/* Brutalist progress bar */}
            <div className="w-full h-2 bg-[#FDEBDE] dark:bg-[#2A1B19] border border-[#382322]/30 overflow-hidden">
              <div
                className="h-full bg-[#059669] dark:bg-[#34D399] transition-all duration-200"
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
