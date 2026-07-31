"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ProfileDefaults {
  fullName: string;
  organisationName: string;
  email: string;
}

/**
 * Fetches the signed-in person's name, organisation and email address once, and
 * hands them to the caller so a tool can fill its opening fields in
 * automatically.
 *
 * Why this exists:
 * Each assessment tool used to start from a blank form and ask for the same
 * details all over again. WCAG 2.2 success criterion 3.3.7 Redundant Entry asks
 * that information already given is either filled in automatically or offered
 * for selection. Retyping the same details five times is tiring for anyone, and
 * a genuine barrier for people with limited hand movement, people who type with
 * one hand, people managing fatigue, and people using speech input.
 *
 * The caller decides which of these values are appropriate for its own fields.
 * That decision matters: in the Access Request Generator, for example, the
 * organisation being asked about is the one that made a decision AGAINST the
 * person, so the person's own organisation must NOT be filled in there.
 *
 * Every tool applies values only to fields that are still empty, so anything
 * already typed is never overwritten.
 */
export function useProfileDefaults(apply: (defaults: ProfileDefaults) => void) {
  // Held in a ref so that changing the callback between renders does not cause
  // the profile to be fetched again. This should happen once per tool.
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, organisation_name")
          .eq("id", user.id)
          .single();

        if (error || !data || cancelled) return;

        applyRef.current({
          fullName: data.full_name ?? "",
          organisationName: data.organisation_name ?? "",
          email: user.email ?? "",
        });
      } catch {
        // Filling fields in is a convenience. If it fails, the person can still
        // type the details themselves, so there is nothing useful to show them
        // and no reason to interrupt what they are doing.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
