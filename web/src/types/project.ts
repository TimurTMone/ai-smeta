export type ProjectKind = "smeta" | "deck";
export type ProjectStatus = "draft" | "processing" | "ready" | "error";

export type Project = {
  id: string;
  org_id: string;
  kind: ProjectKind;
  name: string;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  preview_image_url: string | null;
};
