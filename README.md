# **LocalFix**

Welcome to **LocalFix**, an on-demand home services platform that connects customers with skilled technicians for various home repair and maintenance services. Book services, track orders in real-time, chat with technicians, and get your home issues fixed conveniently.

---

### **Live Link**
[**LocalFix**](https://localfix.store)
[**new link**](https://github.com/fidhafathima-m/LocalFix)

## **Features**

**For Customers**

- **Service Booking**: Book various home services (electrical, plumbing, carpentry, appliance repair, painting, cleaning)
- **Real-time Tracking**: Live order status updates and technician location tracking
- **In-app Chat**: Direct messaging with assigned technicians
- **Digital Payments**: Secure payment processing with wallet system
- **Service History**: Access complete service records and invoices
- **Real-time Notifications**: Live notifications on order status change, Messages recieved, etc
- **Ratings & Reviews**: Provide feedback on completed services

**For Technicians**

- **Order Management**: Accept/reject service requests and update order status
- **Earnings Tracking**: Monitor commissions and earnings
- **In-app Chat**: Direct messaging with customers
- **Schedule Management**: Manage availability and appointments
- **Spare Parts Management**: Manage availability and appointments
- **Real-time Notifications**: Live notifications on order status change, Messages recieved, etc
- **Performance Analytics**: Track ratings and service metrics
- **Subscriptions**: Can subscribe and get specified percent commission

---

## **Technologies Used**

### **Frontend**

- **React.js**: Frontend library for building user interfaces.
- **Typescript**: Type-safe development.
- **React Router DOM**: For client-side routing.
- **Redux**: State management for the application.
- **React Hook Form**: Form handling and validation.
- **Zod**: Schema validation for forms.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Axios**: HTTP client for API requests.
- **Socket.IO**: Real-time communication.

### **Backend**

- **Node.js**: JavaScript runtime for the backend.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: MongoDB object modeling for Node.js.
- **JWT (JSON Web Tokens)**: Authentication and authorization.
- **Socket.IO**: Real-time bidirectional communication.
- **Repository Pattern**: Architecture for separating business logic and data access.
- **Razorpay**: Payment gateway integration.

### **Dev Tools**

- **ESLint**: Linting for code quality.
- **Prettier**: Code formatting.
- **Vite**: Frontend build tool.

---

## **Project Structure**

The project is divided into two main folders:

1. **Frontend**: Contains the React.js application.
2. **Backend**: Contains the Node.js and Express.js server.

[**Project overview**](https://nasal-raja-dfa.notion.site/LocalFix-Home-Service-Platform-2ba6183df10580daa519d7fd9b71db0a)

[**API Documentation**](https://documenter.getpostman.com/view/40363601/2sB3dLUC23)

[**DB Design**](https://app.eraser.io/workspace/dOyxlXu4HKbhnxPfnlm6?origin=share&elements=Dkhw3lJZTSVOKPr8Q-ILFQ)

[**Figma Design**](https://www.figma.com/design/GAqT6yf2JkGHa0WO56fHdI/LocalFix?node-id=0-1&t=vGDBX1xSeYf20Yp9-1)

---

## **Getting Started**

### **Prerequisites**

- **Node.js**: Make sure you have Node.js installed on your machine.
- **MongoDB**: Ensure MongoDB is installed and running.
- **Razorpay Account**: Create a Razorpay account for payment processing.

### **Setup Instructions**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/fidhafathima-m/LocalFix.git
   cd LocalFix
   ```

2. **Set Up the Backend**

   - Navigate to the `backend` folder:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Use the `.env.example` file to create your `.env` file:

     ```env
     # Server Configuration
     PORT=5000
     CLIENT_URL=http://localhost:5173

     # Database Configuration
     MONGO_URI=mongodb://localhost:27017/LocalFix

     # Authentication Secrets
     ACCESS_TOKEN_SECRET=your_access_token_secret
     REFRESH_TOKEN_SECRET=your_refresh_token_secret

     # Environment Mode
     NODE_ENV=development

     # Google OAuth Credentials
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret

     # Email Configuration
     USER_EMAIL=your_email@example.com
     APP_PASSWORD=your_email_app_password

     # Stripe Configuration
     RAZORPAY_SECRET_KEY=your_razorpay_secret_key
     ```

   - Run the backend server:
     ```bash
     npm run dev
     ```

3. **Set Up the Frontend**

   - Navigate to the `frontend` folder:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Use the `.env.example` file to create your `.env` file:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api
     ```
   - Run the frontend application:
     ```bash
     npm run dev
     ```

4. **Access the Application**
   - Open your browser and go to `http://localhost:5173` to access the frontend.
   - The backend API will be running on `http://localhost:5000/api`.

---

## **Key Features in Detail**

### **Service Booking Workflow**

- Customer selects service type and technician and describes the problem according to technician's availability
- Technician accepts/rejects the service request
- Real-time tracking of technician location and ETA
- In-app communication between customer and technician
- Service completion with digital payment and rating

### **Real-time Communication**

- WebSocket-based chat system for customer-technician communication
- Live typing indicators and message read receipts
- Real-time order status updates
- Live location sharing for technician tracking

### **Subscription**

- Technicians can choose a subscription plan added by admin and pay for it
- Unsubscribed technicians needs to share 10% of their earning with the platform
- Subscribed (if basic plan, 5%), will get more earnings than unsubscribed.

### **Payments**

- Subscriptions and payments are handled securely using **Razorpay**.

---

## **Contributing**

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to the branch.
4. Submit a pull request.

---

## **Acknowledgements**

- **Tailwind CSS**: For making styling a breeze.
- **Razorpay**: For seamless payment integration.

---

## **Contact**

For any questions or feedback, feel free to reach out:

- **Email**: fidhumusthafa3549@gmail.com
- **GitHub**: [fidhafathima](https://github.com/fidhafathima-m)

---

Enjoy exploring **LocalFix**! ✨
