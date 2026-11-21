CREATE TABLE neighborhoods (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO neighborhoods (name) VALUES ('Lakeside'), ('Old Town'), ('Hillcrest'), ('Harbour');

CREATE TABLE properties (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100),
  neighborhood_id INTEGER NOT NULL REFERENCES neighborhoods (id),
  type TEXT NOT NULL CHECK (type IN ('Apartment', 'Villa', 'Townhouse', 'Studio')),
  price INTEGER NOT NULL CHECK (price BETWEEN 1 AND 100000000),
  beds SMALLINT NOT NULL CHECK (beds BETWEEN 1 AND 10),
  baths SMALLINT NOT NULL CHECK (baths BETWEEN 1 AND 10),
  area INTEGER NOT NULL CHECK (area BETWEEN 1 AND 100000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  owner_name TEXT NOT NULL CHECK (char_length(owner_name) BETWEEN 1 AND 100),
  owner_email TEXT NOT NULL CHECK (char_length(owner_email) BETWEEN 3 AND 254),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_status_created ON properties (status, created_at DESC);
CREATE INDEX idx_properties_neighborhood ON properties (neighborhood_id);

CREATE TABLE property_vibes (
  property_id BIGINT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  vibe TEXT NOT NULL CHECK (vibe IN (
    'Sunlit mornings', 'Quiet street', 'Work-from-home ready', 'Pet friendly', 'Great for hosting'
  )),
  PRIMARY KEY (property_id, vibe)
);

CREATE TABLE property_photos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 6),
  file TEXT NOT NULL,
  UNIQUE (property_id, position)
);

CREATE TABLE enquiries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties (id),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enquiries_property ON enquiries (property_id);
CREATE INDEX idx_enquiries_created ON enquiries (created_at DESC);

CREATE TABLE contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  topic TEXT NOT NULL CHECK (topic IN ('Buying a home', 'Listing a property', 'Something else')),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_created ON contact_messages (created_at DESC);

CREATE TABLE admins (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 3 AND 254),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);