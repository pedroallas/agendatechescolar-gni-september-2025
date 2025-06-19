import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface ResourceApprovalBadgeProps {
  requiresApproval: boolean;
  className?: string;
}

export function ResourceApprovalBadge({
  requiresApproval,
  className,
}: ResourceApprovalBadgeProps) {
  if (requiresApproval) {
    return (
      <Badge
        variant="secondary"
        className={`bg-orange-100 text-orange-800 ${className}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        Requer Aprovação
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`bg-green-100 text-green-800 ${className}`}
    >
      <CheckCircle className="h-3 w-3 mr-1" />
      Auto-confirmado
    </Badge>
  );
}
