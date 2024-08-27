# FlexiTask

FlexiTask is a dynamic scheduling application designed to adapt to your busy life. Never miss a task again—our app automatically rearranges your schedule to fit your changing priorities.

## Features

- **Intelligent Scheduling**: Automatically adjusts your tasks based on priority and time constraints.
- **Real-time Updates**: Instantly sync changes across devices.
- **Customizable Notifications**: Set reminders that work for you.
- **User-friendly Interface**: Intuitive design for easy task management.
- **Dark Mode**: Comfortable viewing in any lighting condition.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/flexitask.git
   ```

2. Install dependencies for both frontend and backend:
   ```
   cd flexitask/frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory and add:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```
   cd backend && npm start
   ```

5. Start the frontend application:
   ```
   cd frontend && npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Register for an account or log in.
2. Add tasks to your schedule.
3. Set priorities and deadlines for your tasks.
4. Let FlexiTask optimize your schedule.
5. Receive notifications for upcoming tasks.

## API Endpoints

The backend provides several API endpoints for task management:

- `POST /api/tasks`: Create a new task
- `GET /api/tasks`: Retrieve all tasks
- `PUT /api/tasks/:id`: Update a specific task
- `DELETE /api/tasks/:id`: Delete a specific task

For more details, refer to the API documentation in the backend code.

## Authentication

FlexiTask uses JWT for authentication. Refer to the auth routes in the backend for more information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- React Scheduler component by @aldabil
- Material-UI for the sleek design components
