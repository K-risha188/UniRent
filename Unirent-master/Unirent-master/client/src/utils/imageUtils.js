export const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${url}`;
};
