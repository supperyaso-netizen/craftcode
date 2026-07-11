// // lib/db.ts
// import { supabase } from './supabase';

// export interface DBProject {
//   id: string;
//   title: string;
//   slug: string;
//   category: string;
//   description: string;
//   longDescription?: string;
//   technologies: string[];
//   tags: string[];
//   githubLink?: string;
//   liveLink?: string;
//   status: 'published' | 'draft';
//   featured?: boolean;
//   icon?: string;
//   thumbnail?: string;
//   images: any[];
//   order?: number;
//   views?: number;
//   createdAt?: string;
//   updatedAt?: string;
// }

// function toDbRow(project: any) {
//   return {
//     id: project.id,
//     title: project.title,
//     slug: project.slug,
//     category: project.category,
//     description: project.description,
//     long_description: project.longDescription ?? null,
//     technologies: project.technologies ?? [],
//     tags: project.tags ?? [],
//     github_link: project.githubLink ?? null,
//     live_link: project.liveLink ?? null,
//     status: project.status ?? 'draft',
//     featured: project.featured ?? false,
//     icon: project.icon ?? null,
//     thumbnail: project.thumbnail ?? null,
//     images: project.images ?? [],
//     sort_order: project.order ?? 0,
//     views: project.views ?? 0,
//     updated_at: new Date().toISOString(),
//   };
// }

// function fromDbRow(row: any): DBProject {
//   return {
//     id: row.id,
//     title: row.title,
//     slug: row.slug,
//     category: row.category,
//     description: row.description,
//     longDescription: row.long_description,
//     technologies: row.technologies || [],
//     tags: row.tags || [],
//     githubLink: row.github_link,
//     liveLink: row.live_link,
//     status: row.status,
//     featured: row.featured,
//     icon: row.icon,
//     thumbnail: row.thumbnail,
//     images: row.images || [],
//     order: row.sort_order,
//     views: row.views,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//   };
// }

// export class ProjectDB {
//  async getAll(): Promise<DBProject[]> {
//   console.log("========== GET ALL START ==========");
//   console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

//   const { data, error } = await supabase
//   .from("projects")
//   .select("*")
//   .order("sort_order", { ascending: true });

//   console.log("DATA:", data);
//   console.log("ERROR:", error);

//   if (error) {
//     console.error(error);
//     throw new Error(error.message);
//   }

//   return (data ?? []).map(fromDbRow);
// }

//   async getById(id: string): Promise<DBProject | null> {
//     const { data, error } = await supabase
//       .from("projects")
//       .select("*")
//       .eq("id", id)
//       .maybeSingle();

//     if (error) {
//       console.error("projectDB.getById error:", error);
//       throw new Error(error.message);
//     }

//     return data ? fromDbRow(data) : null;
//   }

//   async save(project: DBProject): Promise<void> {
//     if (!project.id) {
//       throw new Error("project.id is required");
//     }

//     const row = toDbRow(project);
//     const existing = await this.getById(project.id);

//     if (existing) {
//       const { error } = await supabase
//         .from("projects")
//         .update(row)
//         .eq("id", project.id);

//       if (error) {
//         console.error("Update Error:", error);
//         throw new Error(error.message);
//       }

//       return;
//     }

//     const { error } = await supabase
//       .from("projects")
//       .insert({
//         ...row,
//         created_at: new Date().toISOString(),
//       });

//     if (error) {
//       console.error("Insert Error:", error);
//       throw new Error(error.message);
//     }
//   }

//   async delete(id: string): Promise<void> {
//     const { error } = await supabase
//       .from("projects")
//       .delete()
//       .eq("id", id);

//     if (error) {
//       console.error("Delete Error:", error);
//       throw new Error(error.message);
//     }
//   }

//   async clear(): Promise<void> {
//     const { error } = await supabase
//       .from("projects")
//       .delete()
//       .neq("id", "__never_matches__");

//     if (error) {
//       console.error("Clear Error:", error);
//       throw new Error(error.message);
//     }
//   }
// }

// export const projectDB = new ProjectDB();














import { supabase } from './supabase/client';

export interface DBProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  tags: string[];
  githubLink?: string;
  liveLink?: string;
  status: 'published' | 'draft';
  featured?: boolean;
  icon?: string;
  thumbnail?: string;
  images: any[];
  order?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

function toDbRow(project: any) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    description: project.description,
    long_description: project.longDescription ?? null,
    technologies: project.technologies ?? [],
    tags: project.tags ?? [],
    github_link: project.githubLink ?? null,
    live_link: project.liveLink ?? null,
    status: project.status ?? 'draft',
    featured: project.featured ?? false,
    icon: project.icon ?? null,
    thumbnail: project.thumbnail ?? null,
    images: project.images ?? [],
    sort_order: project.order ?? 0,
    views: project.views ?? 0,
    updated_at: new Date().toISOString(),
  };
}

function fromDbRow(row: any): DBProject {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    description: row.description,
    longDescription: row.long_description,
    technologies: row.technologies || [],
    tags: row.tags || [],
    githubLink: row.github_link,
    liveLink: row.live_link,
    status: row.status,
    featured: row.featured,
    icon: row.icon,
    thumbnail: row.thumbnail,
    images: row.images || [],
    order: row.sort_order,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ProjectDB {
  async getAll(): Promise<DBProject[]> {
    console.log("========== GET ALL START ==========");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    return (data ?? []).map(fromDbRow);
  }

  async getById(id: string): Promise<DBProject | null> {
    console.log("========== GET BY ID START ==========");
    console.log("ID:", id);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      console.error("projectDB.getById error:", error);
      throw new Error(error.message);
    }

    return data ? fromDbRow(data) : null;
  }

  async save(project: DBProject): Promise<void> {
    console.log("========== SAVE START ==========");
    console.log("Project:", project);

    if (!project.id) {
      throw new Error("project.id is required");
    }

    const row = toDbRow(project);
    const existing = await this.getById(project.id);

    if (existing) {
      console.log("Updating existing project...");
      const { error } = await supabase
        .from("projects")
        .update(row)
        .eq("id", project.id);

      if (error) {
        console.error("Update Error:", error);
        throw new Error(error.message);
      }

      console.log("✅ Update successful!");
      return;
    }

    console.log("Creating new project...");
    const { error } = await supabase
      .from("projects")
      .insert({
        ...row,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Insert Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Insert successful!");
  }

  async delete(id: string): Promise<void> {
    console.log("========== DELETE START ==========");
    console.log("ID:", id);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Delete successful!");
  }

  async clear(): Promise<void> {
    console.log("========== CLEAR START ==========");
    
    const { error } = await supabase
      .from("projects")
      .delete()
      .neq("id", "__never_matches__");

    if (error) {
      console.error("Clear Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Clear successful!");
  }
}

export const projectDB = new ProjectDB();