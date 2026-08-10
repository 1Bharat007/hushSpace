import React, { useState, useEffect } from "react";
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
import { Image as ImageIcon, Upload, Trash2, Camera, AlertCircle } from "lucide-react";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB Limit

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
        console.error("Firestore snapshot error:", err);
        setErrorMsg("Failed to sync gallery memories.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const handleUpload = async (e) => {
    setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file type and file size validation (Abuse Protection)
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (JPEG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMsg("File size exceeds 10MB limit. Please select a smaller photo.");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `gallery/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed", error);
        setErrorMsg("Image upload failed. Please check your internet connection.");
        setUploading(false);
        setProgress(0);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "gallery"), {
            userId: user.uid,
            url: downloadURL,
            fileName: file.name,
            storagePath: storageRef.fullPath,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Error saving gallery metadata:", err);
          setErrorMsg("Upload complete, but failed to save photo details.");
        } finally {
          setUploading(false);
          setProgress(0);
        }
      }
    );
  };

  const handleDelete = async (image) => {
    if (!window.confirm("Delete this memory?")) return;
    setErrorMsg("");

    try {
      const storageRef = ref(storage, image.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "gallery", image.id));
    } catch (error) {
      console.error("Delete failed", error);
      try {
        await deleteDoc(doc(db, "gallery", image.id));
      } catch (err) {
        setErrorMsg("Failed to delete memory. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Camera className="text-brand-accent" size={32} />
            Your Gallery
          </h1>
          <p className="text-text-dim text-sm sm:text-base">
            A private collection of your favorite moments.
          </p>
        </div>

        <label className="relative cursor-pointer group w-full sm:w-auto">
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="image/*"
            disabled={uploading}
          />
          <div className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-3.5 rounded-[var(--radius-custom)] font-bold transition-all shadow-lg shadow-brand-accent/20">
            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uploading {Math.round(progress)}%</span>
              </div>
            ) : (
              <>
                <Upload size={20} />
                <span>Add Photo</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-red-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square glass-card rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-[var(--radius-custom)] overflow-hidden break-inside-avoid shadow-xl ring-1 ring-white/10"
              >
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-brand-primary/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(image)}
                      className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-white/80 font-mono truncate">
                      {image.fileName}
                    </p>
                    <p className="text-[10px] font-bold text-white/50">
                      {image.createdAt?.toDate?.()
                        ? image.createdAt.toDate().toLocaleDateString()
                        : "Just now"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card rounded-[var(--radius-custom)] p-12 sm:p-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius-custom)] bg-white/5 flex items-center justify-center text-text-dim mb-6">
            <ImageIcon size={36} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            No images yet
          </h3>
          <p className="text-text-dim text-sm max-w-sm">
            Click "Add Photo" above to upload your first private memory.
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
