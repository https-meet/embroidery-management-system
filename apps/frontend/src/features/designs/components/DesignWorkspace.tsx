import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Edit2, Archive, Calendar, FileCode, Layers, Maximize2, FileText, ExternalLink } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { DesignDto } from '../types/design.types';

export interface DesignWorkspaceProps {
  design: DesignDto;
  onArchiveClick: () => void;
}

const WorkspacePreviewImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-primary shrink-0">
        <Palette className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-16 w-16 rounded-lg border object-cover shrink-0"
    />
  );
};

export const DesignWorkspace: React.FC<DesignWorkspaceProps> = ({
  design,
  onArchiveClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          {design.previewUrl ? (
            <WorkspacePreviewImage src={design.previewUrl} alt={design.name} />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-primary shrink-0">
              <Palette className="h-8 w-8" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{design.name}</h2>
              <StatusBadge status={design.isActive ? 'COMPLETED' : 'CANCELLED'} />
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {design.designCode} • {design.category || 'Uncategorized'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`${ROUTES.DESIGNS.DETAIL(design.id)}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
              <Edit2 className="h-4 w-4" />
              <span>Edit Design</span>
            </Button>
          </Link>
          {design.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveClick}
              className="flex items-center space-x-1.5 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Technical Specs Card */}
        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground border-b pb-2">
            Technical Specifications
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start space-x-3 rounded-lg border bg-muted/30 p-3">
              <Layers className="h-4 w-4 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Stitch Count</p>
                <p className="text-sm font-bold font-mono text-foreground">
                  {design.stitchCount !== null ? design.stitchCount.toLocaleString('en-IN') : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border bg-muted/30 p-3">
              <Maximize2 className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Dimensions (W × H)</p>
                <p className="text-xs font-semibold text-foreground">
                  {design.widthMm && design.heightMm
                    ? `${design.widthMm}mm × ${design.heightMm}mm`
                    : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border bg-muted/30 p-3">
              <Palette className="h-4 w-4 text-purple-500 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Color Count</p>
                <p className="text-sm font-bold text-foreground">
                  {design.colorCount !== null ? `${design.colorCount} colors` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Description & Files */}
          <div className="border-t pt-4 space-y-4">
            {design.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-xs text-foreground">{design.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start space-x-3">
                <FileCode className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Machine File</p>
                  {design.primaryFileUrl ? (
                    <a
                      href={design.primaryFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium text-primary hover:underline mt-0.5"
                    >
                      <span>Download file</span>
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">No file attached</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Created Date</p>
                  <p className="text-xs font-medium text-foreground">
                    {formatDate(design.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {design.notes && (
              <div className="border-t pt-3 flex items-start space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Machine Setup & Notes</p>
                  <p className="text-xs text-foreground whitespace-pre-line mt-0.5">{design.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
              Catalog Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono font-medium text-foreground">{design.designCode}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">{design.category || 'General'}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-foreground">
                  {design.isActive ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
