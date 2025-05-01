# URL Shortener With Passcode Protection

A modern, scalable URL shortening service built with Node.js, Express, MongoDB, and Redis.

## Features
- Shorten long URLs to easily shareable links
- Optional 5-digit passcode protection for URLs
- Modern, responsive React frontend
- Click tracking for shortened URLs
- Copy-to-clipboard functionality
- Real-time URL validation
- MongoDB for persistent storage
- Redis caching for improved performance
- Express.js backend API

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Redis for caching
- ShortID for URL generation
- Dotenv for configuration

### Frontend
- React
- Modern UI with CSS3
- Responsive design
- Client-side validation

## Installation

1. Clone the repository:
```bash
git clone <repository-url>cd urlshortener
Install backend dependencies:
bash
Run
cd backendnpm install
Install frontend dependencies:
bash
Run
cd ../frontendnpm install
Create a .env file in the backend directory:
plaintext

MONGODB_URI=mongodb://localhost:27017/urlshortenerPORT=5000
Running the Application
Start the backend server:
bash
Run
cd backendnode server.js
Start the frontend development server:
bash
Run
cd frontendnpm start
The application will be available at:

Frontend: http://localhost:3000
Backend API: http://localhost:5000
API Endpoints
POST /api/shorten
Creates a shortened URL

Request body:

json

{  "url": "https://example.  com",  "passcode": "12345" //   Optional}
Response:

json

{  "originalUrl": "https://  example.com",  "shortUrl": "abc123",  "clicks": 0}
GET /:shortUrl
Redirects to the original URL (with optional passcode verification)

Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the ISC License - see the LICENSE file for details.

Acknowledgments
Built with Create React App
Uses MongoDB for database
Express.js for backend API
ShortID for URL generation