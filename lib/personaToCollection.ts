export type Persona = "founder" | "developer" | "creator" | "student" | "other";

export function getDefaultCollectionSlugForPersona(persona: Persona | null | undefined | string): string | null {
  if (!persona) return null;
  
  // Normalize string to lower case just in case
  const p = persona.toLowerCase();
  
  switch (p) {
    case "founder":
    case "founders":
      return "founder-focus-stack";
    case "developer":
    case "developers":
      return "deep-work-dev-stack";
    case "creator":
    case "creators":
      return "creator-studio-stack";
    case "student":
    case "students":
      return "student-study-stack";
    default:
      return null;
  }
}

