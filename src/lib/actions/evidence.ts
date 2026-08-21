"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/csv",
  "text/plain",
];

const VALID_STATUS = [
  "not_requested",
  "requested",
  "partially_received",
  "received",
  "refused",
  "appealed",
  "escalated",
  "not_applicable",
];

const VALID_EVIDENCE_STATE = [
  "established",
  "derived",
  "inferred",
  "unknown",
  "conflicted",
];

function safeFile(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
}

function back(id: string, msg: string, ok = true) {
  redirect(
    `/assessments/${id}/evidence?${ok ? "message" : "error"}=` +
      encodeURIComponent(msg)
  );
}

export async function addEvidence(formData: FormData) {
  const assessmentId = String(formData.get("assessment_id") ?? "");
  const documentName = String(formData.get("document_name") ?? "").trim();
  if (!assessmentId) redirect("/assessments");
  if (!documentName) back(assessmentId, "Please give the document a name.", false);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const status = String(formData.get("status") ?? "not_requested");
  const evidenceState = String(formData.get("evidence_state") ?? "unknown");

  const entry: Record<string, unknown> = {
    assessment_id: assessmentId,
    document_name: documentName,
    source: String(formData.get("source") ?? "").trim() || null,
    source_uri: String(formData.get("source_uri") ?? "").trim() || null,
    requested_from: String(formData.get("requested_from") ?? "").trim() || null,
    date_requested: String(formData.get("date_requested") ?? "") || null,
    date_received: String(formData.get("date_received") ?? "") || null,
    status: VALID_STATUS.includes(status) ? status : "not_requested",
    evidence_state: VALID_EVIDENCE_STATE.includes(evidenceState)
      ? evidenceState
      : "unknown",
    evidence_state_rationale:
      String(formData.get("evidence_state_rationale") ?? "").trim() || null,
    legal_basis: String(formData.get("legal_basis") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    follow_up_date: String(formData.get("follow_up_date") ?? "") || null,
    created_by: user.id,
  };

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    if (file.size > MAX_BYTES) {
      back(assessmentId, "That file is larger than 10 MB. Please upload a smaller file.", false);
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      back(
        assessmentId,
        "That file type is not allowed. Use PDF, Word, image, CSV or text files.",
        false
      );
    }
    const path = `${assessmentId}/${Date.now()}-${safeFile(file.name)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from("evidence")
      .upload(path, bytes, { contentType: file.type || "application/octet-stream" });
    if (upErr) {
      back(assessmentId, "We could not upload the file: " + upErr.message, false);
    }
    entry.file_path = path;
  }

  const { error } = await supabase.from("evidence_log_entries").insert(entry);
  if (error) back(assessmentId, error.message, false);

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "evidence_added",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: {
      document_name: documentName,
      evidence_state: entry.evidence_state,
    },
  });

  revalidatePath(`/assessments/${assessmentId}/evidence`);
  back(assessmentId, "Evidence entry saved.");
}

export async function updateEvidenceStatus(formData: FormData) {
  const assessmentId = String(formData.get("assessment_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!assessmentId || !id || !VALID_STATUS.includes(status)) {
    redirect(`/assessments/${assessmentId}/evidence`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("evidence_log_entries")
    .update({ status })
    .eq("id", id);
  if (error) back(assessmentId, error.message, false);

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "evidence_collection_status_updated",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: { evidence_id: id, status },
  });

  revalidatePath(`/assessments/${assessmentId}/evidence`);
  back(assessmentId, "Collection status updated.");
}

export async function updateEvidenceState(formData: FormData) {
  const assessmentId = String(formData.get("assessment_id") ?? "");
  const id = String(formData.get("id") ?? "");
  const evidenceState = String(formData.get("evidence_state") ?? "");
  const rationale = String(formData.get("evidence_state_rationale") ?? "").trim();

  if (!assessmentId || !id || !VALID_EVIDENCE_STATE.includes(evidenceState)) {
    redirect(`/assessments/${assessmentId}/evidence`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("evidence_log_entries")
    .update({
      evidence_state: evidenceState,
      evidence_state_rationale: rationale || null,
    })
    .eq("id", id);
  if (error) back(assessmentId, error.message, false);

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "evidence_state_updated",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: { evidence_id: id, evidence_state: evidenceState },
  });

  revalidatePath(`/assessments/${assessmentId}/evidence`);
  back(assessmentId, "Evidence state updated.");
}

export async function deleteEvidence(formData: FormData) {
  const assessmentId = String(formData.get("assessment_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!assessmentId || !id) redirect("/assessments");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("evidence_log_entries")
    .select("file_path")
    .eq("id", id)
    .single();

  if (row?.file_path) {
    await supabase.storage.from("evidence").remove([row.file_path]);
  }

  const { error } = await supabase.from("evidence_log_entries").delete().eq("id", id);
  if (error) back(assessmentId, error.message, false);

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "evidence_deleted",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: { id },
  });

  revalidatePath(`/assessments/${assessmentId}/evidence`);
  back(assessmentId, "Evidence entry deleted.");
}
