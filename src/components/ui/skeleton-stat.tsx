import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonStat = () => {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-muted/50 to-transparent" />
      <CardContent className="relative p-6 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
};
