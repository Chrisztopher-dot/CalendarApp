import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold text-white">Något gick fel / Something went wrong</h1>
                <p className="text-xs text-slate-400">LifeAtlas stötte på ett oväntat fel.</p>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-xs font-mono text-red-300 overflow-x-auto max-h-48">
              {this.state.error?.toString()}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5"
                title="Rensa cache och ladda om"
              >
                <LogOut className="w-4 h-4" />
                <span>Rensa session</span>
              </button>

              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ladda om / Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
