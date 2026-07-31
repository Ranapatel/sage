'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    console.warn('[Clerk] Caught Clerk runtime loading error:', error.message)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[Clerk] Script or CDN load failure caught:', error.message, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>
    }
    return this.props.children
  }
}

export default ClerkErrorBoundary
