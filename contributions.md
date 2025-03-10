# 🤝 Contributions Guide

We welcome contributions from the community to enhance the **2D Metaverse Workspace Platform**. Below are some areas where you can contribute:

## 🚀 What Can Be Done?

### 1️⃣ **Feature Enhancements**

- **Room Management** 🏠

  - Create intuitive UI for room creation and customization
  - Develop room discovery and browsing functionality
  - Implement room templates and quick-start options
  - Add room access controls (public, private, password-protected)

- **Avatar System** 👤

  - Design avatar selection and customization interface
  - Create additional avatar options beyond the default circle
  - Add avatar animations for different actions (talking, idle, etc.)
  - Implement avatar persistence across sessions

- **Map Development** 🗺️

  - Build map editor for admins to create new environments
  - Design diverse map templates (office, classroom, park, etc.)
  - Add collision detection for walls and obstacles
  - Implement map zones with different properties (quiet zones, presentation areas)

- **Interactive Elements** 🖥️

  - Create draggable and placeable objects for workspaces
  - Develop shared whiteboards with real-time collaboration
  - Add file sharing capabilities within the workspace
  - Implement screen sharing and presentation tools

- **WebRTC Optimization** 📡

  - Develop proximity-based audio (audio fades with distance)
  - Add video quality adjustment based on bandwidth
  - Implement selective streaming based on visibility and proximity
  - Create UI controls for audio/video settings

- **User Interface** 🎨
  - Design intuitive movement controls beyond keyboard (click-to-move, touch)
  - Create minimap for navigation in larger spaces
  - Develop contextual menus for interaction with objects and users
  - Add accessibility features for various input methods

### 2️⃣ **Bug Fixes**

- Identify and resolve UI/UX issues 🛠️
- Improve real-time communication via WebSockets and WebRTC 🌐
- Optimize database queries for better performance ⚡
- Address browser compatibility issues 🌍
- Fix connection handling and reconnection strategies 🔄

### 3️⃣ **Documentation Improvements**

- Create comprehensive setup guide for local development 📖
- Document WebRTC implementation details and architecture 📱
- Add API documentation with examples for room management, user authentication, and real-time events ✍️
- Develop user guide for end-users of the platform 📚
- Document admin features for map and element creation 👑

### 4️⃣ **Testing**

- **Frontend Tests** 🖼️

  - Create unit tests for React components
  - Develop E2E tests for user flows (room joining, moving, interaction)
  - Test across different browsers and screen sizes
  - Validate WebRTC connection handling

- **Backend Tests** ⚙️

  - Add unit tests for API endpoints
  - Create integration tests for room creation and management
  - Test WebSocket event handling and broadcasting
  - Validate authentication and authorization flows

- **Performance Testing** ⚡
  - Test scalability with many concurrent users
  - Measure and optimize WebRTC connection establishment
  - Profile rendering performance with many avatars and elements
  - Benchmark database query performance

### 5️⃣ **WebRTC Enhancements**

- Implement connection state management and recovery 🔁
- Add signaling server improvements for faster connections 🚀
- Create bandwidth adaptation for different network conditions 📶
- Develop audio processing for noise cancellation and echo reduction 🔊
- Add screen sharing and selective stream capabilities 📺

### 6️⃣ **Admin Tools**

- Build admin dashboard for monitoring active spaces 📊
- Create tools for map creation and editing 🗺️
- Develop element library management interface 🧩
- Add user management and moderation capabilities 👮
- Implement analytics for usage patterns and performance metrics 📈

---

## 🛠 Writing Tests for the API

To maintain high-quality API functionality, follow these steps when writing tests:

- Locate the **Postman collection** in the root folder of the repository.
- **Import** this collection into Postman to access all available API endpoints.
- Write test cases for the API using Postman's built-in test scripts.
- After adding tests, **export** the updated Postman collection.
- Replace the existing `postmanCollection.json` file in the repository with your updated version.
- Submit a pull request with your changes.

## 📱 Frontend Testing Guidelines

When contributing to the frontend, please include appropriate tests:

- Use Jest for unit testing React components
- Implement React Testing Library for component interaction tests
- For E2E testing, use Cypress to simulate user journeys
- Ensure tests cover critical paths (authentication, room joining, movement, interaction)
- Include accessibility tests to ensure the platform is usable by everyone

## 🔄 WebRTC Implementation

When working on WebRTC features:

- Follow the established connection architecture
- Test in multiple browsers to ensure compatibility
- Add appropriate error handling and reconnection logic
- Document any changes to the signaling protocol
- Optimize for performance and bandwidth efficiency
