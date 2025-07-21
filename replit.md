# Manga Panel Editor - PWA

## Overview
This is a Progressive Web Application (PWA) for editing manga panels with OCR text detection capabilities. The application allows users to upload manga images, automatically detect text regions using OCR technology, and edit the detected text with customizable styling options. Built as a full-stack TypeScript application with Express backend and React frontend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Component-based UI with type safety
- **Vite**: Development server and build tool with fast HMR
- **shadcn/ui**: Modern component library based on Radix UI primitives
- **TailwindCSS**: Utility-first styling with CSS variables for theming
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management and caching
- **PWA**: Service worker for offline functionality and app installation

### Backend Architecture
- **Express + TypeScript**: RESTful API server with type safety
- **In-memory Storage**: Simple storage implementation for development (easily replaceable)
- **File Upload**: Multer middleware for handling image uploads
- **Static File Serving**: Express static middleware for uploaded images

### Key Components

#### Canvas Editor System
- **Canvas-based Image Display**: HTML5 canvas for high-performance image rendering
- **Zoom and Pan Controls**: Interactive viewport with zoom in/out and fit-to-screen
- **Text Overlay System**: Draggable and selectable text boxes over the image
- **Responsive Design**: Mobile-first approach with touch-friendly controls

#### OCR Integration
- **Comic Text Detector**: Real manga/comic text detection using dmMaze/comic-text-detector
- **Python Microservice**: Separate Python service for OCR processing with Flask API
- **Automatic Fallback**: Falls back to mock data if Comic Text Detector unavailable
- **Confidence Scoring**: OCR results include confidence levels for detected text
- **Bounding Box Detection**: Precise text region coordinates for overlay positioning

#### Text Editing System
- **Rich Text Properties**: Font size, color, weight (bold/italic/underline)
- **Background Styling**: Optional background colors for text boxes
- **Real-time Updates**: Immediate visual feedback for text changes

## Data Flow

1. **Image Upload**: User uploads manga image via drag-drop or file picker
2. **Project Creation**: Server stores image and creates project record
3. **OCR Processing**: User triggers OCR to detect text regions automatically  
4. **Text Box Management**: Detected regions become editable text boxes
5. **Real-time Editing**: User modifies text content and styling properties
6. **State Persistence**: All changes saved to backend storage

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, Wouter for routing
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: TailwindCSS, class-variance-authority, clsx
- **State Management**: TanStack Query for server state

### Backend Dependencies
- **Server Framework**: Express with TypeScript support
- **File Handling**: Multer for image uploads, fs for file operations
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas with Drizzle integration

### Development Tools
- **Build System**: Vite with React plugin and development optimizations
- **TypeScript**: Full type safety across frontend and backend
- **Database**: Neon serverless PostgreSQL (configured but not yet connected)

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **Express Server**: API backend with middleware-mode Vite integration
- **File Storage**: Local uploads directory for image storage
- **In-memory Database**: Simple storage for rapid development iteration

### Termux Deployment (Mobile)
- **Fully Compatible**: Runs natively on Android via Termux
- **No External Dependencies**: Uses local file storage and in-memory database
- **Network Access**: Configurable host binding (0.0.0.0) for network access
- **Installation**: Simple npm commands work directly in Termux
- **Performance**: Optimized for mobile performance with canvas operations
- **Startup Command**: `npm run dev` or custom host binding

### Production Considerations
- **Build Process**: Vite builds optimized frontend bundle, esbuild bundles backend
- **Static Assets**: Uploaded images served via Express static middleware
- **Database Migration**: Drizzle configured for PostgreSQL with migration support
- **PWA Features**: Service worker for offline functionality and app installation

### Scalability Architecture
- **Database**: Ready to migrate from in-memory to PostgreSQL via Drizzle ORM
- **File Storage**: Can be replaced with cloud storage (S3, Cloudinary, etc.)
- **OCR Service**: Modular design allows easy integration with external OCR APIs
- **Caching**: TanStack Query provides client-side caching and background updates

The application is designed with a clear separation of concerns, making it easy to replace individual components (storage, OCR service, etc.) as requirements evolve from prototype to production deployment.