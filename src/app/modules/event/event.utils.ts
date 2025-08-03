// Utility functions for event module

// Format event date for display
export const formatEventDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Check if event is upcoming
export const isUpcomingEvent = (eventDate: Date): boolean => {
  return new Date(eventDate) > new Date();
};

// Check if event is past
export const isPastEvent = (eventDate: Date): boolean => {
  return new Date(eventDate) < new Date();
};

// Check if event is today
export const isEventToday = (eventDate: Date): boolean => {
  const today = new Date();
  const event = new Date(eventDate);
  return (
    today.getFullYear() === event.getFullYear() &&
    today.getMonth() === event.getMonth() &&
    today.getDate() === event.getDate()
  );
};

const EventUtils = {
  formatEventDate,
  isUpcomingEvent,
  isPastEvent,
  isEventToday,
};

export default EventUtils;