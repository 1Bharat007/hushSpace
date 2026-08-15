import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Camera, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  Maximize2 
} from "lucide-react";
import { sanitizeAndCompressImage, formatBytes } from "../lib/media/sanitizer";
import PhotoLightbox from "../components/media/PhotoLightbox";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB Raw Limit

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sanitizing, setSanitizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "gallery"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setImages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore gallery snapshot error:", err);
        setErrorMsg("Failed to sync photo memories.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  /**
   * Process and upload file with client-side EXIF/GPS stripping.
   */
  const processAndUploadFile = async (rawFile) => {
    if (!rawFile || !user) return;
    setErrorMsg("");

    if (!rawFile.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (JPEG, PNG, WebP, HEIC).");
      return;
    }

    if (rawFile.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMsg("Image exceeds 15MB limit.");
      return;
    }

    try {
      setSanitizing(true);
      // Client-Side Canvas Stripping + WebP compression
      const sanitized = await sanitizeAndCompressImage(rawFile);
      setSanitizing(false);
      setUploading(true);

      const fileName = `sanitized_${Date.now()}.webp`;
      const storagePath = `users/${user.uid}/photos/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, sanitized.blob, {
        contentType: 'image/webp',
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(prog);
        },
        (error) => {
          console.error("Upload error:", error);
          setErrorMsg("Photo upload failed. Please verify connection.");
          setUploading(false);
          setProgress(0);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, "gallery"), {
              userId: user.uid,
              url: downloadUrl,
              storagePath,
              caption: captionInput.trim() || rawFile.name.replace(/\.[^/.]+$/, ""),
              width: sanitized.width,
              height: sanitized.height,
              originalSize: sanitized.originalSize,
              sanitizedSize: sanitized.newSize,
              isSanitized: true,
              createdAt: serverTimestamp(),
            });
            setCaptionInput("");
          } catch (err) {
            console.error("Failed to store photo record:", err);
            setErrorMsg("Photo uploaded, but database entry could not be saved.");
          } finally {
            setUploading(false);
            setProgress(0);
          }
        }
      );
    } catch (err) {
      console.error("Sanitization error:", err);
      setErrorMsg("Could not sanitize image on client.");
      setSanitizing(false);
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handleDelete = async (photo, e) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this photo memory?")) return;
    setErrorMsg("");

    try {
      if (photo.storagePath) {
        const storageRef = ref(storage, photo.storagePath);
        await deleteObject(storageRef).catch((err) => console.warn("Storage delete warn:", err));
      }
      await deleteDoc(doc(db, "gallery", photo.id));
    } catch (err) {
      console.error("Delete photo error:", err);
      setErrorMsg("Failed to delete photo.");
    }
  };

  const openLightbox = (index) => {
    setSelectedPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Camera className="text-emerald-400" size={32} />
            Photo Memory Sanctuary
          </h1>
          <p className="text-text-dim text-sm sm:text-base">
            EXIF & GPS stripped client-side before upload. Zero location tracking, zero metadata footprint.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sanitizing}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Upload size={16} />
            <span>
              {sanitizing ? "Sanitizing EXIF..." : uploading ? `Uploading ${progress}%` : "Add Photo"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-card p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
          isDragOver
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.02]"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
          <ShieldCheck size={26} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white mb-1">
            Drag and drop private photos here
          </h3>
          <p className="text-xs text-text-dim max-w-md mx-auto">
            All EXIF headers, GPS location coordinates, and camera serials are stripped instantly in browser memory before cloud transmission.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon size={16} className="text-emerald-400" />
            <span>Sanitized Photos ({images.length})</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck size={13} />
            <span>100% Privacy Preserved</span>
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-square rounded-2xl overflow-hidden glass-card border border-white/5 cursor-pointer"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Sanitized Memory"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Dark Overlay with Caption & Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => handleDelete(photo, e)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-colors backdrop-blur-sm"
                      title="Delete Photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <p className="text-white text-xs font-bold truncate mb-1">
                      {photo.caption || "Sanitized Memory"}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-white/60 font-mono">
                      <span>{photo.sanitizedSize ? formatBytes(photo.sanitizedSize) : "WebP"}</span>
                      <span className="flex items-center gap-0.5 text-emerald-300">
                        <ShieldCheck size={11} />
                        <span>Clean</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-dim space-y-3">
            <ImageIcon size={40} className="mx-auto text-white/10" />
            <p className="text-sm">No sanitized photos stored in your sanctuary yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <PhotoLightbox
        photos={images}
        currentIndex={selectedPhotoIndex || 0}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(newIdx) => setSelectedPhotoIndex(newIdx)}
      />
    </div>
  );
};

export default Gallery;
