import { AuditLog } from "./auditLog";

export const defaultFormData = {
  scene: {
    safety: "",
    risks: [] as string[],
    patients: "",
    support: [] as string[],
    access: "",
  },
  primary: {
    consciousness: "",
    breathing: "",
    circulation: "",
    actions: [] as string[],
  },
  complaints: {} as Record<string, string[]>,
  vitals: {
    sbp: "",
    dbp: "",
    hr: "",
    rr: "",
    spo2: "",
    bt: "",
    bst: "",
    nrs: "",
  },
  sample: { S: "", A: "", M: "", P: "", L: "", E: "" },
  customComplaint: "",
  auditLogs: [] as AuditLog[],
};

export function normalizeEmergencyRecord(raw: any) {
  if (!raw) return defaultFormData;

  return {
    ...defaultFormData,
    scene: {
      ...defaultFormData.scene,
      ...(raw.scene ?? {}),
      risks: Array.isArray(raw.scene?.risks) ? raw.scene.risks : [],
      support: Array.isArray(raw.scene?.support) ? raw.scene.support : [],
    },
    primary: {
      ...defaultFormData.primary,
      ...(raw.primary ?? {}),
      actions: Array.isArray(raw.primary?.actions) ? raw.primary.actions : [],
    },
    complaints: typeof raw.complaints === 'object' && raw.complaints !== null ? raw.complaints : {},
    vitals: {
      ...defaultFormData.vitals,
      ...(raw.vitals ?? {}),
    },
    sample: {
      ...defaultFormData.sample,
      ...(raw.sample ?? {}),
    },
    customComplaint: raw.customComplaint ?? "",
    auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs : [],
  };
}

export function safeParse(json: string | null) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error("JSON_PARSE_ERROR", e);
    return null;
  }
}
