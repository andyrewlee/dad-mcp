INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('private-outputs', 'private-outputs', FALSE, 50 * 1024 * 1024, ARRAY['image/png', 'video/mp4'])
ON CONFLICT (id)
  DO NOTHING;

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('public-outputs', 'public-outputs', TRUE, 50 * 1024 * 1024, ARRAY['image/png', 'video/mp4'])
ON CONFLICT (id)
  DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public-outputs bucket" ON storage.objects
  FOR SELECT
    USING (bucket_id = 'public-outputs');

CREATE POLICY "Allow viewing own files in private-outputs bucket" ON storage.objects
  FOR SELECT TO authenticated
    USING (bucket_id = 'private-outputs'
      AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated uploads to both public-outputs and private-outputs bucket" ON storage.objects
  FOR INSERT TO authenticated
    WITH CHECK ((bucket_id = 'private-outputs' OR bucket_id = 'public-outputs')
    AND (storage.foldername(name))[1] =(
      SELECT
        auth.uid()::text));

CREATE POLICY "Allow deleting own files in private-outputs and public-outputs bucket" ON storage.objects
  FOR DELETE TO authenticated
    USING ((bucket_id = 'private-outputs' OR bucket_id = 'public-outputs')
      AND (storage.foldername(name))[1] = auth.uid()::text);
