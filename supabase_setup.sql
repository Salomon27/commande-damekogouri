CREATE TABLE IF NOT EXISTS commandes (
    id BIGSERIAL PRIMARY KEY,
    numero_client TEXT NOT NULL,
    montant DECIMAL(12, 2) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commandes_created_at ON commandes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commandes_numero_client ON commandes(numero_client);

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON commandes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON commandes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON commandes
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON commandes
    FOR DELETE USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos-commandes', 'photos-commandes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'photos-commandes');

CREATE POLICY "Allow public access" ON storage.objects
    FOR SELECT USING (bucket_id = 'photos-commandes');

CREATE POLICY "Allow public updates" ON storage.objects
    FOR UPDATE USING (bucket_id = 'photos-commandes');

CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE USING (bucket_id = 'photos-commandes');

