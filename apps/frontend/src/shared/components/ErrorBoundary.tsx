import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDetailsExpanded: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    isDetailsExpanded: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Production monitoring hook
    console.error('EBMS Application Runtime Exception Captured:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private toggleDetails = (): void => {
    this.setState((prev) => ({ isDetailsExpanded: !prev.isDetailsExpanded }));
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 text-foreground font-sans antialiased select-none">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header Icon & Branding */}
            <div className="flex items-center space-x-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Workspace Error Captured
                </h2>
                <p className="text-xs text-muted-foreground">
                  An unexpected exception interrupted the application workspace
                </p>
              </div>
            </div>

            {/* User Friendly Message */}
            <div className="rounded-lg bg-muted/40 p-4 border border-border/60 text-xs text-muted-foreground leading-relaxed">
              Don't worry, your business data and saved records remain fully secure in the database.
              Clicking below will safely reload your session workspace.
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-1">
              <Button
                onClick={this.handleReload}
                className="flex-1 h-10 text-xs font-semibold flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Workspace</span>
              </Button>
              <Button
                variant="outline"
                onClick={this.toggleDetails}
                className="h-10 text-xs font-medium flex items-center space-x-1.5 border-border/80"
              >
                <span>{this.state.isDetailsExpanded ? 'Hide Details' : 'View Details'}</span>
                {this.state.isDetailsExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>

            {/* Technical Stack Trace Drawer */}
            {this.state.isDetailsExpanded && (
              <div className="mt-4 rounded-lg border border-border/80 bg-muted p-3 text-[11px] font-mono text-destructive space-y-2 overflow-x-auto max-h-48">
                <p className="font-bold">{this.state.error?.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-tight">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
