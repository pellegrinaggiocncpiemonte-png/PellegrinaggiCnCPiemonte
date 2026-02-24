/*
  # Create contact messages table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `cognome_nome` (text) - Full name of the person contacting
      - `email` (text) - Email address
      - `numero_cellulare` (text) - Mobile phone number
      - `messaggio` (text) - The message content
      - `created_at` (timestamptz) - Timestamp when message was sent

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for inserting new messages (public access)
    - Add policy for viewing messages (authenticated admin users only)
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cognome_nome text NOT NULL,
  email text NOT NULL,
  numero_cellulare text NOT NULL,
  messaggio text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);