import { Component } from 'react';

// Catches any render/runtime error in the tree below it so a single component
// fault never white-screens the whole site. Users get a recoverable message
// instead of a blank page, which keeps repeated refreshes safe.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    if (import.meta.env?.DEV) console.error('UI error boundary caught:', error, info);
  }
  handleReset = () => {
    // A common cause here is a failed lazy() chunk download, whose rejected
    // import promise React caches — so a plain state reset would immediately
    // re-throw. A full reload refetches the chunks and reliably recovers.
    if (typeof window !== 'undefined') window.location.reload();
    else this.setState({ hasError: false });
  };
  render() {
    if (this.state.hasError) {
      return (
        <section className="error-boundary" role="alert">
          <span className="eyebrow">SOMETHING WENT WRONG</span>
          <h1>This page hit an unexpected issue.</h1>
          <p>Your connection is safe. You can retry this page or return to the Crome India homepage.</p>
          <div className="error-boundary-actions">
            <button type="button" className="button button-primary" onClick={this.handleReset}>Try again</button>
            <a className="button button-light" href="/">Go to homepage</a>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
