import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  key?: React.Key;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  declare state: Readonly<ErrorBoundaryState>;
  declare setState: React.Component<ErrorBoundaryProps, ErrorBoundaryState>['setState'];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught Error in Kundali App:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetState = (): void => {
    localStorage.clear();
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-rose-600/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-950 rounded-2xl border border-rose-800">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-rose-200">
                  Calculation Engine / UI Render Error
                </h1>
                <p className="text-xs text-rose-300/80">
                  त्रुटि देखा पर्यो (An unexpected error occurred during rendering)
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-rose-300 space-y-2 overflow-auto max-h-48">
              <div className="font-bold text-slate-200">
                Error Message: {this.state.error?.message || 'Unknown error'}
              </div>
              {this.state.error?.stack && (
                <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 text-xs text-amber-200 space-y-1">
              <p className="font-bold">सल्लाह (Recovery Suggestion):</p>
              <p className="text-amber-300/90">
                कृपया "रीलोड गर्नुहोस्" वा "डेटा रिसेट गर्नुहोस्" बटन थिचेर प्रणालीलाई सुचारु बनाउनुहोस्।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                पुनः प्रयास गर्नुहोस् (Try Again)
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                पुनः लोड गर्नुहोस् (Reload)
              </button>
              <button
                onClick={this.handleResetState}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
              >
                रिसेट (Reset)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
