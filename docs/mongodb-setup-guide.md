# MongoDB Atlas Setup Guide - J.P. College of Engineering ERP

Follow these steps to connect your MongoDB Atlas Cloud database to the ERP application:

## 1. Create a MongoDB Atlas Cluster
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create a Deployment** and select the **FREE Shared Cluster (M0)**.
3. Choose your nearest cloud provider region (e.g. AWS Mumbai/Singapore).

## 2. Configure Database User & Access Controls
1. Go to **Database Access** under Security.
2. Click **Add New Database User**.
3. Set Authentication Method to **Password**.
4. Create a username (e.g., `jpadmin`) and a secure password.
5. Set Database User Privileges to **Read and write to any database**.

## 3. Configure Network Access (IP Whitelist)
1. Go to **Network Access** under Security.
2. Click **Add IP Address**.
3. For deployment on Vercel or cloud environments, select **Allow Access from Anywhere (`0.0.0.0/0`)**.

## 4. Obtain Connection String
1. Return to **Database Deployments** and click **Connect**.
2. Select **Drivers (Node.js)**.
3. Copy the Connection String URI. It will look like:
   `mongodb+srv://jpadmin:<password>@cluster0.mongodb.net/jpcollege_erp?retryWrites=true&w=majority`
4. Replace `<password>` with your actual database user password.

## 5. Set Environment Variable
Add the connection string to your `.env` or Vercel Environment Variables:
```env
MONGODB_URI=mongodb+srv://jpadmin:YourPassword123@cluster0.mongodb.net/jpcollege_erp?retryWrites=true&w=majority
```

When connected, the backend will **automatically seed initial sample data** for departments, faculty, students, courses, attendance, and settings!
