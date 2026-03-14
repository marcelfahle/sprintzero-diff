import { ExternalLink } from "lucide-react";

interface EngagementFooterProps {
  customerName?: string;
  projectName?: string;
  deliveryDate?: string;
  gistHtmlUrl: string;
}

export function EngagementFooter({
  customerName,
  projectName,
  deliveryDate,
  gistHtmlUrl,
}: EngagementFooterProps) {
  const hasMetadata = customerName || projectName || deliveryDate;

  return (
    <footer className="mt-12 border-t border-neutral-800 pt-6 pb-8">
      {hasMetadata && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <a
            href="https://sprintzero.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-300 transition-colors hover:text-sz-orange"
          >
            Sprint Zero
          </a>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
            {customerName && <span>{customerName}</span>}
            {customerName && projectName && (
              <span className="text-neutral-600">·</span>
            )}
            {projectName && <span>{projectName}</span>}
            {(customerName || projectName) && deliveryDate && (
              <span className="text-neutral-600">·</span>
            )}
            {deliveryDate && <span>{deliveryDate}</span>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span>
          Sprint Zero &middot; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
