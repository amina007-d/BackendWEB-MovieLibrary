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