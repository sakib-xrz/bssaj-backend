"use strict";
// Utility functions for event module
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventToday = exports.isPastEvent = exports.isUpcomingEvent = exports.formatEventDate = void 0;
// Format event date for display
const formatEventDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
exports.formatEventDate = formatEventDate;
// Check if event is upcoming
const isUpcomingEvent = (eventDate) => {
    return new Date(eventDate) > new Date();
};
exports.isUpcomingEvent = isUpcomingEvent;
// Check if event is past
const isPastEvent = (eventDate) => {
    return new Date(eventDate) < new Date();
};
exports.isPastEvent = isPastEvent;
// Check if event is today
const isEventToday = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    return (today.getFullYear() === event.getFullYear() &&
        today.getMonth() === event.getMonth() &&
        today.getDate() === event.getDate());
};
exports.isEventToday = isEventToday;
const EventUtils = {
    formatEventDate: exports.formatEventDate,
    isUpcomingEvent: exports.isUpcomingEvent,
    isPastEvent: exports.isPastEvent,
    isEventToday: exports.isEventToday,
};
exports.default = EventUtils;
