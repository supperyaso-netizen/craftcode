// app/admin/projects/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import NewProjectPage from "../new/page";

export default function EditProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  
  // Pass the project ID to the NewProjectPage component
  return <NewProjectPage projectId={id} />;
}