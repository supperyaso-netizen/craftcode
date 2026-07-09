// app/admin/projects/new/page.tsx
"use client";

import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  return <ProjectForm />;
}


// "use client";

// import { useState, useEffect, useRef, type DragEvent } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   Plus,
//   Image as ImageIcon,
//   Star,
//   Link as LinkIcon,
//   Github,
//   Globe,
//   Tag,
//   FolderOpen,
//   Save,
//   Trash2
// } from "lucide-react";

// interface ImageType {
//   id: string;
//   url: string;
//   file?: File;
//   order: number;
// }

// export default function NewProjectPage() {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [projectId, setProjectId] = useState<string | null>(null);
//   const [isLoadingProject, setIsLoadingProject] = useState(false);
//   const [images, setImages] = useState<ImageType[]>([]);
//   const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);
//   const [compressionQuality, setCompressionQuality] = useState(0.7); // 70% quality
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const dropZoneRef = useRef<HTMLDivElement>(null);

//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     category: 'Graphic Design',
//     description: '',
//     tags: '',
//     githubLink: '',
//     liveLink: '',
//     status: 'draft' as 'published' | 'draft',
//   });

//   const categories = ['Graphic Design', 'UI/UX Design', 'Web Development', 'Full Stack', 'App Development', 'Branding', 'Digital Art', 'Illustration'];

//   // Load project from localStorage when editing
//   useEffect(() => {
//     const path = window.location.pathname;
//     if (path.includes('/admin/projects/') && !path.includes('/new')) {
//       const id = path.split('/').pop() || null;
//       setIsEditing(true);
//       setProjectId(id);
//       if (id) loadProject(id);
//     }
//   }, []);

//   const loadProject = async (id: string) => {
//     setIsLoadingProject(true);
//     try {
//       const storedProjects = localStorage.getItem('projects');
//       if (!storedProjects) {
//         throw new Error('No projects found');
//       }
      
//       const projects = JSON.parse(storedProjects);
//       if (!Array.isArray(projects)) {
//         throw new Error('Invalid projects data');
//       }
      
//       const project = projects.find((p: any) => p.id === id);
//       if (!project) {
//         throw new Error('Project not found');
//       }

//       setFormData({
//         title: project.title || '',
//         slug: project.slug || '',
//         category: project.category || 'Graphic Design',
//         description: project.description || '',
//         tags: (project.tags || []).join(', '),
//         githubLink: project.githubLink || '',
//         liveLink: project.liveLink || '',
//         status: project.status === 'published' ? 'published' : 'draft',
//       });

//       if (project.images && Array.isArray(project.images) && project.images.length > 0) {
//         setImages(
//           project.images.map((img: any, index: number) => ({
//             id: img.id || `img-${Date.now()}-${index}`,
//             url: img.imageData || img.url || img,
//             order: img.order ?? index,
//           }))
//         );
//       }
//     } catch (error) {
//       console.error('Failed to load project:', error);
//       triggerToast('❌ Could not load project', 'error');
//     } finally {
//       setIsLoadingProject(false);
//     }
//   };

//   // Compress image before storing
//   const compressImage = (dataUrl: string, quality: number = 0.7): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         // Reduce size if too large
//         let width = img.width;
//         let height = img.height;
//         const maxDimension = 800;
        
//         if (width > maxDimension || height > maxDimension) {
//           const ratio = Math.min(maxDimension / width, maxDimension / height);
//           width = Math.round(width * ratio);
//           height = Math.round(height * ratio);
//         }
        
//         canvas.width = width;
//         canvas.height = height;
//         ctx?.drawImage(img, 0, 0, width, height);
        
//         // Convert to JPEG with quality
//         const compressed = canvas.toDataURL('image/jpeg', quality);
//         resolve(compressed);
//       };
//       img.onerror = reject;
//       img.src = dataUrl;
//     });
//   };

//   const handleImageUpload = async (files: FileList | null) => {
//     if (!files) return;

//     setIsUploading(true);
//     setUploadProgress(0);

//     const newImages: ImageType[] = [];
//     const totalFiles = files.length;
//     let processed = 0;

//     for (const file of Array.from(files)) {
//       if (file.size > 10 * 1024 * 1024) {
//         triggerToast(`File ${file.name} is too large. Max 10MB.`, 'error');
//         processed++;
//         continue;
//       }

//       if (!file.type.startsWith('image/')) {
//         triggerToast(`File ${file.name} is not an image.`, 'error');
//         processed++;
//         continue;
//       }

//       try {
//         const reader = new FileReader();
//         const dataUrl = await new Promise<string>((resolve, reject) => {
//           reader.onload = (e) => resolve(e.target?.result as string);
//           reader.onerror = reject;
//           reader.readAsDataURL(file);
//         });

//         // Compress the image
//         const compressed = await compressImage(dataUrl, compressionQuality);
        
//         newImages.push({
//           id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//           url: compressed,
//           file: file,
//           order: images.length + newImages.length
//         });
        
//         processed++;
//         const progress = (processed / totalFiles) * 100;
//         setUploadProgress(progress);

//         if (processed === totalFiles) {
//           setImages(prev => [...prev, ...newImages]);
//           setIsUploading(false);
//           setUploadProgress(0);
//           triggerToast(`✅ ${newImages.length} images uploaded & compressed!`, 'success');
//         }
//       } catch (error) {
//         console.error('Error processing image:', error);
//         processed++;
//         if (processed === totalFiles) {
//           setIsUploading(false);
//           setUploadProgress(0);
//         }
//       }
//     }
//   };

//   const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (dropZoneRef.current) {
//       dropZoneRef.current.classList.add('border-[#2563EB]', 'bg-[#2563EB]/5');
//     }
//   };

//   const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (dropZoneRef.current) {
//       dropZoneRef.current.classList.remove('border-[#2563EB]', 'bg-[#2563EB]/5');
//     }
//   };

//   const handleDrop = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (dropZoneRef.current) {
//       dropZoneRef.current.classList.remove('border-[#2563EB]', 'bg-[#2563EB]/5');
//     }
//     handleImageUpload(e.dataTransfer.files);
//   };

//   const removeImage = (id: string) => {
//     setImages(prev => prev.filter(img => img.id !== id));
//     triggerToast('🗑️ Image removed', 'info');
//   };

//   const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
//     setDraggedIndex(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOverImage = (e: DragEvent<HTMLDivElement>, index: number) => {
//     e.preventDefault();
//     if (draggedIndex === null || draggedIndex === index) return;

//     const newImages = [...images];
//     const [draggedItem] = newImages.splice(draggedIndex, 1);
//     newImages.splice(index, 0, draggedItem);
//     newImages.forEach((img, i) => img.order = i);
//     setImages(newImages);
//     setDraggedIndex(index);
//   };

//   const handleDragEnd = () => {
//     setDraggedIndex(null);
//   };

//   const setMainImage = (id: string) => {
//     const index = images.findIndex(img => img.id === id);
//     if (index === 0) return;
//     const newImages = [...images];
//     const [item] = newImages.splice(index, 1);
//     newImages.unshift(item);
//     newImages.forEach((img, i) => img.order = i);
//     setImages(newImages);
//     triggerToast('⭐ Thumbnail updated!', 'success');
//   };

//   const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
//     setShowToast({ message, type });
//     setTimeout(() => setShowToast(null), 3000);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.title.trim()) {
//       triggerToast('❌ Please enter a project title', 'error');
//       return;
//     }
//     if (!formData.description.trim()) {
//       triggerToast('❌ Please enter a short description', 'error');
//       return;
//     }

//     setIsSubmitting(true);

//     // Check total size before saving
//     let totalSize = 0;
//     const imageData = images.map((img, index) => ({
//       id: img.id,
//       imageData: img.url,
//       order: img.order ?? index,
//     }));
    
//     // Estimate size
//     imageData.forEach(img => {
//       totalSize += img.imageData.length;
//     });

//     // If total size is too large, compress more
//     if (totalSize > 4 * 1024 * 1024) { // 4MB limit
//       triggerToast('⚠️ Images too large, compressing more...', 'info');
//       // Re-compress with lower quality
//       const compressedImages = await Promise.all(
//         images.map(async (img) => {
//           const compressed = await compressImage(img.url, 0.5);
//           return {
//             id: img.id,
//             imageData: compressed,
//             order: img.order,
//           };
//         })
//       );
      
//       // Update images state with compressed versions
//       setImages(compressedImages.map((img, index) => ({
//         id: img.id,
//         url: img.imageData,
//         order: index,
//       })));
      
//       // Use compressed data for saving
//       const projectData = {
//         id: isEditing ? projectId : `proj-${Date.now()}`,
//         title: formData.title,
//         slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
//         category: formData.category,
//         description: formData.description,
//         tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
//         githubLink: formData.githubLink,
//         liveLink: formData.liveLink,
//         status: formData.status,
//         images: compressedImages,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };
      
//       saveProject(projectData);
//       return;
//     }

//     const projectData = {
//       id: isEditing ? projectId : `proj-${Date.now()}`,
//       title: formData.title,
//       slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
//       category: formData.category,
//       description: formData.description,
//       tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
//       githubLink: formData.githubLink,
//       liveLink: formData.liveLink,
//       status: formData.status,
//       images: imageData,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     saveProject(projectData);
//   };

//   const saveProject = (projectData: any) => {
//     try {
//       let existingProjects = [];
//       const stored = localStorage.getItem('projects');
//       if (stored) {
//         try {
//           const parsed = JSON.parse(stored);
//           if (Array.isArray(parsed)) {
//             existingProjects = parsed;
//           }
//         } catch (e) {
//           console.error('Error parsing stored projects:', e);
//         }
//       }

//       let updatedProjects;
//       if (isEditing) {
//         updatedProjects = existingProjects.map((p: any) => 
//           p.id === projectId ? { ...projectData, id: projectId } : p
//         );
//       } else {
//         updatedProjects = [...existingProjects, projectData];
//       }

//       // Check size before saving
//       const size = JSON.stringify(updatedProjects).length;
//       if (size > 4.5 * 1024 * 1024) {
//         triggerToast('❌ Project data too large. Please use fewer or smaller images.', 'error');
//         setIsSubmitting(false);
//         return;
//       }

//       localStorage.setItem('projects', JSON.stringify(updatedProjects));

//       triggerToast(
//         isEditing ? '✅ Project updated successfully!' : '✅ Project created successfully!',
//         'success'
//       );

//       setTimeout(() => {
//         router.push('/admin/projects');
//       }, 500);
//     } catch (error: any) {
//       console.error('Save failed:', error);
//       if (error.name === 'QuotaExceededError') {
//         triggerToast('❌ Storage quota exceeded. Please use fewer or smaller images.', 'error');
//       } else {
//         triggerToast(`❌ ${error.message || 'Failed to save project'}`, 'error');
//       }
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       {/* Toast Notification */}
//       <AnimatePresence>
//         {showToast && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 ${
//               showToast.type === 'success' ? 'bg-green-500/90' :
//               showToast.type === 'error' ? 'bg-red-500/90' :
//               'bg-[#2563EB]/90'
//             } text-white max-w-md`}
//           >
//             {showToast.message}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => router.push('/admin/projects')}
//           className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300"
//         >
//           ←
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">
//             {isEditing ? 'Edit Project' : 'Upload New Project'}
//           </h1>
//           <p className="text-gray-400 text-sm mt-1">
//             {isEditing ? 'Update project details, images, or links' : 'Add a new project to your portfolio'}
//           </p>
//         </div>
//       </div>

//       {isLoadingProject ? (
//         <div className="p-12 text-center text-gray-400">Loading project...</div>
//       ) : (
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Basic Info */}
//         <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-6">
//           <h2 className="text-white font-semibold text-lg flex items-center gap-2">
//             <FolderOpen className="w-5 h-5 text-[#2563EB]" />
//             Project Details
//           </h2>

//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-2">
//               Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => {
//                 const title = e.target.value;
//                 setFormData({
//                   ...formData,
//                   title,
//                   slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
//                 });
//               }}
//               placeholder="Enter project title..."
//               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white placeholder-gray-500 outline-none transition-all"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-2">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={formData.category}
//               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white outline-none transition-all"
//             >
//               {categories.map((cat) => (
//                 <option key={cat} value={cat} className="bg-black">{cat}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-2">
//               Description <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               placeholder="Brief description of the project..."
//               rows={3}
//               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white placeholder-gray-500 outline-none transition-all resize-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-2">
//               <Tag className="w-4 h-4 inline mr-2" />
//               Tags (comma separated)
//             </label>
//             <input
//               type="text"
//               value={formData.tags}
//               onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
//               placeholder="design, development, ui/ux..."
//               className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white placeholder-gray-500 outline-none transition-all"
//             />
//           </div>
//         </div>

//         {/* Links & Status */}
//         <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-6">
//           <h2 className="text-white font-semibold text-lg flex items-center gap-2">
//             <LinkIcon className="w-5 h-5 text-[#2563EB]" />
//             Links & Status
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-300 text-sm font-medium mb-2">
//                 <Github className="w-4 h-4 inline mr-2" />
//                 GitHub Link
//               </label>
//               <input
//                 type="url"
//                 value={formData.githubLink}
//                 onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
//                 placeholder="https://github.com/..."
//                 className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white placeholder-gray-500 outline-none transition-all"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-300 text-sm font-medium mb-2">
//                 <Globe className="w-4 h-4 inline mr-2" />
//                 Live Demo Link
//               </label>
//               <input
//                 type="url"
//                 value={formData.liveLink}
//                 onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
//                 placeholder="https://..."
//                 className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#2563EB]/50 text-white placeholder-gray-500 outline-none transition-all"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-300 text-sm font-medium mb-2">
//               Status
//             </label>
//             <div className="flex gap-4">
//               {(['published', 'draft'] as const).map((status) => (
//                 <label key={status} className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="radio"
//                     value={status}
//                     checked={formData.status === status}
//                     onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })}
//                     className="accent-[#2563EB]"
//                   />
//                   <span className="text-gray-300 text-sm capitalize">{status}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Image Upload */}
//         <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-6 space-y-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-white font-semibold text-lg flex items-center gap-2">
//                 <ImageIcon className="w-5 h-5 text-[#2563EB]" />
//                 Images <span className="text-sm text-gray-400 font-normal">({images.length} uploaded)</span>
//               </h2>
//               <p className="text-gray-500 text-xs mt-1">Images are compressed to save storage space</p>
//             </div>
//             <button
//               type="button"
//               onClick={() => fileInputRef.current?.click()}
//               className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-all duration-300 flex items-center gap-2"
//             >
//               <Plus className="w-4 h-4" />
//               Upload
//             </button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => handleImageUpload(e.target.files)}
//               className="hidden"
//             />
//           </div>

//           {isUploading && (
//             <div className="mb-4">
//               <div className="flex items-center justify-between text-sm mb-2">
//                 <span className="text-gray-400">Uploading & Compressing...</span>
//                 <span className="text-[#2563EB]">{Math.round(uploadProgress)}%</span>
//               </div>
//               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
//                 <motion.div
//                   className="h-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-full"
//                   initial={{ width: 0 }}
//                   animate={{ width: `${uploadProgress}%` }}
//                   transition={{ duration: 0.3 }}
//                 />
//               </div>
//             </div>
//           )}

//           <div
//             ref={dropZoneRef}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#2563EB]/30 transition-all duration-300 cursor-pointer group"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🖼️</div>
//             <p className="text-gray-400 text-sm group-hover:text-white transition-colors duration-300">
//               Drag & drop images here or click to upload
//             </p>
//             <p className="text-gray-500 text-xs mt-1">
//               First image = thumbnail • PNG, JPG, WEBP • Max 10MB each • Auto-compressed
//             </p>
//           </div>

//           {images.length > 0 && (
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//               <AnimatePresence>
//                 {images.map((img, index) => (
//                   <motion.div
//                     key={img.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.8 }}
//                     transition={{ duration: 0.2 }}
//                     draggable
//                     onDragStart={(e) => handleDragStart(e, index)}
//                     onDragOver={(e) => handleDragOverImage(e, index)}
//                     onDragEnd={handleDragEnd}
//                     className={`relative group bg-white/5 rounded-xl overflow-hidden border-2 ${
//                       draggedIndex === index ? 'border-[#2563EB] opacity-50' : 'border-transparent'
//                     } ${index === 0 ? 'ring-2 ring-[#2563EB] ring-offset-2 ring-offset-black' : ''}`}
//                   >
//                     <img
//                       src={img.url}
//                       alt={`Image ${index + 1}`}
//                       className="w-full aspect-square object-cover"
//                     />

//                     {index === 0 && (
//                       <div className="absolute top-2 right-2 bg-[#2563EB] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
//                         THUMBNAIL
//                       </div>
//                     )}

//                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
//                       {index !== 0 && (
//                         <button
//                           type="button"
//                           onClick={() => setMainImage(img.id)}
//                           className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 text-sm"
//                           title="Set as thumbnail"
//                         >
//                           <Star className="w-4 h-4" />
//                         </button>
//                       )}
//                       <button
//                         type="button"
//                         onClick={() => removeImage(img.id)}
//                         className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300 text-sm"
//                         title="Remove image"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}
//         </div>

//         {/* Submit Buttons */}
//         <div className="flex gap-4">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             disabled={isSubmitting}
//             className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
//               isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[#2563EB]/30'
//             }`}
//           >
//             <Save className="w-4 h-4" />
//             {isSubmitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update Project' : 'Upload Project')}
//           </motion.button>
//           <button
//             type="button"
//             onClick={() => router.push('/admin/projects')}
//             className="px-6 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//       )}
//     </div>
//   );
// }