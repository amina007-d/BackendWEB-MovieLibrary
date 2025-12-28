# Movie Library

A simple web application for organizing, tracking, and discovering movies. Users will be able to add films, browse their personal collection, and plan what to watch next.

## Team Members

- Amina Dossan — Group-2422
- Yerassyl Alimbek — Group-2422
- Nazerke Abdizhamal — Group-2422
- Almat Zhamsat — Group-2422

## Project Topic Explanation

Movie Library is a basic web application built with Node.js and Express.js that allows users to create their own movie collection. The goal of this app is to let users store movie information (title, genre, rating, year), save favorite movies, search and filter through the library, and track what they have already watched.

This project will gradually expand each week following the course structure.

## Installation & Run Instructions

Clone the repository:

``` bash
git clone https://github.com/amina007-d/BackendWEB-MovieLibrary.git
```
Navigate into the project folder:

``` bash
cd MovieLibrary
```
Install dependencies:

``` bash
npm install
```
Start the Express server:
``` bash
node server.js
``` 

Open the app in your browser:
``` bash
http://localhost:3000
```

## Available Routes

The application currently supports the following routes:

- GET /  
  Displays the Home page (landing page of the Movie Library project).

- GET /about  
  Displays the About page with team and project information.

- GET /contact  
  Displays the Contact page with a form for user messages.

- POST /contact  
  Handles the contact form submission and returns a confirmation message to the user.

- 404 Page  
  Any undefined route will display a custom 404 – Page Not Found page.

---

## Contact Form Details

The Contact page contains a form that allows users to send a message to the server.

### Form Fields
- Name (text input)
- Email (email input)
- Message (textarea)

### Form Behavior
- Uses the POST method  
- Sends data to /contact  
- Client-side validation using HTML required attributes  
- After submission, the user receives a styled confirmation message  

This feature demonstrates basic form handling in Express.js using the express.urlencoded() middleware.

---

---
## Assignment 2 – Part 1: Implemented Features (Weeks 3–4)

As part of **Assignment 2 – Part 1**, the following server-side request handling features were implemented using **Express.js**:

### Middleware

- **express.urlencoded({ extended: true })**  
  Used to parse form data sent via POST requests.

- **Custom Logger Middleware**  
  Logs each incoming request’s HTTP method and URL to the console.

### Routes

- **GET /**  
  Home page with navigation links to other pages.

- **GET /search?q=**  
  Demonstrates usage of **query parameters**.  
  Returns a response based on the provided search query.

- **GET /item/:id**  
  Demonstrates usage of **route parameters**.  
  Displays information based on the item ID.

- **POST /contact**  
  Handles form submission from the Contact page and saves user messages to a JSON file on the server.

- **GET /api/info**  
  Returns project information in **JSON format** by reading data from a separate JSON file (`project-info.json`).

---

## How to Run the Project

Install dependencies:

```bash
npm install

## Roadmap (According to Course Syllabus)

### Week 1 — Project Setup & Introduction

- Introduction to Web Technologies 2 course
- Set up study environment & editors
- Create project folders (public/, views/)
- Build landing page and basic Express server
- Commit to GitHub

### Week 2 — Backend Basics with Express

- Introduction to backend development
- Learn Express.js basics
- Understand components of backend architecture
- Introduction to MVC concept
- Add new routes/pages in your Movie Library (e.g., /add, /list)

### Week 3 — Server-Side Logic

- Handling HTTP requests and responses
- Working with POST forms
- Implement "Add Movie" form → save submitted data temporarily (array/in-memory)
- Display the list of movies on /movies

### Week 4 — Working With APIs

- Understand what APIs are and how they work
- Fetch external API data (e.g., OMDb API for movies)
- Work with JSON responses
- Optional: add "Search Movie" using an external movie API

### Week 5 — SQL Databases

- Database fundamentals
- Entity Relationship Modeling (ERM)
- Implement CRUD operations (Create, Read, Update, Delete)
- Connect your project to SQL (PostgreSQL recommended)
- Store movies in the database instead of arrays

### Week 6 — NoSQL & MongoDB

- Introduction to NoSQL databases
- Work with MongoDB
- Data modeling, collections & documents
- Implement MongoDB version of CRUD
- Optional: switch your Movie Library fully to MongoDB

### Week 7 — Deployment & Git

- Learn hosting & deployment process
- Deploy your Movie Library to a platform like Render/Heroku
- Improve Git usage: branches, merging, pull requests
- Team collaboration workflow

### Week 8 — Building RESTful APIs

- Understand REST principles
- Build your own REST API for movies
  - GET all movies
  - POST new movie
  - PUT/PATCH to update
  - DELETE to remove
- Test your API using Postman

### Week 9 — Authentication & Security

- Learn authentication basics
- Implement local login (sessions or JWT)
- Hashing & salting passwords
- Cookies & session security
- Restrict movie editing routes to logged-in users

### Week 10 — Security Hardening & Final Improvements

- Implement two-factor authentication (if required)
- Secure API endpoints
- Prevent SQL injection
- Secure file uploads (movie posters)
- Final project polishing & preparation for defense