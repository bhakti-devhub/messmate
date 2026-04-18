# MessMate - Digital Mess Management System

MessMate is a modern, web-based application designed to streamline the operations of a hostel or college mess. It provides a user-friendly interface for both students and managers, simplifying the process of ordering food, providing feedback, and managing the mess menu and operations.

## Key Features

The application is split into two primary roles, each with a dedicated interface and set of features.

### For Students:
- **Weekly Menu Viewing**: Students can view the entire menu for the week, organized by day and meal (Breakfast, Lunch, Dinner).
- **Online Ordering**: Place orders for any meal directly through the app. The interface shows menu items, prices, and serving times.
- **Order History & Live Status**: Students can track the status of their recent orders (e.g., Placed, Preparing, Ready for Pickup, Delivered).
- **Feedback System**: Easily submit detailed feedback for any meal, including a 1-5 star rating and a written comment.
- **Live Announcements**: View real-time announcements posted by the mess manager.
- **QR Code Integration**: Scan QR codes in the mess hall to be taken directly to the feedback form for a specific meal.

### For Managers:
- **Dynamic Menu Management**: Managers can easily update the weekly menu, add or remove items, and the changes are instantly visible to students.
- **Live Order Dashboard**: View all incoming student orders in real-time. The dashboard includes details like student name, meal, and order status.
- **Two-Step Order Fulfillment**: A realistic workflow where managers first "Mark as Ready" and then "Mark as Delivered" to accurately track order progress.
- **"Mark All Delivered"**: A time-saving feature to complete all ready orders in a single click after a meal service.
- **AI-Powered Feedback Analysis**: The app uses AI to automatically summarize all student feedback for a meal, highlighting positive aspects, negative comments, and providing actionable improvement suggestions.
- **Data Export**: Download comprehensive reports for orders and feedback in both PDF and CSV formats for record-keeping.
- **Announcement System**: Post important updates and announcements that are immediately displayed to all students.
- **QR Code Generation**: Generate and print unique QR codes for each meal, making it simple for students to provide targeted feedback.

## Technology Stack

This prototype is built with a modern, robust tech stack:
- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) for the AI-powered feedback summarization.
- **Backend/State**: A mock in-memory state management system to simulate a database for this prototype.
