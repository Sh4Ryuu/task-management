# Task Management App

A modern, feature-rich task and project management mobile application built with React Native and Expo. Manage your projects, track tasks, visualize timelines with Gantt charts, and stay organized with dependency tracking and progress monitoring.

## ✨ Features

### 📁 Project Management
- **Create & Edit Projects**: Full CRUD operations for projects
- **Project Status Tracking**: Planning, Active, On-Hold, and Completed statuses
- **Color-Coded Projects**: Custom color themes for visual organization
- **Progress Tracking**: Automatic progress calculation based on task completion

### ✅ Task Management
- **Task Creation & Editing**: Comprehensive task management with all details
- **Task Status**: To Do, In Progress, and Completed states
- **Priority Levels**: Low, Medium, and High priority classification
- **Date Management**: 
  - Native date pickers for easy date selection
  - Automatic validation ensuring task dates fall within project date ranges
  - Start and end date tracking

### 🔗 Task Dependencies
- **Dependency System**: Link tasks to show dependencies
- **Visual Dependency Lines**: Arrows and lines in timeline view showing task relationships
- **Automatic Progress Calculation**: For in-progress tasks with dependencies, progress is automatically calculated based on completed dependencies
- **Manual Progress Control**: For tasks without dependencies, manually set progress percentage (0-100%)

### 📊 Timeline & Gantt Chart
- **Interactive Gantt Chart**: Visual timeline representation of all tasks
- **Status-Based Colors**: 
  - 🟢 Green for completed tasks
  - 🟡 Yellow/Orange for in-progress tasks
  - ⚪ Gray for to-do tasks
- **Project Filtering**: 
  - Global view showing all projects
  - Filter by specific project
  - Easy toggle between views
- **Time Period Views**: Week, Month, and Quarter views
- **Dependency Visualization**: Visual arrows connecting dependent tasks

### 💾 Data Persistence
- **Local Storage**: All data persisted using AsyncStorage
- **Offline Support**: Full functionality without internet connection
- **Automatic Sync**: Data automatically saved on changes

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, can use npx)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Or Expo Go app on your physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sh4Ryuu/task-management.git
   cd task-management
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   > Note: Using `--legacy-peer-deps` is required due to some peer dependency conflicts with React.

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device/simulator**
   - **iOS Simulator**: Press `i` in the terminal (requires Xcode on macOS)
   - **Android Emulator**: Press `a` in the terminal (requires Android Studio)
   - **Physical Device**: 
     - Install the Expo Go app
     - Scan the QR code with:
       - iOS: Camera app
       - Android: Expo Go app

## 📱 Usage

### Creating a Project
1. Tap the **+** button on the home screen
2. Fill in project details:
   - Title (required)
   - Description (optional)
   - Start and end dates (using date pickers)
   - Status
   - Color theme
3. Tap **Save**

### Creating a Task
1. Open a project
2. Tap the **+** button (FAB)
3. Fill in task details:
   - Title (required)
   - Description (optional)
   - Start and end dates (validated against project dates)
   - Priority level
   - Status
   - Dependencies (optional - select from other tasks in the project)
4. Tap **Save**

### Editing Projects/Tasks
- **Projects**: Long-press (hold for 2.5 seconds) on a project card to access edit/delete options
- **Tasks**: Tap the edit icon in the task detail screen

### Managing Task Progress
- **With Dependencies**: Progress automatically updates as dependencies are completed
- **Without Dependencies**: 
  1. Edit the task
  2. Set status to "In Progress"
  3. Use the progress slider or input field to set percentage (0-100%)

### Viewing Timeline
1. Navigate to the **Timeline** tab
2. Use the filter button to view:
   - All projects (global view)
   - Specific project
3. Switch between Week, Month, and Quarter views
4. See dependency relationships with visual arrows

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5
- **Development Platform**: Expo 54.0.30
- **Routing**: Expo Router 6.0.21
- **State Management**: Zustand 5.0.2 + React Query 5.83.0
- **Storage**: AsyncStorage 2.2.0
- **UI Components**: 
  - Lucide React Native (icons)
  - Expo Linear Gradient
  - React Native Community DateTimePicker
- **Language**: TypeScript 5.9.2


## 👤 Author

**Sh4Ryuu**
- GitHub: [@Sh4Ryuu](https://github.com/Sh4Ryuu)

## 🐛 Known Issues

- Some peer dependency warnings with React 19 (resolved with `--legacy-peer-deps`)
- Date picker behavior may vary slightly between iOS and Android

## 🔮 Future Enhancements

- [ ] Team collaboration features
- [ ] Cloud sync
- [ ] Notifications and reminders
- [ ] Task templates
- [ ] Export/import functionality
- [ ] Dark mode support
- [ ] Advanced filtering and search
- [ ] Task comments and attachments

## 📞 Support

If you encounter any issues or have questions, please open an issue on [GitHub](https://github.com/Sh4Ryuu/task-management/issues).

---

Made with ❤️ using React Native and Expo

