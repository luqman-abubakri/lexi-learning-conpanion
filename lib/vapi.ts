export const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export function isVapiConfigured() {
  return Boolean(VAPI_PUBLIC_KEY);
}
