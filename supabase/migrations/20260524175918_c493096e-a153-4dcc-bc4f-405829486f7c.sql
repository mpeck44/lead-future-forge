
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-images',
  'lesson-images',
  true,
  5242880,
  array['image/png','image/jpeg','image/jpg','image/gif','image/webp','image/svg+xml']
);

create policy "Lesson images are publicly readable"
on storage.objects for select
using (bucket_id = 'lesson-images');

create policy "Admins can upload lesson images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'lesson-images' and has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update lesson images"
on storage.objects for update
to authenticated
using (bucket_id = 'lesson-images' and has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete lesson images"
on storage.objects for delete
to authenticated
using (bucket_id = 'lesson-images' and has_role(auth.uid(), 'admin'::app_role));
