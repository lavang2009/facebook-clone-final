const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export function hasCloudinaryConfig() {
  return Boolean(cloudName && uploadPreset);
}

export async function uploadMedia(file, { uid = '', kind = 'post' } = {}) {
  if (!file) throw new Error('Chưa chọn tệp.');
  if (!hasCloudinaryConfig()) {
    throw new Error('Thiếu cấu hình Cloudinary.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  // ❌ QUAN TRỌNG: bỏ mấy dòng gây lỗi
  // KHÔNG gửi:
  // form.append('use_filename', 'true');
  // form.append('unique_filename', 'true');
  // form.append('resource_type', 'auto');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`, // ⚠️ FIX: bỏ /auto
    {
      method: 'POST',
      body: form
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data?.error?.message || 'Upload thất bại');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    mediaType: data.resource_type === 'video' ? 'video/mp4' : 'image/jpeg'
  };
}
