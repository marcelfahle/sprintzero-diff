import deliverables from "../../deliverables.json";

export interface DeliverableProject {
  gistId: string;
  name: string;
  date?: string;
}

export interface DeliverableCustomer {
  name: string;
  default?: string;
  projects: Record<string, DeliverableProject>;
  branding?: {
    company?: string;
    accentColor?: string;
    accentColorLight?: string;
    accentColorDark?: string;
    url?: string;
    logo?: string;
  };
}

export type DeliverableRegistry = Record<string, DeliverableCustomer>;

const registry: DeliverableRegistry = deliverables;

export interface ResolvedSlug {
  gistId: string;
  customer?: DeliverableCustomer;
  project?: DeliverableProject;
}

const HEX_ID_RE = /^[0-9a-f]{20,32}$/;

export function resolveSlug(slugParts: string[]): ResolvedSlug | null {
  if (slugParts.length === 1) {
    const segment = slugParts[0];

    // Check customer slug with default project
    const customer = registry[segment];
    if (customer && customer.default) {
      const project = customer.projects[customer.default];
      if (project) {
        return { gistId: project.gistId, customer, project };
      }
    }

    // Raw hex gist ID (direct/dev access)
    if (HEX_ID_RE.test(segment)) {
      return { gistId: segment };
    }

    return null;
  }

  if (slugParts.length === 2) {
    const [customerSlug, projectSlug] = slugParts;
    const customer = registry[customerSlug];
    if (!customer) return null;

    const project = customer.projects[projectSlug];
    if (!project) return null;

    return { gistId: project.gistId, customer, project };
  }

  return null;
}

export function getCustomerByGistId(
  gistId: string,
): { customer: DeliverableCustomer; project: DeliverableProject } | null {
  for (const customer of Object.values(registry)) {
    for (const project of Object.values(customer.projects)) {
      if (project.gistId === gistId) {
        return { customer, project };
      }
    }
  }
  return null;
}
