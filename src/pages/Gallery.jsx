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
import { Image as ImageIcon, Upload, X, Plus, Trash2, Camera } from "lucide-react";

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "gallery"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "gallery"), {
          userId: user.uid,
          url: downloadURL,
          fileName: file.name,
          storagePath: storageRef.fullPath,
          createdAt: serverTimestamp()
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  const handleDelete = async (image) => {
    if (!window.confirm("Delete this memory?")) return;

    try {
      const storageRef = ref(storage, image.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "gallery", image.id));
    } catch (error) {
      console.error("Delete failed", error);
      // Even if storage fails, delete the firestore doc to keep UI clean
      await deleteDoc(doc(db, "gallery", image.id));
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
             <Camera className="text-brand-accent" size={32} />
             Your Gallery
          </h1>
          <p className="text-text-dim">A private collection of your favorite moments.</p>
        </div>
        
        <label className="relative cursor-pointer group">
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
          <div className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-brand-accent/20">
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

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="columns-2 lg:columns-4 gap-6 space-y-6">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-2xl overflow-hidden break-inside-avoid shadow-xl ring-1 ring-white/10"
              >
                <img 
                  src={image.url} 
                  alt={image.fileName}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                   <div className="flex justify-end">
                      <button 
                         onClick={() => handleDelete(image)}
                         className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-white/40 font-mono truncate">{image.fileName}</p>
                      <p className="text-[10px] font-bold text-white/60">
                         {image.createdAt?.toDate().toLocaleDateString()}
                      </p>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-20 flex flex-col items-center text-center">
           <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-text-dim mb-8">
              <ImageIcon size={40} />
           </div>
           <h3 className="text-2xl font-bold text-white mb-4">No images yet</h3>
        </div>
      )}
    </div>
  );
};

export default Gallery;
