# SafeVoice

SafeVoice is a secure, real-time **anonymous communication platform** designed to help people report sensitive issues without fear of exposure.  


## Features
-  **End-to-End Encryption** – all messages remain private.  
-  **Complete Anonymity** – no personal data collected or stored.  
-  **Real-Time Chat** – instant messaging with typing indicators.  
-  **Multi-Use** – ideal for schools, workplaces, healthcare, NGOs, churches, and more.  
-  **Admin Dashboard** – manage reports and respond effectively.  


##  Technology Stack
**Frontend**  
- React.js  
- Redux  
- SASS  
- Socket.io  

**Backend**  
- Node.js  
- Express.js  
- JWT Authentication  
- WebRTC  

**Database & Infrastructure**  
- Mongodb 
- Redis  


##  Project Structure

safevoice/ ├── frontend/   # React app ├── backend/    # Node.js + Express + Socket.io server


##  Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/isrlchigozie/safevoice.git
cd safevoice

2. Frontend Setup

cd frontend
npm install
npm start

3. Backend Setup

cd backend
npm install
npm run dev

4. Environment Variables

Create a .env file in the backend folder:

DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key



Deployment

Frontend: Vercel

Backend: Vercel 

Database: mongodb

Cache: Upstash (Redis)




Status

Completed – fully functional and deployed.




Author
Li
Royalty|Firebird 

