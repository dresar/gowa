import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-950">
          <Card className="w-full max-w-md border-destructive/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">Waduh, Ada Masalah!</CardTitle>
              <CardDescription>
                Aplikasi mengalami kesalahan saat merender halaman ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-slate-100 dark:bg-slate-900 font-mono text-xs overflow-auto max-h-40 border">
                <p className="font-bold text-destructive mb-1">{this.state.error?.name}:</p>
                <p className="break-words">{this.state.error?.message}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Jangan khawatir, Anda bisa mencoba menyegarkan halaman atau kembali ke Dashboard.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Segarkan Halaman
              </Button>
              <Button variant="outline" onClick={this.handleReset} className="w-full">
                Kembali ke Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
