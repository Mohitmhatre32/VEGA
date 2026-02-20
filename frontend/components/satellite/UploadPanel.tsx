'use client';

import { motion } from 'framer-motion';
import { Upload, FileImage } from 'lucide-react';
import { useState } from 'react';
import { containerVariants, itemVariants } from '@/lib/animations';

export function UploadPanel() {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  return (
    <section className="py-20 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-white">
          Upload & Analyze
        </motion.h2>
        <motion.p variants={itemVariants} className="text-gray-400 mb-8">
          Submit satellite imagery for real-time terrain classification
        </motion.p>

        <motion.div
          variants={itemVariants}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragActive
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-gray-600 hover:border-gray-500 bg-gray-900/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <motion.div
              animate={{ y: isDragActive ? -10 : 0 }}
              className="p-4 rounded-full bg-cyan-500/20 border border-cyan-500/50"
            >
              <Upload className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-white font-semibold mb-1">
                {isDragActive ? 'Release to upload' : 'Drag files here or click to select'}
              </p>
              <p className="text-sm text-gray-400">GeoTIFF, PNG, JPEG - Up to 500MB</p>
            </div>
            <input
              type="file"
              multiple
              accept=".tif,.tiff,.png,.jpg,.jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </motion.div>

        {/* Processing preview */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Uploading', 'Processing', 'Analyzing'].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileImage className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-semibold text-gray-300">{step}</span>
              </div>
              <p className="text-xs text-gray-400">Step {i + 1} of 3</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
