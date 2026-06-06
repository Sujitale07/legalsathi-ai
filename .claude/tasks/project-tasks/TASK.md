LegalSathi AI — Full Stack Task Breakdown (Detailed)
PHASE 1 — Project Setup
1.1 Initialize Next.js Project
Create a new Next.js application using the App Router setup
Enable TypeScript support
Enable Tailwind CSS for styling
Enable ESLint for code quality checks
Configure src directory usage (or not, depending on your setup choice)
Set import alias configuration for cleaner imports
Navigate into the newly created project directory
1.2 Install Required Dependencies
Install AI SDK for backend AI integration
Install Anthropic SDK for Claude API access
Install PDF parsing library for reading uploaded contracts
Install Lucide React icon library for UI icons
Install utility class merging library for conditional styling
Install TypeScript type definitions for PDF parsing
1.3 Setup Project Folder Structure
Create application routes for:
Chat system
Contract review system
Lawyer profile dynamic pages
API routes for chat processing
API routes for contract review processing
Create shared folders for:
UI components
Static/mock data
Utility helper functions
Public assets (images, icons, etc.)
1.4 Environment Configuration
Create environment file for local development secrets
Add Anthropic API key variable placeholder
Ensure environment file is excluded from version control
1.5 Git Configuration
Ensure environment files are ignored in version control
Verify .gitignore includes sensitive files
Prepare repository for safe deployment
1.6 Verify Development Setup
Start development server
Confirm application runs without errors
Validate default Next.js homepage loads correctly
Ensure no missing dependency issues exist
PHASE 2 — Core Architecture Setup
2.1 AI Client Configuration (Claude Integration)
Initialize Anthropic client wrapper module
Configure API key loading from environment variables
Define model selection for AI responses
Create centralized system prompt for LegalSathi AI behavior
Ensure system prompt includes:
Nepal-specific legal knowledge context
Structured response formatting rules
Disclaimer enforcement requirement
Hallucination prevention rules (no fake case law)
2.2 Lawyer Dataset Setup
Create structured data model for lawyer profiles
Define required fields such as:
Identity information (name, ID, photo)
Professional specialization areas
Geographic location
Experience level
Languages spoken
Fee ranges
Ratings and reviews
Biography and education
Contact details
Featured status
Populate dataset with multiple realistic lawyer profiles
Ensure variation in:
Specialization types
Locations across Nepal
Experience levels
Pricing tiers
Create helper lists for:
Specialization filters
Location filters
2.3 Navigation System (Navbar)
Create persistent top navigation bar
Add brand identity section with logo and name
Add navigation links for:
Legal Q&A Chat
Contract Review tool
Lawyer directory
Implement active state highlighting for current page
Add call-to-action button for immediate AI chat access
Implement responsive behavior:
Desktop full menu
Mobile collapsible menu
Add mobile menu toggle behavior
2.4 Footer System
Create structured footer layout
Add brand summary section
Add quick links to main features
Add disclaimer section clarifying legal limitations
Ensure responsive grid layout
Add copyright notice
2.5 Global Layout Setup
Wrap all pages with consistent layout structure
Apply global styling and font configuration
Ensure navigation is always visible
Ensure footer persists on all pages
Maintain spacing to prevent overlap with fixed navbar
PHASE 3 — Landing Page Development
3.1 Hero Section
Create main landing hero section
Define core value proposition messaging
Add primary heading emphasizing legal simplification
Add supporting description explaining platform purpose
Include primary call-to-action button (start chat)
Include secondary CTA (contract review tool)
Add visual styling using gradient background
Ensure mobile responsiveness
3.2 Feature Highlight Section
Define 3 core platform features:
AI Legal Question Assistant
Contract Review System
Lawyer Discovery Platform
For each feature:
Add icon representation
Add title
Add descriptive explanation
Add navigation link
Add hover interaction effects
Ensure grid responsiveness
3.3 Platform Statistics Section
Create numeric credibility indicators
Display:
Total legal questions answered
Total contracts analyzed
Total lawyers listed
Estimated user reach
Ensure animated or visually prominent display
Maintain consistent styling
3.4 Use Case / Trust Section
Define categories of legal problems platform solves:
Business registration
Rental disputes
Employment issues
Land/property conflicts
Family disputes
Criminal cases
Immigration issues
Startup contracts
Display as visually grouped tags or chips
3.5 Value Proposition Section
Explain why platform is useful
Emphasize:
Speed of legal answers
Nepal-specific legal grounding
Accessibility for non-lawyers
Add 3 key benefits:
Instant responses
Legal system awareness
Simple language output
Add icon-based visual support
3.6 Final Call-to-Action Section
Add final conversion section
Encourage user to start legal query
Reinforce value of instant AI assistance
Add strong CTA button leading to chat system
PHASE 4 — AI Chat System (Legal Q&A)
4.1 Chat API Backend
Create API endpoint for chat processing
Accept user message history
Forward messages to Claude model
Apply system prompt consistently
Enable streaming response output
Convert AI streaming output into readable text stream
Handle error cases gracefully
Ensure response format consistency
4.2 Chat UI System
Create chat page layout
Display conversation history
Separate user messages and AI responses visually
Add avatar indicators for both roles
Add loading state indicator while AI is responding
Auto-scroll to latest message
Maintain conversation state locally
4.3 Input Handling System
Create text input box for user questions
Allow message submission via:
Send button click
Enter key press
Prevent empty submissions
Disable input during AI response generation
Clear input after submission
4.4 Suggestion System
Display predefined legal question suggestions
Allow one-click insertion of sample queries
Ensure suggestions disappear after conversation starts
4.5 UX Enhancements
Add disclaimer banner explaining AI limitations
Add “Find a Lawyer” suggestion after multiple messages
Ensure smooth streaming text animation
Handle API failure fallback response
PHASE 5 — Contract Review System
5.1 Contract Analysis API
Create API endpoint for contract review
Accept raw contract text input
Validate minimum input length
Send contract to AI model
Enforce strict JSON-only output format
Parse AI response safely
Handle invalid JSON responses gracefully
Return structured analysis object
5.2 Contract Upload System
Allow file upload input
Support text-based contract files
Extract text content from uploaded file
Allow manual paste fallback input
Bind extracted text to analysis system
5.3 Contract Review UI
Create dedicated contract review page
Build text input area for contracts
Add upload button for files
Add analyze button for AI processing
Show loading state during analysis
Display error messages clearly
5.4 Results Display System
Show contract summary
Display risk level indicator
Render key clauses in expandable format
Highlight legal risks in separate section
Show missing protections list
Allow section toggling (expand/collapse)
5.5 Risk Visualization
Define risk levels:
Low risk
Medium risk
High risk
Display risk badge with color coding
Ensure visual clarity of severity levels
5.6 Reset & Reuse Flow
Add ability to reset analysis
Clear previous results
Allow new contract upload or input
Return to initial state cleanly
PHASE 6 — Lawyer Discovery System
6.1 Lawyer Listing Page
Create lawyer directory page
Load structured lawyer dataset
Display all lawyers in grid format
Ensure responsive card layout
6.2 Search Functionality
Implement search by:
Lawyer name
Specialization keywords
Filter results dynamically as user types
6.3 Filtering System
Add filter dropdowns for:
Legal specialization
Geographic location
Combine filters with search query
Update results instantly on selection
6.4 Lawyer Card Component
Display:
Profile image
Name
Rating
Experience
Location
Specializations
Fee range
Add clickable navigation to full profile page
Highlight featured lawyers visually
6.5 Lawyer Profile Page
Create dynamic route for individual lawyer
Display full profile information:
Biography
Education
Languages
Specializations
Contact details
Add back navigation to directory
Add consultation request button
6.6 Contact System UI
Add clickable phone link
Add clickable email link
Add consultation request action button
Provide user feedback message after interaction
PHASE 7 — Final Polish & Deployment
7.1 Full System Testing
Test landing page navigation flows
Test chat system end-to-end
Test contract review system end-to-end
Test lawyer search and filters
Test lawyer profile pages
Verify mobile responsiveness across all pages
Check console for errors
7.2 Performance & UX Fixes
Optimize page loading speed
Reduce unnecessary re-renders
Ensure smooth scrolling behavior
Fix UI alignment issues
Improve mobile layout spacing
7.3 Deployment Preparation
Install deployment CLI tool
Build production version of application
Configure environment variables for production
Deploy to hosting platform
Verify deployed application works correctly
7.4 Demo Preparation
Prepare scripted walkthrough:
Landing page explanation
Chat system demo
Contract review demo
Lawyer search demo
Prepare sample legal queries
Prepare sample contract input
Ensure smooth storytelling flow for judges
7.5 Final QA Checklist
No broken links
No runtime errors
All pages accessible
API routes functional
Mobile UI usable
AI responses consistent
Deployment successful