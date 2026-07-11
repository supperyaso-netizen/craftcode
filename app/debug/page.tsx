"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { projectDB } from "@/lib/db";

export default function DebugPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        // Check Supabase connection
        console.log("🔍 Checking Supabase connection...");
        console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing");

        // Try to fetch from Supabase directly
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .limit(5);

        if (error) {
          console.error("❌ Supabase error:", error);
          setSupabaseStatus({ error: error.message });
        } else {
          console.log("✅ Supabase data:", data);
          setSupabaseStatus({ success: true, count: data?.length || 0 });
        }

        // Try to fetch from projectDB
        try {
          const allProjects = await projectDB.getAll();
          console.log("✅ projectDB projects:", allProjects);
          setProjects(allProjects);
        } catch (e: any) {
          console.error("❌ projectDB error:", e);
        }

      } catch (e: any) {
        console.error("❌ Error:", e);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Page</h1>
      
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold">Supabase Status</h2>
        <pre className="text-xs text-gray-400 mt-2">
          {JSON.stringify(supabaseStatus, null, 2)}
        </pre>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <h2 className="text-lg font-semibold">Projects ({projects.length})</h2>
        <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-96">
          {JSON.stringify(projects, null, 2)}
        </pre>
      </div>

      <button
        onClick={async () => {
          const result = await projectDB.getAll();
          console.log("Manual fetch:", result);
          setProjects(result);
        }}
        className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
      >
        Refresh Data
      </button>
    </div>
  );
}