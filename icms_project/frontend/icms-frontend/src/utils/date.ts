import { format, parse, isValid, differenceInYears } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PP');
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'p');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPp');
};

export const parseDate = (dateString: string, formatString: string): Date | null => {
  const parsedDate = parse(dateString, formatString, new Date());
  return isValid(parsedDate) ? parsedDate : null;
};

export const calculateAge = (birthDate: string | Date): number => {
  const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  return differenceInYears(new Date(), dateObj);
};

export const isWorkingHour = (time: string | Date, workingHours: { start: string; end: string }): boolean => {
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  const timeString = format(timeObj, 'HH:mm');
  return timeString >= workingHours.start && timeString <= workingHours.end;
};

export const getTimeSlots = (
  start: string,
  end: string,
  duration: number = 30
): string[] => {
  const slots: string[] = [];
  const startTime = parse(start, 'HH:mm', new Date());
  const endTime = parse(end, 'HH:mm', new Date());
  
  let currentTime = startTime;
  while (currentTime <= endTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = new Date(currentTime.getTime() + duration * 60000);
  }
  
  return slots;
};

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
};

export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj > today;
};

export const getWeekDays = (date: Date = new Date()): Date[] => {
  const week: Date[] = [];
  const current = new Date(date);
  current.setDate(current.getDate() - current.getDay());
  
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return week;
};
