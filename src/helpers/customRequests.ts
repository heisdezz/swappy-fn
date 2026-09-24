export interface CustomRequestBody {
  title: string;
  itemType: string;
  description: string;
  colors?: string;
  measurements?: string;
  eventDate?: string;
  budget?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export function parseRequestBody(body: string | undefined): CustomRequestBody {
  if (!body) {
    return { title: "Custom Request", itemType: "Custom Order", description: "" };
  }
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object") {
      return {
        title: parsed.title || "Custom Request",
        itemType: parsed.itemType || "Custom Order",
        description: parsed.description || "",
        colors: parsed.colors,
        measurements: parsed.measurements,
        eventDate: parsed.eventDate,
        budget: parsed.budget,
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail,
        contactPhone: parsed.contactPhone,
      };
    }
  } catch {
    // Plain text fallback
  }
  return {
    title: "Custom Request",
    itemType: "Custom Order",
    description: body,
  };
}
