const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export function hasCloudinaryConfig() {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadMedia(file, { uid = '', kind = 'post' } = {}) {
  if (!file) throw new Error('Chưa chọn tệp.');
  if (!hasCloudinaryConfig()) {
    throw new Error('Thiếu cấu hình Cloudinary. Hãy điền VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  form.append('folder', `facebook-clone/${kind}/${uid || 'public'}`);
  form.append('use_filename', 'true');
  form.append('unique_filename', 'true');
  form.append('resource_type', 'auto');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: form
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || 'Tải tệp thất bại.');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    mediaType: data.resource_type === 'video' ? 'video/mp4' : (file.type || data.resource_type || 'image/jpeg'),
    bytes: data.bytes,
    format: data.format,
    width: data.width,
    height: data.height
  };
}
