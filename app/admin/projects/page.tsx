"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, FolderOpen, Code, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  long_description?: string;
  status: 'published' | 'draft';
  technologies: string[];
  tags: string[];
  image_urls: string[];
  thumbnail_url: string;
  github_link: string;
  live_link: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }

      console.log("PROJECTS from Supabase:", data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      triggerToast('❌ Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== id));
      triggerToast('🗑️ Project deleted successfully', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      triggerToast('❌ Failed to delete project', 'error');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;

      const newStatus = project.status === 'published' ? 'draft' : 'published';
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
      
      triggerToast('✅ Status updated', 'success');
    } catch (error) {
      console.error('Status update error:', error);
      triggerToast('❌ Failed to update status', 'error');
    }
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleTags = (id: string) => {
    setShowAllTags(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 max-w-md ${
              showToast.type === 'success' ? 'bg-green-500/90' :
              showToast.type === 'error' ? 'bg-red-500/90' :
              'bg-[#2563EB]/90'
            } text-white`}
          >
            {showToast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your portfolio projects ({projects.length} total)
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/projects/new')}
          className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-[#2563EB]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-light">No projects yet</p>
          <button
            onClick={() => router.push('/admin/projects/new')}
            className="mt-4 px-6 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-all duration-300"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const isExpanded = expandedDescriptions[project.id] || false;
            const showAll = showAllTags[project.id] || false;
            const tags = project.tags || [];
            const displayTags = showAll ? tags : tags.slice(0, 3);
            const hasMoreTags = tags.length > 3;

            return (
              <div
                key={project.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-4 hover:border-[#2563EB]/30 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a] mt-1">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : project.image_urls && project.image_urls.length > 0 ? (
                      <img
                        src={project.image_urls[0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-white font-medium">{project.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'published' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Description with Show More/Less */}
                    <div className="mt-1">
                      <p className={`text-gray-400 text-sm ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {project.description || project.long_description}
                      </p>
                      {(project.description?.length > 100 || project.long_description?.length > 100) && (
                        <button
                          onClick={() => toggleDescription(project.id)}
                          className="text-xs text-[#2563EB] hover:text-[#3B82F6] transition-colors mt-1 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>Show Less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Show More <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {displayTags.map((tag, index) => (
                          <span key={index} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                            #{tag}
                          </span>
                        ))}
                        {hasMoreTags && (
                          <button
                            onClick={() => toggleTags(project.id)}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-colors"
                          >
                            {showAll ? 'Show Less' : `+${tags.length - 3} more`}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((tech: string) => (
                          <span key={tech} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/20 flex items-center gap-1">
                            <Code className="w-2.5 h-2.5" />
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-gray-500 text-xs mt-2">{project.category}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStatus(project.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                      title={project.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {project.status === 'published' ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/projects/${project.id}`)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-300"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

















// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { Plus, Edit, Trash2, Eye, EyeOff, FolderOpen, Code, ChevronDown, ChevronUp } from "lucide-react";
// import { supabase } from "@/lib/supabase/client";

// interface Project {
//   id: string;
//   title: string;
//   slug: string;
//   category: string;
//   description: string;
//   long_description?: string;
//   status: 'published' | 'draft';
//   technologies: string[];
//   tags: string[];
//   images: any[];
//   thumbnail_url?: string;
//   image_urls?: string[];
//   github_link?: string;
//   live_link?: string;
//   sort_order?: number;
//   created_at: string;
//   updated_at?: string;
// }

// export default function AdminProjectsPage() {
//   const router = useRouter();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);
//   const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
//   const [showAllTags, setShowAllTags] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     setIsLoading(true);

//     try {
//       const { data, error } = await supabase
//         .from('projects')
//         .select('*')
//         .order('sort_order', { ascending: true });

//       if (error) {
//         console.error('Supabase fetch error:', error);
//         throw error;
//       }

//       console.log("PROJECTS from Supabase:", data);
      
//       // Map Supabase fields to frontend format
//       const mappedProjects = data.map((project: any) => ({
//         id: project.id,
//         title: project.title,
//         slug: project.slug || project.title?.toLowerCase().replace(/\s+/g, '-') || '',
//         category: project.category || '',
//         description: project.description || '',
//         long_description: project.long_description,
//         status: project.status || 'draft',
//         technologies: project.technologies || [],
//         tags: project.tags || [],
//         images: project.image_urls ? project.image_urls.map((url: string) => ({ imageData: url })) : [],
//         thumbnail_url: project.thumbnail_url,
//         image_urls: project.image_urls || [],
//         github_link: project.github_link,
//         live_link: project.live_link,
//         sort_order: project.sort_order || 0,
//         created_at: project.created_at,
//         updated_at: project.updated_at,
//       }));

//       setProjects(mappedProjects);
//     } catch (error) {
//       console.error('Error loading projects:', error);
//       setProjects([]);
//       triggerToast('❌ Failed to load projects', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteProject = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this project?')) return;

//     try {
//       const { error } = await supabase
//         .from('projects')
//         .delete()
//         .eq('id', id);

//       if (error) throw error;

//       setProjects(projects.filter(p => p.id !== id));
//       triggerToast('🗑️ Project deleted successfully', 'success');
//     } catch (error) {
//       console.error('Delete error:', error);
//       triggerToast('❌ Failed to delete project', 'error');
//     }
//   };

//   const toggleStatus = async (id: string) => {
//     try {
//       const project = projects.find(p => p.id === id);
//       if (!project) return;

//       const newStatus = project.status === 'published' ? 'draft' : 'published';
      
//       const { error } = await supabase
//         .from('projects')
//         .update({ 
//           status: newStatus,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', id);

//       if (error) throw error;

//       setProjects(projects.map(p => 
//         p.id === id ? { ...p, status: newStatus } : p
//       ));
      
//       triggerToast('✅ Status updated', 'success');
//     } catch (error) {
//       console.error('Status update error:', error);
//       triggerToast('❌ Failed to update status', 'error');
//     }
//   };

//   const toggleDescription = (id: string) => {
//     setExpandedDescriptions(prev => ({
//       ...prev,
//       [id]: !prev[id]
//     }));
//   };

//   const toggleTags = (id: string) => {
//     setShowAllTags(prev => ({
//       ...prev,
//       [id]: !prev[id]
//     }));
//   };

//   const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
//     setShowToast({ message, type });
//     setTimeout(() => setShowToast(null), 3000);
//   };

//   return (
//     <div className="max-w-7xl mx-auto">
//       <AnimatePresence>
//         {showToast && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 max-w-md ${
//               showToast.type === 'success' ? 'bg-green-500/90' :
//               showToast.type === 'error' ? 'bg-red-500/90' :
//               'bg-[#2563EB]/90'
//             } text-white`}
//           >
//             {showToast.message}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
//           <p className="text-gray-400 text-sm mt-1">
//             Manage your portfolio projects ({projects.length} total)
//           </p>
//         </div>
//         <button
//           onClick={() => router.push('/admin/projects/new')}
//           className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-all duration-300 flex items-center gap-2"
//         >
//           <Plus className="w-4 h-4" />
//           New Project
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="text-center py-20">
//           <div className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-[#2563EB]" />
//         </div>
//       ) : projects.length === 0 ? (
//         <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
//           <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//           <p className="text-gray-400 font-light">No projects yet</p>
//           <button
//             onClick={() => router.push('/admin/projects/new')}
//             className="mt-4 px-6 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-all duration-300"
//           >
//             Create your first project
//           </button>
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {projects.map((project) => {
//             const isExpanded = expandedDescriptions[project.id] || false;
//             const showAll = showAllTags[project.id] || false;
//             const tags = project.tags || [];
//             const displayTags = showAll ? tags : tags.slice(0, 3);
//             const hasMoreTags = tags.length > 3;

//             return (
//               <div
//                 key={project.id}
//                 className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-4 hover:border-[#2563EB]/30 transition-all duration-300 group"
//               >
//                 <div className="flex items-start gap-4">
//                   {/* Thumbnail */}
//                   <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a] mt-1">
//                     {project.thumbnail_url ? (
//                       <img
//                         src={project.thumbnail_url}
//                         alt={project.title}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : project.images && project.images.length > 0 && project.images[0]?.imageData ? (
//                       <img
//                         src={project.images[0].imageData}
//                         alt={project.title}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
//                         No img
//                       </div>
//                     )}
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-3 flex-wrap">
//                       <h3 className="text-white font-medium">{project.title}</h3>
//                       <span className={`text-xs px-2 py-0.5 rounded-full ${
//                         project.status === 'published' 
//                           ? 'bg-green-500/20 text-green-400' 
//                           : 'bg-yellow-500/20 text-yellow-400'
//                       }`}>
//                         {project.status}
//                       </span>
//                     </div>

//                     {/* Description with Show More/Less */}
//                     <div className="mt-1">
//                       <p className={`text-gray-400 text-sm ${!isExpanded ? 'line-clamp-2' : ''}`}>
//                         {project.description || project.long_description}
//                       </p>
//                       {(project.description?.length > 100 || project.long_description?.length > 100) && (
//                         <button
//                           onClick={() => toggleDescription(project.id)}
//                           className="text-xs text-[#2563EB] hover:text-[#3B82F6] transition-colors mt-1 flex items-center gap-1"
//                         >
//                           {isExpanded ? (
//                             <>Show Less <ChevronUp className="w-3 h-3" /></>
//                           ) : (
//                             <>Show More <ChevronDown className="w-3 h-3" /></>
//                           )}
//                         </button>
//                       )}
//                     </div>

//                     {/* Tags */}
//                     {tags.length > 0 && (
//                       <div className="mt-2 flex flex-wrap gap-1.5">
//                         {displayTags.map((tag, index) => (
//                           <span key={index} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
//                             #{tag}
//                           </span>
//                         ))}
//                         {hasMoreTags && (
//                           <button
//                             onClick={() => toggleTags(project.id)}
//                             className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-colors"
//                           >
//                             {showAll ? 'Show Less' : `+${tags.length - 3} more`}
//                           </button>
//                         )}
//                       </div>
//                     )}

//                     {/* Technologies */}
//                     {project.technologies && project.technologies.length > 0 && (
//                       <div className="mt-2 flex flex-wrap gap-1.5">
//                         {project.technologies.slice(0, 4).map((tech: string) => (
//                           <span key={tech} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/20 flex items-center gap-1">
//                             <Code className="w-2.5 h-2.5" />
//                             {tech}
//                           </span>
//                         ))}
//                         {project.technologies.length > 4 && (
//                           <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
//                             +{project.technologies.length - 4}
//                           </span>
//                         )}
//                       </div>
//                     )}

//                     <p className="text-gray-500 text-xs mt-2">{project.category}</p>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex items-center gap-2 flex-shrink-0">
//                     <button
//                       onClick={() => toggleStatus(project.id)}
//                       className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
//                       title={project.status === 'published' ? 'Unpublish' : 'Publish'}
//                     >
//                       {project.status === 'published' ? (
//                         <Eye className="w-4 h-4" />
//                       ) : (
//                         <EyeOff className="w-4 h-4" />
//                       )}
//                     </button>
//                     <button
//                       onClick={() => router.push(`/admin/projects/${project.id}`)}
//                       className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
//                       title="Edit"
//                     >
//                       <Edit className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => deleteProject(project.id)}
//                       className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-300"
//                       title="Delete"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }