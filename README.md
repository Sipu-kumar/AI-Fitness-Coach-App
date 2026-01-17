🧑‍🏫 Roles in the System

   👤 User
   
      --Register & login
      --Calculate BMI
      -- View BMI history
      --Receive assigned diet plans
      --Follow weekly meal schedules
      --Track progress
      
  🧑‍⚕️ Instructor / Personal Trainer
  
         --View all users
         --View user BMI records
         --Analyze BMI categories
         --Assign diet plans:
         --Weight Loss
         --Weight Gain
         --Maintain Weight
         --Create weekly meal plans
         --Monitor user progress 

   🛠 Tech Stack
   
     ------Frontend
     
           --React (Vite)
           --React Router DOM
           --Axios
           --CSS

  ------Backend
  
           --Node.js
           --Express.js
           --MongoDB
           --Mongoose
           --bcrypt
           --express-session
           --dotenv
-------Database

           --MongoDB (Local)
           --MongoDB Compass

📦 MongoDB Database Design

    Database name:  bmi_calculator

| Collection    | Purpose                                  |
| ------------- | ---------------------------------------- |
| `users`       | Stores user & instructor accounts        |
| `bmis`        | Stores BMI calculations                  |
| `bmirecords`  | Stores BMI history                       |
| `dietplans`   | Stores diet plans created by instructors |

📁 Project Structure

    bmi-no-auth/

        
        ├── backend/
        │   ├── db/
        │   │   └── Connection.js
        │   ├── models/
        │   │   ├── UserSchemas.js
        │   │   ├── BmiSchemas.js
        │   │   └── DietPlanSchema.js
        │   ├── routes/
        │   │   ├── Auth.js
        │   │   ├── UserRoutes.js
        │   │   ├── Bmi.js
        │   │   └── Diet.js
        │   ├── server.js
        │   └── .env
        │
        ├── frontend/
        │   ├── src/
        │   │   ├── Components/
        │   │   ├── Pages/
        │   │   ├── Instructor/
        │   │   └── User/
        │   ├── App.jsx
        │   │── main.jsx
        │   └── vite.config.js
        │
        └── README.md

⚙️ Installation & Setup

     1️⃣ MongoDB Setup (Using Compass)
         1. Install MongoDB Community Server
         2. Open MongoDB Compass
         3. Connect using:
              mongodb://127.0.0.1:27017
    2️⃣ Backend Setup
        cd backend
        npm install

  Create a .env file:
  
      MONGODB_URL=mongodb://127.0.0.1:27017/bmi_calculator
      PORT=5000
      SALT=10
      SESSION_SECRET=supersecret
      
  Start the backend server:
  
      npm start
  Backend will run at:
  
       http://localhost:5000

Backend:

    - cd backend
    - npm install
    - create .env (see .env.example)
    - npm run dev

Frontend:
   
    - cd frontend
    - npm install
    - npm run dev

Backend default Mongo URI: mongodb://127.0.0.1:27017/bmi_calculator

## Instructor Access

The application includes a separate instructor login system with fixed credentials:


**Instructor Login Credentials:**

     - Login ID: `instructor123`
     - Password: `instructor@2024`

**Instructor Features:**

    - Access instructor dashboard at `/instructor-dashboard`
    - View all registered users and their BMI records
    - Monitor user progress and statistics
    - Access detailed BMI history for each user

**Environment Variables (Optional):**
You can customize the instructor credentials by setting these environment variables in your `.env` file:
```
INSTRUCTOR_LOGIN_ID=your_custom_login_id
INSTRUCTOR_PASSWORD=your_custom_password
```

📊 BMI Categories Logic

| BMI Range | Category    |
| --------- | ----------- |
| < 18.5    | Underweight |
| 18.5–24.9 | Normal      |
| 25–29.9   | Overweight  |
| ≥ 30      | Obese       |

Diet plans are assigned based on these categories.


## 🎥 Demo Video

<video src="https://github.com/Sipu-kumar/AI-Fitness-Coach-App/blob/main/videos/demo.mp4" controls width="600"></video>

## 🎥 Demo Video

[![Watch the demo](videos/demo-thumbnail.png)](https://github.com/Sipu-kumar/AI-Fitness-Coach-App/raw/main/videos/demo.mp4)

## 🎥 Demo Video

🎬 [Click here to watch the demo video](https://github.com/Sipu-kumar/AI-Fitness-Coach-App/raw/main/videos/demo.mp4)

## 🎥 Demo Video
(https://sipu-kumar.github.io/AI-Fitness-Coach-App/demo.html)




