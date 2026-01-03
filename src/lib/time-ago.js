export function getTimeAgo(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return { amount: diffInSeconds, unit: 'second' };
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return { amount: diffInMinutes, unit: 'minute' };
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return { amount: diffInHours, unit: 'hour' };
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return { amount: diffInDays, unit: 'day' };
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return { amount: diffInMonths, unit: 'month' };
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return { amount: diffInYears, unit: 'year' };
}

export function formatTimeAgo(dateString) {
  const timeAgo = getTimeAgo(dateString);
  if (!timeAgo) return '';
  
  const { amount, unit } = timeAgo;
  return `${amount} ${unit}${amount > 1 ? 's' : ''}`;
}
