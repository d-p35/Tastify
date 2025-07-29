# Database Setup Instructions

## Setting up the Recipe Database Schema

To set up your Supabase database for the Tastify app, follow these steps:

### 1. Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to the "SQL Editor" tab in the left sidebar

### 2. Run the Migration

1. Copy the entire contents of `001_create_recipes_schema.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the migration

This will create all the necessary tables and Row-Level Security policies for your recipe app.

### 3. Tables Created

- **recipes**: Stores recipe data (title, ingredients, steps, macros, video URL)
- **boards**: Stores recipe collections/boards
- **board_recipes**: Many-to-many relationship between boards and recipes
- **board_members**: Manages board sharing and permissions

### 4. Security Features

- Row-Level Security (RLS) is enabled on all tables
- Users can only access their own recipes
- Board access is restricted to owners and invited members
- All operations are secured by authentication

### 5. Indexes

Performance indexes are created for:
- Recipe ownership and creation date
- Board relationships
- Member lookups

The migration is now complete and your app can start storing recipes!
