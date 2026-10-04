# To-Do webpage

> A soft, dreamy, and adorable todo app. 

A modern single-page task manager with a pastel aesthetic and smooth animations.

---

## Features

- Add, edit, and delete tasks
- Mark tasks complete with a satisfying animation
- Filter by **All**, **Active**, or **Done**
- Set due date & time
- Set priority (Low / Medium / High)
- Add tags to organize tasks
- Progress bar with a cute buddy emoji that evolves
- Dark & light mode toggle
- Typing animation on the header title
- [EARLIER VER.] Auto-saves to local storage
- [NEW VER.] Saves in MySQL database through PHP.
- Fully responsive

---
## Setup

1. Install PHP and MySQL.
2. Create the database and tables:

```sql
CREATE DATABASE IF NOT EXISTS todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_db;

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(40) PRIMARY KEY,
  position INT NOT NULL,
  title TEXT NOT NULL,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  due_date VARCHAR(32) NULL,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  tags TEXT NULL,
  created_at VARCHAR(40) NULL
);

CREATE TABLE IF NOT EXISTS meta (k VARCHAR(40) PRIMARY KEY);
```

3. Copy `config.example.php` to `config.php` and enter your MySQL username and password.
4. In the project folder, start the PHP server:

```
php -S localhost:8000
```

5. Open http://localhost:8000/ in your browser.
   
## Live Demo

https://mone-esha.github.io/To-Do-webpage/

| File | Purpose |
|---|---|
| `index.php` 
| `style.css` 
| `script.js` 
| `storage.js` 
| `api.php` 
| `database.php` 
| `config.example.php` 

## Built With

HTML5, CSS3 (custom properties, animations), Vanilla JavaScript, PHP

Google Fonts (Fredoka, Quicksand) · Font Awesome

MySQL
