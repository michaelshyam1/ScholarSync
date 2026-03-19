import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar } from 'lucide-react';
import type { Scholarship } from '@/types/Scholarship';
import Image from 'next/image';
import Link from 'next/link';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  showApplyButton?: boolean;
  showDetailsButton?: boolean;
}

export function ScholarshipCard({
  scholarship,
  showApplyButton = true,
  showDetailsButton = false,
}: ScholarshipCardProps) {
  return (
    <Card
      className={
        'relative flex flex-col shadow-md border-2 transition-transform hover:scale-[1.02] ' +
        (scholarship.recommended
          ? 'border-yellow-400 bg-yellow-50/40'
          : 'border-primary/10 bg-white')
      }
    >
      {/* Image or Icon */}
      {scholarship.scholarship_image ? (
        <Image
          src={scholarship.scholarship_image}
          alt={scholarship.scholarship_name}
          width={600}
          height={128}
          className="w-full h-32 object-cover rounded-t-md"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center bg-primary/10 rounded-t-md">
          <GraduationCap className="text-primary size-12" />
        </div>
      )}

      {/* Recommended Badge */}
      {scholarship.recommended && (
        <span className="absolute top-3 right-3 bg-yellow-400 text-xs px-3 py-1 rounded shadow font-semibold z-10">
          AI Recommended
        </span>
      )}

      <CardHeader className="flex flex-col gap-1 pb-2 pt-2">
        <CardTitle className="text-lg font-bold">{scholarship.scholarship_name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>Deadline: {scholarship.scholarship_deadline || 'N/A'}</span>
        </div>
        <div className="text-sm text-gray-600 line-clamp-3">
          {scholarship.scholarship_description}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {scholarship.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
        {showDetailsButton && (
          <Button
            className="mt-3 w-full"
            variant={scholarship.recommended ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={`/scholarships/${scholarship.id}`}>
              View Details
            </Link>
          </Button>
        )}
        {showApplyButton && (
          <Button
            className="mt-3 w-full"
            variant={scholarship.recommended ? 'default' : 'outline'}
            size="sm"
            disabled={!scholarship.scholarship_url}
            asChild
          >
            <Link href={`/apply/${scholarship.id}`}>
              Apply
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ScholarshipCard; 