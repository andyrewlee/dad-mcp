INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('private-assets', 'private-assets', FALSE, 50 * 1024 * 1024, ARRAY['image/png', 'video/mp4'])
ON CONFLICT (id)
  DO NOTHING;

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('public-assets', 'public-assets', TRUE, 50 * 1024 * 1024, ARRAY['image/png', 'video/mp4'])
ON CONFLICT (id)
  DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public-assets bucket" ON storage.objects
  FOR SELECT
    USING (bucket_id = 'public-assets');

CREATE POLICY "Allow viewing own files in private-assets bucket" ON storage.objects
  FOR SELECT TO authenticated
    USING (bucket_id = 'private-assets'
      AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated uploads to both public-assets and private-assets bucket" ON storage.objects
  FOR INSERT TO authenticated
    WITH CHECK ((bucket_id = 'private-assets' OR bucket_id = 'public-assets')
    AND (storage.foldername(name))[1] =(
      SELECT
        auth.uid()::text));

CREATE POLICY "Allow deleting own files in private-assets and public-assets bucket" ON storage.objects
  FOR DELETE TO authenticated
    USING ((bucket_id = 'private-assets' OR bucket_id = 'public-assets')
      AND (storage.foldername(name))[1] = auth.uid()::text);
